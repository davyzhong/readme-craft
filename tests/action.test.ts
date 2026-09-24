import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(repoRoot, "scripts", "action-entry.mjs");

function runAction(env: Record<string, string>): { status: number | null; stderr: string; outputs: Record<string, string> } {
  const outFile = path.join(mkdtempSync(path.join(tmpdir(), "readme-craft-action-")), "github_output");
  writeFileSync(outFile, "");
  const res = spawnSync(process.execPath, [entry], {
    encoding: "utf8",
    env: { ...process.env, ...env, GITHUB_OUTPUT: outFile },
  });
  const outputs: Record<string, string> = {};
  if (existsSync(outFile)) {
    for (const line of readFileSync(outFile, "utf8").split("\n")) {
      const eq = line.indexOf("=");
      if (eq > 0) outputs[line.slice(0, eq)] = line.slice(eq + 1);
    }
  }
  return { status: res.status, stderr: res.stderr, outputs };
}

test("golden fixture：exit 0 且 outputs 完整", () => {
  const r = runAction({
    INPUT_PATH: path.join(repoRoot, "tests/fixtures/cli-golden"),
    INPUT_TYPE: "cli",
  });
  assert.equal(r.status, 0, r.stderr);
  for (const key of ["verified-score", "verified-maximum", "unverified-count", "report-path", "exit-code"]) {
    assert.ok(key in r.outputs, `缺少 output ${key}：${JSON.stringify(r.outputs)}`);
  }
  assert.equal(r.outputs["exit-code"], "0");
  assert.ok(existsSync(r.outputs["report-path"]!), "report-path 必须指向真实 JSON 报告");
});

test("负向 fixture：exit 1（检查发现 fail），与输入校验失败区分", () => {
  const r = runAction({
    INPUT_PATH: path.join(repoRoot, "tests/fixtures/cli"),
    INPUT_TYPE: "cli",
  });
  assert.equal(r.status, 1, r.stderr);
  assert.equal(r.outputs["exit-code"], "1");
});

test("未知项目类型：exit 2（输入校验失败）", () => {
  const r = runAction({
    INPUT_PATH: ".",
    INPUT_TYPE: "  banana  ",
  });
  assert.equal(r.status, 2);
  assert.ok(r.stderr.includes("banana"), r.stderr);
});

test("path 输入不经过 shell：注入串按字面路径处理", () => {
  const r = runAction({ INPUT_PATH: '"; echo PWNED #"' });
  assert.equal(r.status, 2);
  assert.ok(!r.stderr.includes("PWNED\n") || !r.stderr.startsWith("PWNED"), "注入串被 shell 执行");
});

test("type 全空白视为未提供（走自动探测），不误判非法", () => {
  const r = runAction({
    INPUT_PATH: path.join(repoRoot, "tests/fixtures/cli-golden"),
    INPUT_TYPE: "   ",
  });
  assert.equal(r.status, 0, r.stderr);
});

test("action.yml 声明只读契约", () => {
  const yml = readFileSync(path.join(repoRoot, "action.yml"), "utf8");
  assert.ok(!/pull-requests:\s*write|contents:\s*write/.test(yml), "action.yml 不得声明写权限");
  assert.ok(yml.includes("runs:"), "action.yml 缺 runs");
});
