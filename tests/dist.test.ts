import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundle = path.join(repoRoot, "dist", "readme-craft.mjs");

function sha(p: string): string {
  return createHash("sha256").update(readFileSync(p)).digest("hex");
}

test("bundle 构建且重建零 diff", async () => {
  const { buildBundle } = await import("../scripts/build.ts");
  buildBundle(repoRoot);
  const first = sha(bundle);
  buildBundle(repoRoot);
  assert.equal(sha(bundle), first, "同版本重建必须零 diff");
});

test("bundle 在无 tsx 的纯 node 下运行 --help", () => {
  assert.ok(existsSync(bundle), "dist/readme-craft.mjs 不存在，先跑 pnpm run build");
  const res = spawnSync(process.execPath, [bundle, "--help"], { encoding: "utf8" });
  assert.equal(res.status, 0, res.stderr);
  for (const sub of ["validate", "generate", "check", "pack-skill", "install-skill"]) {
    assert.ok(res.stdout.includes(sub), `help 缺少 ${sub}`);
  }
});

test("bundle 在仓库外 cwd 对 golden fixture 跑 check（内嵌规则）", () => {
  const outside = mkdtempSync(path.join(tmpdir(), "readme-craft-dist-"));
  const res = spawnSync(
    process.execPath,
    [bundle, "check", path.join(repoRoot, "tests/fixtures/cli-golden"), "--type", "cli"],
    { encoding: "utf8", cwd: outside },
  );
  assert.equal(res.status, 0, `${res.stdout}\n${res.stderr}`);
  assert.ok(res.stdout.includes("3.0.0-alpha.0"), "报告应带内嵌版本号");
});

test("bundle 对负向 fixture exit 1", () => {
  const res = spawnSync(
    process.execPath,
    [bundle, "check", path.join(repoRoot, "tests/fixtures/cli"), "--type", "cli"],
    { encoding: "utf8" },
  );
  assert.equal(res.status, 1, `${res.stdout}\n${res.stderr}`);
});
