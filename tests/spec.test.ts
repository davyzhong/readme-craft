import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSpec, SchemaError, SemanticError } from "../scripts/lib/spec.ts";

const RULE_BLOCK = `  - id: T04
    title: 安装路径
    axis: structure
    applies_to:
      - cli
      - library
    intent: 让目标用户找到真实可用的安装路径
    scores:
      "0": 没有安装说明
      "1": 有描述但没有可执行命令
      "2": 有主平台命令，但未提供验证证据
      "3": 主平台有经过验证的安装命令
      "4": 正式支持的平台均有命令，少量验证证据缺失
      "5": 所有正式支持的平台都有经过验证的安装路径
    evidence:
      - executable-command
    evaluator: agent-reviewed
    thresholds:
      partial: 1
      pass: 3
`;

const ANTI_BLOCK = `antiPatterns:
  - id: A04
    title: 安装埋在第 5 屏
    maps_to:
      - T04
`;

const VALID_SPEC = `version: 3.0.0

rules:
${RULE_BLOCK}
${ANTI_BLOCK}
`;

test("parses a minimal valid spec", () => {
  const spec = parseSpec(VALID_SPEC);
  assert.equal(spec.version, "3.0.0");
  assert.equal(spec.rules.length, 1);
  assert.equal(spec.rules[0]?.id, "T04");
  assert.equal(spec.antiPatterns.length, 1);
});

test("missing version is a SchemaError", () => {
  const bad = VALID_SPEC.replace("version: 3.0.0\n", "");
  assert.throws(() => parseSpec(bad), SchemaError);
});

test("malformed YAML is a SchemaError", () => {
  assert.throws(() => parseSpec("rules: [unclosed"), SchemaError);
});

test("duplicate rule IDs are a SemanticError", () => {
  const doubled = VALID_SPEC.replace(RULE_BLOCK, RULE_BLOCK + RULE_BLOCK);
  assert.throws(() => parseSpec(doubled), SemanticError);
});

test("a rule missing one of the six score anchors is a SchemaError", () => {
  const bad = VALID_SPEC.replace(/      "5": .*\n/, "");
  assert.throws(() => parseSpec(bad), SchemaError);
});

test("illegal evaluator is a SchemaError", () => {
  const bad = VALID_SPEC.replace("evaluator: agent-reviewed", "evaluator: vibes");
  assert.throws(() => parseSpec(bad), SchemaError);
});

test("illegal project type is a SchemaError", () => {
  const bad = VALID_SPEC.replace("- cli", "- toaster");
  assert.throws(() => parseSpec(bad), SchemaError);
});

test("thresholds with partial >= pass are a SemanticError", () => {
  const bad = VALID_SPEC.replace("partial: 1", "partial: 4");
  assert.throws(() => parseSpec(bad), SemanticError);
});

test("anti-pattern referencing an unknown rule ID is a SemanticError", () => {
  const bad = VALID_SPEC.replace("      - T04\n", "      - T19\n");
  assert.throws(() => parseSpec(bad), SemanticError);
});

test("rule ID without zero padding is a SchemaError", () => {
  const bad = VALID_SPEC.replace("id: T04", "id: T4");
  assert.throws(() => parseSpec(bad), SchemaError);
});
