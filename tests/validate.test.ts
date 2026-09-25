import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkVersionConsistency,
  checkScaleDrift,
  checkLinks,
  checkPlaceholders,
  checkGeneratedFreshness,
  validateRepo,
} from "../scripts/lib/validate.ts";
import { loadSpec } from "../scripts/lib/spec.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function tmp(): string {
  return mkdtempSync(path.join(tmpdir(), "readme-craft-val-"));
}

// ---------- 版本一致性（P9 三处） ----------

test("version drift between spec and package.json is reported", () => {
  const dir = tmp();
  writeFileSync(path.join(dir, "package.json"), JSON.stringify({ version: "9.9.9" }));
  mkdirSync(path.join(dir, "skill"));
  writeFileSync(path.join(dir, "skill", "SKILL.md"), "---\nversion: 3.0.0-alpha.0\n---\n");
  const issues = checkVersionConsistency(dir, loadSpec());
  assert.ok(issues.some((i) => i.message.includes("package.json")), JSON.stringify(issues));
});

test("version drift in SKILL frontmatter is reported", () => {
  const dir = tmp();
  writeFileSync(path.join(dir, "package.json"), JSON.stringify({ version: "3.0.0-alpha.0" }));
  mkdirSync(path.join(dir, "skill"));
  writeFileSync(path.join(dir, "skill", "SKILL.md"), "---\nversion: 2.3.1\n---\n");
  const issues = checkVersionConsistency(dir, loadSpec());
  assert.ok(issues.some((i) => i.message.includes("SKILL")), JSON.stringify(issues));
});

// ---------- 旧口径漂移 ----------

test("scale drift outside historical sections is reported", () => {
  const dir = tmp();
  writeFileSync(path.join(dir, "README.md"), "# 项目\n本方法论有 16 条铁律。\n");
  const issues = checkScaleDrift(dir);
  assert.ok(issues.some((i) => i.file === "README.md"), JSON.stringify(issues));
});

test("scale numbers inside historical sections are allowed", () => {
  const dir = tmp();
  writeFileSync(
    path.join(dir, "README.md"),
    "# 项目\n\n## 版本演进（历史对照）\n\n| 量表 | 60 分 | 80 分 |\n",
  );
  const issues = checkScaleDrift(dir);
  assert.deepEqual(issues, [], JSON.stringify(issues));
});

// ---------- 相对链接与锚点 ----------

test("broken relative link is reported", () => {
  const dir = tmp();
  writeFileSync(path.join(dir, "README.md"), "[缺失](./no-such-file.md)\n");
  const issues = checkLinks(dir);
  assert.ok(issues.some((i) => i.message.includes("no-such-file")), JSON.stringify(issues));
});

test("bare relative link to existing file passes", () => {
  const dir = tmp();
  writeFileSync(path.join(dir, "README.md"), "[方法](METHODOLOGY.md)\n");
  writeFileSync(path.join(dir, "METHODOLOGY.md"), "# m\n");
  assert.deepEqual(checkLinks(dir), []);
});

test("broken anchor in README is reported", () => {
  const dir = tmp();
  writeFileSync(path.join(dir, "README.md"), "# 标题\n[跳转](#不存在的锚点)\n");
  const issues = checkLinks(dir);
  assert.ok(issues.some((i) => i.message.includes("不存在的锚点")), JSON.stringify(issues));
});

test("repository links cannot read markdown outside the root", () => {
  const dir = tmp();
  const outside = path.join(path.dirname(dir), `${path.basename(dir)}-outside.md`);
  writeFileSync(path.join(dir, "README.md"), `[outside](../${path.basename(outside)}#private)\n`);
  const issues = checkLinks(dir);
  assert.ok(issues.some((i) => i.message.includes("越界相对链接")), JSON.stringify(issues));
});

test("malformed percent-encoded anchors become validation issues", () => {
  const dir = tmp();
  writeFileSync(path.join(dir, "README.md"), "# heading\n\n[bad](#%E0%A4%A)\n");
  const issues = checkLinks(dir);
  assert.ok(issues.some((i) => i.message.includes("锚点编码无效")), JSON.stringify(issues));
});

test("github-style anchor of an emoji heading resolves", () => {
  const dir = tmp();
  writeFileSync(path.join(dir, "README.md"), "## 🗓️ Roadmap\n\n[跳转](#-roadmap)\n");
  assert.deepEqual(checkLinks(dir), []);
});

test("external URLs are skipped offline", () => {
  const dir = tmp();
  writeFileSync(path.join(dir, "README.md"), "[x](https://example.com/a) [y](mailto:a@b.c)\n");
  assert.deepEqual(checkLinks(dir), []);
});

// ---------- 占位符 ----------

test("undeclared placeholder in prose docs is reported", () => {
  const dir = tmp();
  writeFileSync(path.join(dir, "README.md"), "联系 yourname 获取帮助\n");
  const issues = checkPlaceholders(dir);
  assert.ok(issues.some((i) => i.file === "README.md"), JSON.stringify(issues));
});

test("templates and declared fixtures are exempt from placeholder checks", () => {
  const dir = tmp();
  mkdirSync(path.join(dir, "templates"));
  writeFileSync(path.join(dir, "templates", "standard.md"), "作者：yourname\nTODO: 补充\n");
  mkdirSync(path.join(dir, "examples"));
  writeFileSync(path.join(dir, "examples", "demo.md"), "hello yourname\n");
  assert.deepEqual(checkPlaceholders(dir), []);
});

// ---------- 生成区块新鲜度 ----------

test("stale generated block is reported", () => {
  const dir = tmp();
  writeFileSync(
    path.join(dir, "README.md"),
    "<!-- BEGIN GENERATED:rule-summary -->\n过期\n<!-- END GENERATED:rule-summary -->\n",
  );
  const issues = checkGeneratedFreshness(dir, loadSpec(), [
    { file: "README.md", name: "rule-summary", render: () => "新鲜内容" },
  ]);
  assert.ok(issues.some((i) => i.file === "README.md"), JSON.stringify(issues));
});

// ---------- 集成：真实仓库必须全绿 ----------

test("the real repository passes validate with zero issues", () => {
  const result = validateRepo(repoRoot);
  assert.deepEqual(result.issues, [], JSON.stringify(result.issues, null, 2));
});

// ---------- M2-R3 规则引用一致性 ----------

test("rule title drift in METHODOLOGY.md is reported", async () => {
  const { checkRuleRefs } = await import("../scripts/lib/validate.ts");
  const dir = tmp();
  writeFileSync(path.join(dir, "METHODOLOGY.md"), "# 方法论\n\nT1 价值主张前置\n");
  writeFileSync(path.join(dir, "checklist.md"), "# 清单\n");
  mkdirSync(path.join(dir, "skill"));
  writeFileSync(path.join(dir, "skill", "SKILL.md"), "# Skill\n");
  const issues = checkRuleRefs(dir, loadSpec());
  const ruleRef = issues.filter((i) => i.check === "rule-ref");
  assert.ok(ruleRef.length > 0, "缺少规则引用一致性报错");
  assert.ok(ruleRef.some((i) => i.file === "checklist.md" && i.message.includes("T1")), JSON.stringify(ruleRef));
});

test("real repository rule references align with rules.yaml", async () => {
  const { checkRuleRefs } = await import("../scripts/lib/validate.ts");
  const issues = checkRuleRefs(repoRoot, loadSpec());
  assert.deepEqual(issues, [], JSON.stringify(issues, null, 2));
});
