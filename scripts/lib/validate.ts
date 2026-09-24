// 仓库自身一致性校验。
// 覆盖：P9 三处版本一致、旧口径漂移、内部链接与锚点、未声明占位符、生成区块新鲜度。
// 外部 URL 离线跳过；模板与已声明 fixture 豁免占位符检查；软链文件跳过（包视图副本）。

import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { Spec } from "./types.ts";
import { proseId } from "./types.ts";
import { loadSpec } from "./spec.ts";
import { generateAll, GenerateError } from "./generate.ts";

export interface Issue {
  check: string;
  file?: string;
  message: string;
}

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".local"]);

function walkMd(dir: string, root: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const rel = path.relative(root, full);
    if (lstatSync(full).isSymbolicLink()) continue; // skill/ 包视图软链扫根文件即可
    if (lstatSync(full).isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue;
      walkMd(full, root, out);
    } else if (entry.endsWith(".md")) {
      out.push(rel);
    }
  }
  return out;
}

/** 去除围栏代码块（支持嵌套：闭合线必须与开围栏同字符、同长度且无 info string）。 */
function stripCodeFences(text: string): string {
  const out: string[] = [];
  let fence: { char: string; len: number } | null = null;
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (m) {
      const marker = m[1] ?? "";
      const char = marker[0] ?? "`";
      if (!fence) {
        fence = { char, len: marker.length };
        continue;
      }
      if (char === fence.char && marker.length >= fence.len && (m[2] ?? "").trim() === "") {
        fence = null;
        continue;
      }
    }
    if (!fence) out.push(line);
  }
  return out.join("\n");
}

/** 去除行内代码（`...`），其中的示例链接/占位符不参与检查。 */
function stripInlineCode(text: string): string {
  return text.replace(/`[^`\n]*`/g, "");
}

function stripCode(text: string): string {
  return stripInlineCode(stripCodeFences(text));
}

/** GitHub 风格锚点：小写、去除标点与 emoji、空白转连字符（CJK 保留）。 */
export function githubSlug(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s+/g, "-");
}

// ---------- P9：rules.yaml / package.json / SKILL frontmatter 三处版本一致 ----------

export function checkVersionConsistency(root: string, spec: Spec): Issue[] {
  const issues: Issue[] = [];

  const pkgPath = path.join(root, "package.json");
  if (!existsSync(pkgPath)) {
    issues.push({ check: "version", file: "package.json", message: "package.json 不存在" });
  } else {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version?: string };
    if (pkg.version !== spec.version) {
      issues.push({
        check: "version",
        file: "package.json",
        message: `package.json version(${pkg.version}) 与 rules.yaml version(${spec.version}) 不一致`,
      });
    }
  }

  const skillPath = path.join(root, "skill", "SKILL.md");
  if (!existsSync(skillPath)) {
    issues.push({ check: "version", file: "skill/SKILL.md", message: "skill/SKILL.md 不存在" });
  } else {
    const text = readFileSync(skillPath, "utf8");
    const fm = text.match(/^---\n([\s\S]*?)\n---/);
    const version = fm ? (YAML.parse(fm[1] ?? "") as { version?: string }).version : undefined;
    if (version !== spec.version) {
      issues.push({
        check: "version",
        file: "skill/SKILL.md",
        message: `SKILL frontmatter version(${version ?? "缺失"}) 与 rules.yaml version(${spec.version}) 不一致`,
      });
    }
  }

  return issues;
}

// ---------- 旧口径漂移（CLAUDE.md 临时 grep 的工具化） ----------

const DRIFT_PATTERN = /16 条铁律|17 条铁律|18 条铁律|80 分|85 分|90 分/;
const HISTORY_LINE = /历史|演进/;
const HISTORY_HEADING = /历史|演进|升级摘要/;
/** CHANGELOG 每一行都是历史记录，整体豁免口径漂移检查 */
const DRIFT_EXEMPT_FILES = new Set(["CHANGELOG.md"]);

export function checkScaleDrift(root: string): Issue[] {
  const issues: Issue[] = [];
  const files = walkMd(root, root).filter(
    (f) => !f.startsWith(`docs${path.sep}superpowers${path.sep}`) && !DRIFT_EXEMPT_FILES.has(f),
  );
  for (const rel of files) {
    const lines = stripCode(readFileSync(path.join(root, rel), "utf8")).split("\n");
    let heading = "";
    for (const line of lines) {
      const h = line.match(/^#{1,3}\s+(.*)$/);
      if (h) heading = h[1] ?? "";
      if (!DRIFT_PATTERN.test(line)) continue;
      if (HISTORY_LINE.test(line) || HISTORY_HEADING.test(heading)) continue;
      issues.push({ check: "scale-drift", file: rel, message: `疑似旧口径残留：${line.trim().slice(0, 60)}` });
    }
  }
  return issues;
}

// ---------- 相对链接与锚点 ----------

interface LinkRef {
  file: string;
  raw: string;
}

function extractLinks(rel: string, text: string): LinkRef[] {
  const stripped = stripCode(text);
  const refs: LinkRef[] = [];
  for (const m of stripped.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    refs.push({ file: rel, raw: m[1] ?? "" });
  }
  return refs;
}

function collectAnchors(text: string): Set<string> {
  const anchors = new Set<string>();
  const counts = new Map<string, number>();
  for (const line of stripCodeFences(text).split("\n")) {
    const h = line.match(/^#{1,6}\s+(.*)$/);
    if (!h) continue;
    const base = githubSlug((h[1] ?? "").trim());
    const seen = counts.get(base) ?? 0;
    counts.set(base, seen + 1);
    anchors.add(seen === 0 ? base : `${base}-${seen}`);
  }
  return anchors;
}

export function checkLinks(root: string): Issue[] {
  const issues: Issue[] = [];
  const exempt = (rel: string) =>
    rel.startsWith(`docs${path.sep}superpowers${path.sep}`) ||
    // 演示 fixture 内的链接指向目标项目结构（assets/、docs/ 等），在本仓不解析
    rel.startsWith(`tests${path.sep}fixtures${path.sep}mouthtype${path.sep}`) ||
    // 模板链接指向目标项目结构（docs/、assets/ 等），在本仓不解析
    rel.startsWith(`templates${path.sep}`);

  const files = walkMd(root, root).filter((f) => !exempt(f));
  const anchorCache = new Map<string, Set<string>>();
  const anchorsOf = (rel: string): Set<string> => {
    if (!anchorCache.has(rel)) {
      anchorCache.set(rel, collectAnchors(readFileSync(path.join(root, rel), "utf8")));
    }
    return anchorCache.get(rel) ?? new Set();
  };

  for (const rel of files) {
    const text = readFileSync(path.join(root, rel), "utf8");
    for (const { raw } of extractLinks(rel, text)) {
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw) || raw.startsWith("//")) continue; // 外部 URL 离线跳过
      const [filePart, fragment] = raw.split("#");
      const targetRel =
        filePart === undefined || filePart === ""
          ? rel
          : path.normalize(path.join(path.dirname(rel), filePart));
      if (filePart && !existsSync(path.join(root, targetRel))) {
        issues.push({ check: "link", file: rel, message: `断链：${raw}` });
        continue;
      }
      if (fragment && targetRel.endsWith(".md")) {
        if (!anchorsOf(targetRel).has(decodeURIComponent(fragment))) {
          issues.push({ check: "anchor", file: rel, message: `坏锚点：${raw}` });
        }
      }
    }
  }
  return issues;
}

// ---------- 未声明占位符 ----------

const PLACEHOLDER_PATTERN = /yourname|your-project|your_project|FIXME|(?<!\[)\bTODO\b/;
const PLACEHOLDER_EXEMPT = (rel: string) =>
  rel.startsWith(`templates${path.sep}`) ||
  rel.startsWith(`examples${path.sep}`) ||
  // demo fixture 含显式声明的 yourname 占位（教学用途）
  rel.startsWith(`tests${path.sep}fixtures${path.sep}mouthtype${path.sep}`) ||
  rel.startsWith(`docs${path.sep}superpowers${path.sep}`);

export function checkPlaceholders(root: string): Issue[] {
  const issues: Issue[] = [];
  for (const rel of walkMd(root, root)) {
    if (PLACEHOLDER_EXEMPT(rel)) continue; // 模板与已声明 fixture 豁免
    const text = stripCode(readFileSync(path.join(root, rel), "utf8"));
    for (const line of text.split("\n")) {
      if (PLACEHOLDER_PATTERN.test(line)) {
        issues.push({ check: "placeholder", file: rel, message: `未声明占位符：${line.trim().slice(0, 60)}` });
      }
    }
  }
  return issues;
}

// ---------- 生成区块新鲜度 ----------

export function checkGeneratedFreshness(
  root: string,
  spec: Spec,
  blocks?: import("./generate.ts").GeneratedBlock[],
): Issue[] {
  const issues: Issue[] = [];
  try {
    const { stale } = generateAll(root, { check: true, spec, ...(blocks ? { blocks } : {}) });
    for (const file of [...new Set(stale)]) {
      issues.push({ check: "generated", file, message: "生成区块已过期，请运行 pnpm readme-craft generate" });
    }
  } catch (err) {
    if (err instanceof GenerateError) {
      issues.push({ check: "generated", message: err.message });
    } else {
      throw err;
    }
  }
  return issues;
}

// ---------- 规则引用一致性（M2-R3：散文 ID + 标题与 rules.yaml 对齐） ----------

/**
 * 铁律 T1..T19：METHODOLOGY.md / checklist.md / skill/SKILL.md 都必须出现散文 ID 与 rules.yaml 原标题。
 * 反模式 A1..A13：METHODOLOGY.md / checklist.md 必须出现；SKILL.md 的反模式引用在生成区块内使用规范 ID，豁免散文检查。
 */
export function checkRuleRefs(root: string, spec: Spec): Issue[] {
  const issues: Issue[] = [];
  const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");

  const ruleDocs = ["METHODOLOGY.md", "checklist.md", `skill${path.sep}SKILL.md`];
  for (const rel of ruleDocs) {
    if (!existsSync(path.join(root, rel))) continue;
    const text = read(rel);
    for (const rule of spec.rules) {
      const pid = proseId(rule.id);
      if (!new RegExp(`\\b${pid}\\b`).test(text)) {
        issues.push({ check: "rule-ref", file: rel, message: `缺少规则引用 ${pid}（${rule.title}）` });
      } else if (!text.includes(rule.title)) {
        issues.push({ check: "rule-ref", file: rel, message: `${pid} 标题与 rules.yaml 不一致：应为「${rule.title}」` });
      }
    }
  }

  const antiDocs = ["METHODOLOGY.md", "checklist.md"];
  for (const rel of antiDocs) {
    if (!existsSync(path.join(root, rel))) continue;
    const text = read(rel);
    for (const anti of spec.antiPatterns ?? []) {
      const pid = proseId(anti.id);
      if (!new RegExp(`\\b${pid}\\b`).test(text)) {
        issues.push({ check: "rule-ref", file: rel, message: `缺少反模式引用 ${pid}（${anti.title}）` });
      } else if (!text.includes(anti.title)) {
        issues.push({ check: "rule-ref", file: rel, message: `${pid} 标题与 rules.yaml 不一致：应为「${anti.title}」` });
      }
    }
  }
  return issues;
}

// ---------- 汇总 ----------

export function validateRepo(root: string): { issues: Issue[] } {
  const spec = loadSpec(path.join(root, "rules.yaml")); // Schema/Semantic 错误向上抛
  const issues: Issue[] = [
    ...checkVersionConsistency(root, spec),
    ...checkScaleDrift(root),
    ...checkLinks(root),
    ...checkPlaceholders(root),
    ...checkGeneratedFreshness(root, spec),
    ...checkRuleRefs(root, spec),
  ];
  return { issues };
}
