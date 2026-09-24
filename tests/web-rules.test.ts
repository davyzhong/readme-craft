import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSpec, parseSpec, SemanticError } from "../scripts/lib/spec.ts";
import { renderRulesProjection } from "../scripts/lib/generate.ts";
import { RULES, RULES_VERSION } from "../web/src/generated/rules.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECTION_PATH = path.join(repoRoot, "web", "src", "generated", "rules.ts");

test("projection version matches rules.yaml", () => {
  const spec = loadSpec();
  assert.equal(RULES_VERSION, spec.version);
});

test("projection covers every rule in order with matching ids and titles", () => {
  const spec = loadSpec();
  assert.equal(RULES.length, spec.rules.length);
  RULES.forEach((projected, i) => {
    const rule = spec.rules[i]!;
    assert.equal(projected.id, rule.id);
    assert.equal(projected.title, rule.title);
    assert.equal(projected.axis, rule.axis);
    assert.equal(projected.evaluator, rule.evaluator);
    assert.deepEqual([...projected.appliesTo], [...rule.applies_to]);
    assert.deepEqual(projected.thresholds, rule.thresholds);
  });
});

test("browserSafe flags mirror rules.yaml browser_safe declarations", () => {
  const spec = loadSpec();
  for (const projected of RULES) {
    const rule = spec.rules.find((r) => r.id === projected.id)!;
    assert.equal(
      projected.browserSafe,
      rule.browser_safe ?? false,
      `${projected.id} 的 browserSafe 与 rules.yaml 不一致`,
    );
  }
  // 浏览器安全子集必须全部是 deterministic 规则
  for (const projected of RULES.filter((r) => r.browserSafe)) {
    assert.equal(projected.evaluator, "deterministic", `${projected.id} 标了 browserSafe 但不是 deterministic`);
  }
});

test("projection contains only browser-needed fields", () => {
  const allowed = new Set(["id", "title", "axis", "evaluator", "appliesTo", "thresholds", "browserSafe"]);
  for (const projected of RULES) {
    for (const key of Object.keys(projected)) {
      assert.ok(allowed.has(key), `投影字段 ${key} 超出浏览器所需范围`);
    }
  }
});

test("projection file is fresh (generate output matches on-disk content)", () => {
  const spec = loadSpec();
  assert.equal(readFileSync(PROJECTION_PATH, "utf8"), renderRulesProjection(spec));
});

test("spec semantics: deterministic rules must declare browser_safe", () => {
  const spec = loadSpec();
  for (const rule of spec.rules) {
    if (rule.evaluator === "deterministic") {
      assert.equal(typeof rule.browser_safe, "boolean", `${rule.id} 未声明 browser_safe`);
    }
  }
});

test("parseSpec rejects deterministic rule without browser_safe", () => {
  const spec = loadSpec();
  const yaml = `version: "${spec.version}"\nrules:\n  - id: T01\n    title: x\n    axis: content\n    applies_to: [cli]\n    intent: x\n    scores: { "0": a, "1": b, "2": c, "3": d, "4": e, "5": f }\n    evidence: [x]\n    evaluator: deterministic\n    thresholds: { partial: 1, pass: 2 }\nantiPatterns: []\n`;
  assert.throws(() => parseSpec(yaml), SemanticError);
});

test("parseSpec rejects agent-reviewed rule with browser_safe: true", () => {
  const spec = loadSpec();
  const yaml = `version: "${spec.version}"\nrules:\n  - id: T01\n    title: x\n    axis: content\n    applies_to: [cli]\n    intent: x\n    scores: { "0": a, "1": b, "2": c, "3": d, "4": e, "5": f }\n    evidence: [x]\n    evaluator: agent-reviewed\n    browser_safe: true\n    thresholds: { partial: 1, pass: 2 }\nantiPatterns: []\n`;
  assert.throws(() => parseSpec(yaml), SemanticError);
});
