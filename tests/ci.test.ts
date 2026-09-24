import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workflowPath = path.join(repoRoot, ".github", "workflows", "validate.yml");

test("CI workflow exists and pins the toolchain", () => {
  assert.ok(existsSync(workflowPath), ".github/workflows/validate.yml 不存在");
  const yml = readFileSync(workflowPath, "utf8");
  // Node 版本由 .node-version 锁定，不在 workflow 里写死第二份
  assert.ok(yml.includes("node-version-file"), "workflow 必须使用 node-version-file: .node-version");
  assert.ok(!/node-version:\s*['"]?\d/.test(yml), "不得在 workflow 里另写 node 版本（避免双事实源）");
  // 只读权限声明
  assert.ok(/permissions:\s*\n\s+contents:\s*read/.test(yml), "workflow 必须声明 permissions: contents: read");
});

test("CI workflow runs the full M2 acceptance command set", () => {
  const yml = readFileSync(workflowPath, "utf8");
  for (const cmd of [
    "pnpm install --frozen-lockfile",
    "pnpm test",
    "pnpm typecheck",
    "pnpm validate",
    "pnpm check:generated",
    "tests/fixtures/cli-golden",
    "tests/fixtures/cli",
    "pack-skill",
  ]) {
    assert.ok(yml.includes(cmd), `workflow 缺少命令：${cmd}`);
  }
  // 负向 fixture 必须显式断言退出码 1，而不是允许失败
  assert.ok(/test \$\? -eq 1|\$\? == 1|exit.*1/.test(yml), "负向 fixture 必须断言退出码 1");
});
