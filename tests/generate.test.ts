import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  applyBlock,
  generateAll,
  renderRuleSummary,
  renderAntiPatternSummary,
  GenerateError,
  GENERATED_BLOCKS,
} from "../scripts/lib/generate.ts";
import { loadSpec } from "../scripts/lib/spec.ts";

test("applyBlock replaces content between markers", () => {
  const before = "前文\n<!-- BEGIN GENERATED:demo -->\n旧内容\n<!-- END GENERATED:demo -->\n后文\n";
  const after = applyBlock(before, "demo", "新内容");
  assert.equal(after, "前文\n<!-- BEGIN GENERATED:demo -->\n新内容\n<!-- END GENERATED:demo -->\n后文\n");
});

test("applyBlock throws GenerateError when the marker is missing", () => {
  assert.throws(() => applyBlock("没有标记\n", "demo", "x"), GenerateError);
});

test("applyBlock throws GenerateError when the marker is duplicated", () => {
  const dup =
    "<!-- BEGIN GENERATED:demo -->\na\n<!-- END GENERATED:demo -->\n" +
    "<!-- BEGIN GENERATED:demo -->\nb\n<!-- END GENERATED:demo -->\n";
  assert.throws(() => applyBlock(dup, "demo", "x"), GenerateError);
});

test("rule summary uses prose IDs (T1) and covers all 19 rules", () => {
  const spec = loadSpec();
  const table = renderRuleSummary(spec);
  assert.ok(table.includes("| **T1** | 视觉锤 |"));
  assert.ok(table.includes("| **T19** | CI 可复现与可诊断 |"));
  assert.ok(!table.includes("T01"), "不得出现零填充内部 ID");
  assert.equal((table.match(/\| \*\*T\d+\*\* \|/g) ?? []).length, 19);
});

test("anti-pattern summary uses prose IDs and covers all 13", () => {
  const spec = loadSpec();
  const table = renderAntiPatternSummary(spec);
  assert.ok(table.includes("| **A1** | 零视觉 |"));
  assert.ok(table.includes("| **A13** | CI 不可复现 |"));
  assert.equal((table.match(/\| \*\*A\d+\*\* \|/g) ?? []).length, 13);
});

test("generateAll is idempotent: two runs produce zero diff", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "readme-craft-gen-"));
  const file = path.join(dir, "doc.md");
  const skeleton =
    "# doc\n<!-- BEGIN GENERATED:rule-summary -->\n占位\n<!-- END GENERATED:rule-summary -->\n";
  writeFileSync(file, skeleton);
  const blocks = [{ file: "doc.md", name: "rule-summary", render: renderRuleSummary }];

  generateAll(dir, { check: false, blocks, spec: loadSpec() });
  const first = readFileSync(file, "utf8");
  generateAll(dir, { check: false, blocks, spec: loadSpec() });
  const second = readFileSync(file, "utf8");
  assert.equal(first, second);
});

test("generateAll --check fails on stale content and passes after generate", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "readme-craft-gen-"));
  const file = path.join(dir, "doc.md");
  writeFileSync(
    file,
    "# doc\n<!-- BEGIN GENERATED:rule-summary -->\n过期内容\n<!-- END GENERATED:rule-summary -->\n",
  );
  const blocks = [{ file: "doc.md", name: "rule-summary", render: renderRuleSummary }];

  const stale = generateAll(dir, { check: true, blocks, spec: loadSpec() });
  assert.deepEqual(stale.stale, ["doc.md"]);

  generateAll(dir, { check: false, blocks, spec: loadSpec() });
  const fresh = generateAll(dir, { check: true, blocks, spec: loadSpec() });
  assert.deepEqual(fresh.stale, []);
});

test("registered blocks only reference files that exist in the repo", () => {
  for (const block of GENERATED_BLOCKS) {
    // 在仓库根校验目标文件存在（顺带防止 registry 漂移）
    const p = path.join(path.resolve(import.meta.dirname, ".."), block.file);
    const content = readFileSync(p, "utf8");
    if (block.wholeFile) continue; // 整文件生成不使用标记
    assert.ok(content.includes(`BEGIN GENERATED:${block.name}`), `${block.file} 缺少 ${block.name} 标记`);
  }
});
