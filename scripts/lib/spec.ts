// rules.yaml 解析与校验。
// 错误分层：Schema 错误（结构/枚举/六档缺失）→ SchemaError，对应 CLI 退出码 2；
// 语义不一致（重复 ID、阈值倒挂、反模式引用悬空）→ SemanticError，对应退出码 1。

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { Ajv2020 } from "ajv/dist/2020.js";
import type { ErrorObject } from "ajv";
import type { Spec } from "./types.ts";
import { SCORE_LEVELS } from "./types.ts";

export class SchemaError extends Error {
  override readonly name = "SchemaError";
}

export class SemanticError extends Error {
  override readonly name = "SemanticError";
}

// build.ts 用 esbuild define 注入内嵌副本（standalone bundle 用）；源码运行时为 undefined，回退到文件读取。
declare const __README_CRAFT_EMBEDDED__:
  | { rulesYaml: string; schemaJson: string; version: string }
  | undefined;

const embedded =
  typeof __README_CRAFT_EMBEDDED__ === "undefined" ? undefined : __README_CRAFT_EMBEDDED__;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCHEMA_PATH = path.join(repoRoot, "rules.schema.json");
const SPEC_PATH = path.join(repoRoot, "rules.yaml");

/** 工具版本：bundle 用内嵌值，源码读 package.json。 */
export function toolVersion(): string {
  if (embedded) return embedded.version;
  return (JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8")) as { version: string })
    .version;
}

const ajv = new Ajv2020({ allErrors: true });
const validateSchema = ajv.compile(
  JSON.parse(embedded ? embedded.schemaJson : readFileSync(SCHEMA_PATH, "utf8")) as Record<string, unknown>,
);

function formatAjvErrors(): string {
  return (validateSchema.errors ?? [])
    .map((e: ErrorObject) => `  ${e.instancePath || "/"} ${e.message ?? ""}`)
    .join("\n");
}

/** 语义校验：Schema 表达不了的一致性规则。返回问题清单（空数组 = 通过）。 */
export function validateSpecSemantics(spec: Spec): string[] {
  const problems: string[] = [];

  const ruleIds = new Set<string>();
  for (const rule of spec.rules) {
    if (ruleIds.has(rule.id)) problems.push(`重复的规则 ID：${rule.id}`);
    ruleIds.add(rule.id);
    const { partial, pass } = rule.thresholds;
    if (!(partial < pass)) {
      problems.push(`${rule.id} 阈值倒挂：partial(${partial}) 必须小于 pass(${pass})`);
    }
    if (rule.evaluator === "deterministic" && typeof rule.browser_safe !== "boolean") {
      problems.push(`${rule.id} 是 deterministic 规则，必须显式声明 browser_safe`);
    }
    if (rule.evaluator === "agent-reviewed" && rule.browser_safe === true) {
      problems.push(`${rule.id} 是 agent-reviewed 规则，browser_safe 不得为 true`);
    }
    for (const level of SCORE_LEVELS) {
      if (!rule.scores[level]) problems.push(`${rule.id} 缺少 ${level} 分档锚点`);
    }
  }

  const antiIds = new Set<string>();
  for (const anti of spec.antiPatterns) {
    if (antiIds.has(anti.id)) problems.push(`重复的反模式 ID：${anti.id}`);
    antiIds.add(anti.id);
    for (const ref of anti.maps_to) {
      if (!ruleIds.has(ref)) problems.push(`${anti.id} 引用了不存在的规则：${ref}`);
    }
  }

  return problems;
}

/** 从 YAML 文本解析并校验规则规范。 */
export function parseSpec(text: string): Spec {
  let data: unknown;
  try {
    data = YAML.parse(text);
  } catch (err) {
    throw new SchemaError(`rules.yaml 不是合法 YAML：${(err as Error).message}`);
  }

  if (!validateSchema(data)) {
    throw new SchemaError(`rules.yaml 结构不合法：\n${formatAjvErrors()}`);
  }

  const spec = data as Spec;
  const problems = validateSpecSemantics(spec);
  if (problems.length > 0) {
    throw new SemanticError(`rules.yaml 语义不一致：\n${problems.map((p) => `  ${p}`).join("\n")}`);
  }
  return spec;
}

/** 读取并校验规则规范。bundle 内嵌副本优先；显式 specPath 始终读文件（validate 校验本仓时用）。 */
export function loadSpec(specPath?: string): Spec {
  if (!specPath && embedded) return parseSpec(embedded.rulesYaml);
  const resolved = specPath ?? SPEC_PATH;
  let text: string;
  try {
    text = readFileSync(resolved, "utf8");
  } catch {
    throw new SchemaError(`找不到规则规范文件：${resolved}`);
  }
  return parseSpec(text);
}
