#!/usr/bin/env node
// 发布前 Action 端到端演练（M3-1 验收辅助）。
//
// 目的：在不修改本仓 CI、不真正发布 Action 的前提下，验证「消费者仓库视角」的
// 行为——即 Action 入口在真实 runner 环境变量下能否把 inputs 正确转成 CLI 参数、
// 把结果正确写进 GITHUB_OUTPUT、并把退出码原样透传。
//
// 用法：
//   node scripts/action-rehearsal.mjs                    # 用仓库内置 fixture 演练
//   node scripts/action-rehearsal.mjs --path <项目目录> --type <类型>
//   node scripts/action-rehearsal.mjs --expect-exit 0|1|2
//
// 退出码：本脚本自身失败返回 2（环境/用法错误）；演练结果与被测 Action 的退出码
// 不一致时返回 1；一致时返回 0。CI 中可据此作为发布前门禁。

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(repoRoot, "scripts", "action-entry.mjs");

function parseArgs(argv) {
  const out = { path: null, type: null, expectExit: null, strict: false, review: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--path") out.path = argv[++i];
    else if (a === "--type") out.type = argv[++i];
    else if (a === "--review") out.review = argv[++i];
    else if (a === "--strict") out.strict = true;
    else if (a === "--expect-exit") out.expectExit = Number(argv[++i]);
    else return { error: `未知参数：${a}` };
  }
  if (out.expectExit !== null && ![0, 1, 2].includes(out.expectExit)) {
    return { error: "--expect-exit 只接受 0 / 1 / 2" };
  }
  return { value: out };
}

function runAction(env) {
  const outFile = path.join(mkdtempSync(path.join(tmpdir(), "readme-craft-rehearsal-")), "github_output");
  writeFileSync(outFile, "");
  const res = spawnSync(process.execPath, [entry], {
    encoding: "utf8",
    env: { ...process.env, ...env, GITHUB_OUTPUT: outFile },
  });
  const outputs = {};
  if (existsSync(outFile)) {
    for (const line of readFileSync(outFile, "utf8").split("\n")) {
      const eq = line.indexOf("=");
      if (eq > 0) outputs[line.slice(0, eq)] = line.slice(eq + 1);
    }
  }
  return { status: res.status, stdout: res.stdout ?? "", stderr: res.stderr ?? "", outputs };
}

function check(label, ok, detail) {
  const mark = ok ? "✔" : "✖";
  process.stdout.write(`${mark} ${label}${detail ? ` — ${detail}` : ""}\n`);
  return ok;
}

const parsed = parseArgs(process.argv.slice(2));
if (parsed.error) {
  process.stderr.write(`用法错误：${parsed.error}\n`);
  process.exit(2);
}
const opts = parsed.value;

const target = opts.path ?? path.join(repoRoot, "tests", "fixtures", "cli");
if (!existsSync(target)) {
  process.stderr.write(`目标路径不存在：${target}\n`);
  process.exit(2);
}

const env = {
  INPUT_PATH: target,
  INPUT_TYPE: opts.type ?? "cli",
  INPUT_REVIEW: opts.review ?? "",
  INPUT_STRICT: String(opts.strict),
  RUNNER_TEMP: tmpdir(),
};

process.stdout.write(`Action 演练：path=${target} type=${env.INPUT_TYPE} strict=${env.INPUT_STRICT}\n\n`);
const run = runAction(env);

let allOk = true;
allOk = check("退出码为 0/1/2 之一", [0, 1, 2].includes(run.status ?? -1), `实际 ${run.status}`) && allOk;
allOk =
  check(
    "写出全部 5 个 output",
    ["verified-score", "verified-maximum", "unverified-count", "report-path", "exit-code"].every((k) =>
      run.outputs[k] !== undefined,
    ),
    Object.keys(run.outputs).join(","),
  ) && allOk;
allOk = check("exit-code output 与进程退出码一致", run.outputs["exit-code"] === String(run.status)) && allOk;

const reportPath = run.outputs["report-path"];
if (reportPath && existsSync(reportPath)) {
  let report = null;
  try {
    report = JSON.parse(readFileSync(reportPath, "utf8"));
  } catch {
    /* 下面统一按解析失败处理 */
  }
  allOk = check("JSON 报告可解析且含固定字段", !!report && "verifiedScore" in report && "rules" in report) && allOk;
  if (report) {
    allOk = check(
      "outputs 的分数与 JSON 报告一致",
      run.outputs["verified-score"] === String(report.verifiedScore) &&
        run.outputs["verified-maximum"] === String(report.verifiedMaximum) &&
        run.outputs["unverified-count"] === String(report.unverifiedCount),
    ) && allOk;
  }
} else {
  allOk = check("报告文件存在", false, reportPath ?? "(未产出)") && allOk;
}

if (opts.expectExit !== null) {
  allOk = check(`退出码符合预期 ${opts.expectExit}`, run.status === opts.expectExit, `实际 ${run.status}`) && allOk;
}

process.stdout.write(`\n${allOk ? "演练通过" : "演练失败"}\n`);

// 把被测退出码也打印出来，便于在发布清单里留证据
process.stdout.write(`（被测 Action 退出码：${run.status}）\n`);
process.exit(allOk ? 0 : 1);
