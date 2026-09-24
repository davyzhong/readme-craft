// readme-craft v3 规则规范的类型定义。
// 设计依据：docs/superpowers/specs/2026-09-22-readme-craft-v3-design.md §6/§7。

export const PROJECT_TYPES = [
  "cli",
  "library",
  "desktop",
  "web-app",
  "service",
  "knowledge-base",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const EVALUATORS = ["deterministic", "agent-reviewed"] as const;
export type Evaluator = (typeof EVALUATORS)[number];

export const RULE_STATUSES = ["pass", "partial", "fail", "na", "unverified"] as const;
export type RuleStatus = (typeof RULE_STATUSES)[number];

export const AXES = ["structure", "content", "visual", "ai", "inclusive"] as const;
export type Axis = (typeof AXES)[number];

export const SCORE_LEVELS = ["0", "1", "2", "3", "4", "5"] as const;
export type ScoreLevel = (typeof SCORE_LEVELS)[number];

export interface Thresholds {
  partial: number;
  pass: number;
}

export interface Rule {
  /** 规范内部 ID，零填充，如 T04 */
  id: string;
  title: string;
  axis: Axis;
  applies_to: ProjectType[];
  intent: string;
  scores: Record<ScoreLevel, string>;
  evidence: string[];
  evaluator: Evaluator;
  thresholds: Thresholds;
  /**
   * 是否可安全在浏览器中运行（仅依赖 Markdown 字符串与显式项目类型，无文件系统/网络依赖）。
   * deterministic 规则必须显式声明；agent-reviewed 规则不得为 true。
   */
  browser_safe?: boolean;
}

export interface AntiPattern {
  /** 规范内部 ID，零填充，如 A04 */
  id: string;
  title: string;
  maps_to: string[];
}

export interface Spec {
  version: string;
  rules: Rule[];
  antiPatterns: AntiPattern[];
}

/** 散文文档使用不归零写法（T4），规范内部使用零填充（T04）。 */
export function proseId(internalId: string): string {
  return internalId.replace(/^([TA])0(\d)$/, "$1$2");
}

export function internalId(prose: string): string {
  return prose.replace(/^([TA])(\d)$/, "$10$2");
}
