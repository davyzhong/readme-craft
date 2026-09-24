import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveProjectTypes, ProjectTypeError } from "../scripts/lib/project.ts";
import { PROJECT_TYPES } from "../scripts/lib/types.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = path.join(repoRoot, "tests", "fixtures");

function tmp(): string {
  return mkdtempSync(path.join(tmpdir(), "readme-craft-proj-"));
}

// ---------- 优先级 1：--type 显式声明 ----------

test("--type overrides everything and accepts multiple types", () => {
  const dir = tmp(); // 空目录也会被 CLI 覆盖
  const r = resolveProjectTypes(dir, { types: ["cli", "library"] });
  assert.deepEqual(r.types, ["cli", "library"]);
  assert.equal(r.source, "cli");
});

test("illegal --type value raises ProjectTypeError", () => {
  assert.throws(() => resolveProjectTypes(tmp(), { types: ["toaster"] }), ProjectTypeError);
});

// ---------- 优先级 2：.readme-craft.yaml ----------

test(".readme-craft.yaml projectTypes wins over auto-detection", () => {
  const dir = tmp();
  writeFileSync(path.join(dir, "package.json"), JSON.stringify({ bin: { x: "x.js" } }));
  writeFileSync(path.join(dir, ".readme-craft.yaml"), "projectTypes:\n  - service\n");
  const r = resolveProjectTypes(dir, {});
  assert.deepEqual(r.types, ["service"]);
  assert.equal(r.source, "config");
});

test(".readme-craft.yaml with illegal type raises ProjectTypeError", () => {
  const dir = tmp();
  writeFileSync(path.join(dir, ".readme-craft.yaml"), "projectTypes:\n  - spaceship\n");
  assert.throws(() => resolveProjectTypes(dir, {}), ProjectTypeError);
});

// ---------- 优先级 3：自动探测（六类 fixture 矩阵） ----------

for (const type of PROJECT_TYPES) {
  test(`auto-detection resolves the ${type} fixture`, () => {
    const r = resolveProjectTypes(path.join(fixtures, type), {});
    assert.equal(r.source, "detect");
    assert.ok(r.types.includes(type), `${type} fixture 探测结果：${r.types.join(",")}`);
    assert.equal(r.ambiguous, false, `${type} fixture 不应歧义`);
  });
}

test("ambiguous project without manifest is flagged, not guessed", () => {
  const dir = tmp();
  writeFileSync(path.join(dir, "README.md"), "# 只有 README 的空项目\n");
  const r = resolveProjectTypes(dir, {});
  assert.equal(r.source, "detect");
  assert.equal(r.ambiguous, true);
});
