import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSpec } from "../scripts/lib/spec.ts";
import { PROJECT_TYPES } from "../scripts/lib/types.ts";
import type { ProjectType } from "../scripts/lib/types.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function expectedIds(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${prefix}${String(i + 1).padStart(2, "0")}`);
}

test("rules.yaml loads and passes schema + semantic validation", () => {
  const spec = loadSpec();
  assert.ok(spec.rules.length > 0);
});

test("contains exactly the 19 iron rules T01..T19, unique and in order", () => {
  const spec = loadSpec();
  assert.deepEqual(
    spec.rules.map((r) => r.id),
    expectedIds("T", 19),
  );
});

test("contains exactly the 13 anti-patterns A01..A13, unique and in order", () => {
  const spec = loadSpec();
  assert.deepEqual(
    spec.antiPatterns.map((a) => a.id),
    expectedIds("A", 13),
  );
});

test("every anti-pattern maps to existing rules", () => {
  const spec = loadSpec();
  const ruleIds = new Set(spec.rules.map((r) => r.id));
  for (const anti of spec.antiPatterns) {
    for (const ref of anti.maps_to) {
      assert.ok(ruleIds.has(ref), `${anti.id} maps_to unknown rule ${ref}`);
    }
  }
});

test("every one of the six project types is covered by at least one rule", () => {
  const spec = loadSpec();
  const covered = new Set<ProjectType>();
  for (const rule of spec.rules) {
    for (const t of rule.applies_to) covered.add(t);
  }
  for (const t of PROJECT_TYPES) {
    assert.ok(covered.has(t), `project type ${t} is not covered by any rule`);
  }
});

test("spec version matches package.json version (P9)", () => {
  const spec = loadSpec();
  const pkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8")) as {
    version: string;
  };
  assert.equal(spec.version, pkg.version);
});

test("T15 anchors follow the frozen decision: no mandatory top frontmatter", () => {
  const spec = loadSpec();
  const t15 = spec.rules.find((r) => r.id === "T15");
  assert.ok(t15, "T15 must exist");
  const allAnchors = Object.values(t15.scores).join("\n");
  assert.ok(
    !allAnchors.includes("必须") || !allAnchors.includes("顶部"),
    "T15 锚点不得把 YAML frontmatter 放在首屏写成硬性要求（§3.1 / D-4）",
  );
});

test("T19 anchors follow the v2.3.1 rewrite: lockfile + frozen install, no downgrade advice", () => {
  const spec = loadSpec();
  const t19 = spec.rules.find((r) => r.id === "T19");
  assert.ok(t19, "T19 must exist");
  const allAnchors = Object.values(t19.scores).join("\n");
  assert.ok(allAnchors.includes("lockfile") || allAnchors.includes("frozen"), "T19 锚点必须体现 lockfile / frozen install");
  assert.ok(!allAnchors.includes("npm install 替换"), "T19 不得教放宽安装");
});
