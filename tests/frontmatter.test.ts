// T15 frontmatter YAML 合法性（2026-09-23 FLOW 事故防复发）
// 事故形态：badge 行被误插进 frontmatter，行首 `!` 被 YAML 解析为 tag 语法，
// GitHub 渲染报 "Error in user YAML: ... scanning a tag"。
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkProject } from "../scripts/lib/check.ts";

function tmpProject(readme: string): string {
  const dir = mkdtempSync(path.join(tmpdir(), "readme-craft-fm-"));
  writeFileSync(path.join(dir, "README.md"), readme);
  return dir;
}

const BODY = `
# 标题

## 安装

## 快速开始

\`\`\`bash
echo hi
\`\`\`
`;

test("T15 对非法 frontmatter（badge 误插类）给出低分与明确原因", () => {
  const dir = tmpProject(`---\nname: flow\n# 注释行\n\n![GitHub Stars](https://img.shields.io/github/stars/x/y)\ntitle: t\n---\n${BODY}`);
  const report = checkProject(dir, { types: ["knowledge-base"] });
  const t15 = report.rules.find((r) => r.id.endsWith("T15"))!;
  assert.equal(t15.score, 1);
  assert.match(t15.reason, /frontmatter YAML 非法/);
  assert.ok(t15.evidence.includes("frontmatter=invalid-yaml"));
});

test("T15 对合法 frontmatter 正常评分", () => {
  const dir = tmpProject(`---\nname: flow\ntitle: t\n# 普通注释\n---\n${BODY}`);
  const report = checkProject(dir, { types: ["knowledge-base"] });
  const t15 = report.rules.find((r) => r.id.endsWith("T15"))!;
  assert.doesNotMatch(t15.reason ?? "", /非法/);
  assert.ok((t15.score ?? 0) >= 3);
});
