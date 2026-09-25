#!/usr/bin/env node
// 批量审计：对一个目录下的所有含 README.md 的子项目逐个跑 `readme-craft check`，
// 汇总为一张确定性缺口表。报告可能包含仓库名与评分，应保存在私有位置。
// 用法：
//   node scripts/batch-audit.mjs <workspace-dir> [--exclude a,b,...] [--out <report.md>] [--strict]
//   --exclude  跳过指定子目录（逗号分隔）
//   --out      将 Markdown 表格写入文件
//   --strict   任一项目存在确定性 fail 时退出码 1（供 CI 使用）
import { spawnSync } from "node:child_process";
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(repoRoot, "scripts", "readme-craft.ts");

const args = process.argv.slice(2);
const target = args[0] && !args[0].startsWith("--") ? args.shift() : null;
const exclude = args.includes("--exclude") ? (args[args.indexOf("--exclude") + 1]?.split(",") ?? []) : [];
const outIdx = args.indexOf("--out");
const out = outIdx !== -1 ? args[outIdx + 1] : null;
const strict = args.includes("--strict");

if (!target) {
  console.error("用法: node scripts/batch-audit.mjs <workspace-dir> [--exclude a,b] [--out report.md] [--strict]");
  process.exit(2);
}
const root = path.resolve(target);
if (!existsSync(root)) {
  console.error(`目录不存在: ${root}`);
  process.exit(2);
}

const rows = [];
for (const name of readdirSync(root).sort()) {
  const dir = path.join(root, name);
  if (exclude.includes(name)) continue;
  if (!existsSync(path.join(dir, "README.md"))) continue;
  const res = spawnSync(process.execPath, [cli, "check", dir, "--format", "json"], { encoding: "utf8" });
  let j;
  try {
    j = JSON.parse(res.stdout);
  } catch {
    rows.push({ name, error: `check 失败（exit ${res.status}）: ${(res.stderr || "").split("\n")[0]}` });
    continue;
  }
  rows.push({
    name,
    types: (j.projectTypes || []).join(",") || "ambiguous",
    score: `${j.verifiedScore}/${j.verifiedMaximum}`,
    fails: j.rules.filter((r) => r.status === "fail").map((r) => `${r.id}: ${r.reason}`),
    parts: j.rules.filter((r) => r.status === "partial").map((r) => r.id),
    unv: j.unverifiedCount,
  });
}

const lines = [
  `# 批量审计报告（${new Date().toISOString().slice(0, 10)}，目录：${root}）`,
  "",
  "| 项目 | 类型 | 已核验 | FAIL | PARTIAL | 未核验 |",
  "|---|---|---|---|---|---|",
];
for (const r of rows) {
  if (r.error) {
    lines.push(`| ${r.name} | - | - | ${r.error} | - | - |`);
    continue;
  }
  lines.push(`| ${r.name} | ${r.types} | ${r.score} | ${r.fails.join("；") || "-"} | ${r.parts.join("+") || "-"} | ${r.unv} |`);
}
const table = lines.join("\n");
console.log(table);
if (out) writeFileSync(out, table + "\n");

const failCount = rows.filter((r) => r.fails?.length > 0).length;
if (failCount > 0) console.error(`\n${failCount} 个项目存在确定性 fail${strict ? "（--strict，退出码 1）" : ""}`);
process.exit(strict && failCount > 0 ? 1 : 0);
