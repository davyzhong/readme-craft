import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(repoRoot, "scripts", "readme-craft.ts");

function runCli(args: string[]) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

test("CLI --help exits 0 and lists the five subcommands", () => {
  const res = runCli(["--help"]);
  assert.equal(res.status, 0, `expected exit 0, got ${res.status}: ${res.stderr}`);
  const out = res.stdout + res.stderr;
  for (const sub of ["validate", "generate", "check", "pack-skill", "install-skill"]) {
    assert.ok(out.includes(sub), `--help output must list subcommand "${sub}"`);
  }
});

test("CLI without arguments prints help and exits 2", () => {
  const res = runCli([]);
  assert.equal(res.status, 2, `expected exit 2, got ${res.status}`);
  const out = res.stdout + res.stderr;
  for (const sub of ["validate", "generate", "check", "pack-skill", "install-skill"]) {
    assert.ok(out.includes(sub), `usage output must list subcommand "${sub}"`);
  }
});

test("CLI with an unknown subcommand exits 2", () => {
  const res = runCli(["frobnicate"]);
  assert.equal(res.status, 2, `expected exit 2, got ${res.status}`);
});

test("runtime satisfies the minimum Node 24.15 contract (M2-R5, relaxed 2026-09-23)", () => {
  // engines: >=24.15.0（仅下限）。CI 复现由 .node-version（24.15.0）+ workflow node-version-file 锁定；
  // 本地允许 Node 25/26——type stripping 行为自 24 起稳定，上限锁定的收益归 CI，代价不应由本地承担。
  const [major, minor] = process.versions.node.split(".").map(Number);
  assert.ok(
    major! > 24 || (major === 24 && minor! >= 15),
    `需要 Node >=24.15.0，当前 ${process.versions.node}`,
  );
});
