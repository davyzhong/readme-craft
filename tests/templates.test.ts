import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatesDir = path.join(repoRoot, "templates");
const templateFiles = readdirSync(templatesDir)
  .filter((f) => f.endsWith(".md"))
  .sort();

const PLACEHOLDER_USE = /\{\{([^}]+)\}\}/g;
const PLACEHOLDER_NAME = /^[a-z][a-z0-9_]*$/;
const DECLARATION = /<!--\s*@placeholders\s+([\s\S]*?)\s*-->/;
const KINDS = new Set(["required", "optional", "conditional"]);

function parseDeclarations(text: string): Map<string, string> {
  const match = DECLARATION.exec(text);
  assert.ok(match, "模板必须包含 <!-- @placeholders name=kind ... --> 声明块");
  const map = new Map<string, string>();
  for (const token of match[1]!.split(/[\s,]+/).filter(Boolean)) {
    const eq = token.indexOf("=");
    assert.ok(eq > 0, `占位符声明格式应为 name=kind：${token}`);
    const name = token.slice(0, eq);
    const kind = token.slice(eq + 1);
    assert.ok(KINDS.has(kind), `占位符 ${name} 的 kind 必须是 required/optional/conditional，实际为 ${kind}`);
    map.set(name, kind);
  }
  return map;
}

test("templates 目录存在四套模板", () => {
  assert.deepEqual(templateFiles, ["cn-academic.md", "minimal.md", "rich.md", "standard.md"]);
});

for (const file of templateFiles) {
  test(`${file}: 占位符全部显式命名并声明 required/optional/conditional`, () => {
    const text = readFileSync(path.join(templatesDir, file), "utf8");
    const declared = parseDeclarations(text);
    const used = new Set<string>();
    for (const m of text.matchAll(PLACEHOLDER_USE)) {
      const name = m[1]!.trim();
      assert.ok(PLACEHOLDER_NAME.test(name), `${file} 占位符必须显式 snake_case 命名：{{${name}}}`);
      used.add(name);
    }
    for (const name of used) {
      assert.ok(declared.has(name), `${file} 使用了未声明的占位符 {{${name}}}`);
    }
    for (const name of declared.keys()) {
      assert.ok(used.has(name), `${file} 声明了未使用的占位符 {{${name}}}`);
    }
  });

  test(`${file}: 禁止伪证据（不写具体数字、不用 xxx/xx% 占位）`, () => {
    const text = readFileSync(path.join(templatesDir, file), "utf8");
    assert.ok(!/\bxxx\b/i.test(text), `${file} 含 xxx 伪数据`);
    assert.ok(!/xx\s*%/.test(text), `${file} 含 xx% 伪数据`);
    assert.ok(!/\{\{[^}]*[一-鿿]/.test(text), `${file} 占位符内不得用中文描述代替显式命名`);
  });

  test(`${file}: 评分口径为 v3 归一化，无 v2 原始分营销`, () => {
    const text = readFileSync(path.join(templatesDir, file), "utf8");
    assert.ok(!/95 分制/.test(text), `${file} 仍引用 v2.3.1 95 分制`);
    assert.ok(!/\d+\s*\+\s*\/\s*95/.test(text), `${file} 仍含 N+/95 原始分目标`);
    assert.ok(!/Trending 参考/.test(text), `${file} 仍含 Trending 分数营销`);
    assert.ok(/归一化/.test(text), `${file} 评分目标必须说明 v3 归一化口径`);
  });
}
