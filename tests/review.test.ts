import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkProject } from "../scripts/lib/check.ts";

function tmpProject(readme: string): string {
  const dir = mkdtempSync(path.join(tmpdir(), "readme-craft-review-"));
  writeFileSync(path.join(dir, "README.md"), readme);
  return dir;
}

function writeReview(dir: string, yaml: string): string {
  const p = path.join(dir, "review.yaml");
  writeFileSync(p, yaml);
  return p;
}

const GOOD_REVIEW = `
reviews:
  - id: T01
    score: 4
    evidence: [hero-visual]
    reason: 首屏有居中 logo 与真实 hero 截图
  - id: T02
    score: 5
    evidence: [value-proposition]
    reason: 一句话覆盖做什么+给谁+优势
  - id: T04
    score: 3
    evidence: [executable-command]
    reason: 主平台命令已验证
  - id: T05
    status: na
    reason: 纯库项目无 GUI/Web 试用入口需求
  - id: T07
    score: 4
    evidence: [numbered-selling-points]
    reason: 5 条量化卖点
  - id: T08
    score: 3
    evidence: [feature-groups]
    reason: 3 组分组
  - id: T11
    score: 1
    evidence: []
    reason: 早期项目，已标建设中
  - id: T14
    score: 4
    evidence: [inclusive-language-review]
    reason: they 单数 + 多元人名
  - id: T17
    score: 3
    evidence: [default-language-rationale]
    reason: 中文项目默认中文
`;

test("review file scores agent-reviewed rules and derives status from thresholds", () => {
  const dir = tmpProject("# 项目\n");
  const report = checkProject(dir, { types: ["library"], reviewPath: writeReview(dir, GOOD_REVIEW) });
  const t01 = report.rules.find((r) => r.id === "T01");
  assert.ok(t01);
  assert.equal(t01.source, "agent-reviewed");
  assert.equal(t01.score, 4);
  assert.equal(t01.status, "pass"); // T01 pass 阈值 4
  const t11 = report.rules.find((r) => r.id === "T11");
  assert.ok(t11);
  assert.equal(t11.score, 1);
  assert.equal(t11.status, "partial"); // T11 partial 阈值 1，pass 3
});

test("review na requires a non-empty reason", () => {
  const dir = tmpProject("# 项目\n");
  const bad = "reviews:\n  - id: T01\n    status: na\n    reason: \"\"\n";
  const report = checkProject(dir, { types: ["cli"], reviewPath: writeReview(dir, bad) });
  assert.ok(report.errors.some((e) => e.includes("T01")), JSON.stringify(report.errors));
});

test("review score outside 0-5 is an error", () => {
  const dir = tmpProject("# 项目\n");
  const bad = "reviews:\n  - id: T01\n    score: 9\n    evidence: []\n    reason: x\n";
  const report = checkProject(dir, { types: ["cli"], reviewPath: writeReview(dir, bad) });
  assert.ok(report.errors.some((e) => e.includes("T01")), JSON.stringify(report.errors));
});

test("review referencing an unknown rule id is an error", () => {
  const dir = tmpProject("# 项目\n");
  const bad = "reviews:\n  - id: T99\n    score: 3\n    evidence: []\n    reason: x\n";
  const report = checkProject(dir, { types: ["cli"], reviewPath: writeReview(dir, bad) });
  assert.ok(report.errors.some((e) => e.includes("T99")), JSON.stringify(report.errors));
});

test("full review coverage unlocks the normalized total score in text output", () => {
  // 显式单语言策略让 T13 确定性 pass，否则 M2-R1 起 T13 计 unverified，总分不解锁
  const dir = tmpProject("# 项目\n\n目前仅中文，欢迎 PR 补充其他语言。\n");
  // 补齐全部 9 条 agent-reviewed 规则
  const report = checkProject(dir, { types: ["library"], reviewPath: writeReview(dir, GOOD_REVIEW) });
  assert.equal(report.unverifiedCount, 0);
  assert.ok(report.text.includes("总分"), JSON.stringify(report.text));
  assert.ok(report.text.includes("/100"));
});
