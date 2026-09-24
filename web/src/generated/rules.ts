// GENERATED FILE — 由 `pnpm readme-craft generate` 从 rules.yaml 生成，请勿手改。
// 浏览器安全子集（browserSafe: true）= 仅依赖 Markdown 字符串与显式项目类型的确定性检查；
// 文件系统 / 远程链接 / agent-reviewed 规则在 Web 端一律显示 unverified。

export const RULES_VERSION = "3.0.0-alpha.0";

export type ProjectedAxis = "structure" | "content" | "visual" | "ai" | "inclusive";
export type ProjectedEvaluator = "deterministic" | "agent-reviewed";
export type ProjectedProjectType =
  | "cli"
  | "library"
  | "desktop"
  | "web-app"
  | "service"
  | "knowledge-base";

export interface ProjectedRule {
  id: string;
  title: string;
  axis: ProjectedAxis;
  evaluator: ProjectedEvaluator;
  appliesTo: ProjectedProjectType[];
  thresholds: { partial: number; pass: number };
  browserSafe: boolean;
}

export const RULES: ProjectedRule[] = [
  {
    id: "T01",
    title: "视觉锤",
    axis: "visual",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
  },
  {
    id: "T02",
    title: "三秒价值主张",
    axis: "content",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
  },
  {
    id: "T03",
    title: "Badge 矩阵",
    axis: "content",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 3 },
    browserSafe: true,
  },
  {
    id: "T04",
    title: "安装多路齐发",
    axis: "structure",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 3 },
    browserSafe: false,
  },
  {
    id: "T05",
    title: "30 秒试用 + 60 秒 Quickstart",
    axis: "structure",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
  },
  {
    id: "T06",
    title: "视觉矩阵",
    axis: "visual",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
  },
  {
    id: "T07",
    title: "卖点编号清单",
    axis: "content",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
  },
  {
    id: "T08",
    title: "Feature 分组 + Ecosystem",
    axis: "visual",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
  },
  {
    id: "T09",
    title: "架构图",
    axis: "content",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 3 },
    browserSafe: true,
  },
  {
    id: "T10",
    title: "对照表",
    axis: "content",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 1, pass: 3 },
    browserSafe: true,
  },
  {
    id: "T11",
    title: "引用 / 背书",
    axis: "content",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 1, pass: 3 },
    browserSafe: false,
  },
  {
    id: "T12",
    title: "收尾五件套",
    axis: "structure",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
  },
  {
    id: "T13",
    title: "i18n 规范",
    axis: "inclusive",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 1, pass: 3 },
    browserSafe: false,
  },
  {
    id: "T14",
    title: "包容性语言",
    axis: "inclusive",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
  },
  {
    id: "T15",
    title: "LLM 友好元数据",
    axis: "ai",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 3 },
    browserSafe: false,
  },
  {
    id: "T16",
    title: "无障碍 a11y",
    axis: "inclusive",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: true,
  },
  {
    id: "T17",
    title: "默认语言策略",
    axis: "content",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 1, pass: 3 },
    browserSafe: false,
  },
  {
    id: "T18",
    title: "截图自动化",
    axis: "visual",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
  },
  {
    id: "T19",
    title: "CI 可复现与可诊断",
    axis: "structure",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
  },
];
