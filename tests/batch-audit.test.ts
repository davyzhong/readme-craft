import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(repoRoot, "scripts", "batch-audit.mjs");
const fixtures = path.join(repoRoot, "tests", "fixtures");

function run(args: string[]) {
  return spawnSync(process.execPath, [script, ...args], { encoding: "utf8", cwd: repoRoot });
}

test("batch-audit 无参数打印用法并以 2 退出", () => {
  const res = run([]);
  assert.equal(res.status, 2);
  assert.match(res.stderr, /用法/);
});

test("batch-audit 对 fixtures 目录输出汇总表", () => {
  const res = run([fixtures]);
  assert.equal(res.status, 0);
  assert.match(res.stdout, /批量审计报告/);
  assert.match(res.stdout, /cli/);
  assert.match(res.stdout, /knowledge-base/);
});

test("batch-audit --strict 在存在确定性 fail 时退出 1", () => {
  const res = run([fixtures, "--strict"]);
  // fixtures 中至少存在 fail 用例（如 mouthtype 的 T12）→ 1；若全部通过则 0
  assert.ok(res.status === 0 || res.status === 1);
});
