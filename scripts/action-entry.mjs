// readme-craft 只读 GitHub Action 入口（M3-1）。
// 契约：inputs → CLI 参数（spawnSync 数组传参，不经 shell）；outputs 写 GITHUB_OUTPUT。
// 退出码直通 CLI：0 成功 / 1 检查发现 fail / 2 输入校验或环境错误——调用方可据此区分。

import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const trim = (v) => (v ?? "").trim();

const inputPath = trim(process.env.INPUT_PATH) || ".";
const type = trim(process.env.INPUT_TYPE); // 空 = 未提供，走 CLI 自动探测；非法值由 CLI 以 exit 2 拒绝
const review = trim(process.env.INPUT_REVIEW);
const strict = trim(process.env.INPUT_STRICT) === "true";

const reportPath = path.join(
  mkdtempSync(path.join(trim(process.env.RUNNER_TEMP) || tmpdir(), "readme-craft-report-")),
  "report.json",
);

const args = [
  path.join(root, "scripts", "readme-craft.ts"),
  "check",
  inputPath,
  "--format",
  "json",
  "--output",
  reportPath,
];
if (type) args.push("--type", type);
if (review) args.push("--review", review);
if (strict) args.push("--strict");

const res = spawnSync(process.execPath, args, { encoding: "utf8" });
if (res.stdout) process.stdout.write(res.stdout);
if (res.stderr) process.stderr.write(res.stderr);
const code = res.status ?? 2;

let report = {};
if (existsSync(reportPath)) {
  try {
    report = JSON.parse(readFileSync(reportPath, "utf8"));
  } catch {
    // 报告缺失或损坏时不阻断退出码直通
  }
}

if (process.env.GITHUB_OUTPUT) {
  const lines = [
    `verified-score=${report.verifiedScore ?? ""}`,
    `verified-maximum=${report.verifiedMaximum ?? ""}`,
    `unverified-count=${report.unverifiedCount ?? ""}`,
    `report-path=${reportPath}`,
    `exit-code=${code}`,
  ];
  appendFileSync(process.env.GITHUB_OUTPUT, lines.join("\n") + "\n");
}

process.exit(code);
