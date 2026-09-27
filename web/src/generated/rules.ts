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
  /** 该确定性检查的检测手段说明；agent-reviewed 或缺省时为 null */
  detection: string | null;
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
    detection: null,
  },
  {
    id: "T02",
    title: "三秒价值主张",
    axis: "content",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
    detection: null,
  },
  {
    id: "T03",
    title: "Badge 矩阵",
    axis: "content",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 3 },
    browserSafe: true,
    detection: "按 Markdown 图片语法统计 badge 数量并匹配 shields.io 域名；只反映结构与来源，不判断 badge 是否指向真实可用的检查或版本。",
  },
  {
    id: "T04",
    title: "安装多路齐发",
    axis: "structure",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 3 },
    browserSafe: false,
    detection: null,
  },
  {
    id: "T05",
    title: "30 秒试用 + 60 秒 Quickstart",
    axis: "structure",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
    detection: null,
  },
  {
    id: "T06",
    title: "视觉矩阵",
    axis: "visual",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
    detection: "统计 README 中的图片与视频引用数量并检查 alt 是否非空；不判断截图内容是否与当前版本一致，也不评估视觉质量。",
  },
  {
    id: "T07",
    title: "卖点编号清单",
    axis: "content",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
    detection: null,
  },
  {
    id: "T08",
    title: "Feature 分组 + Ecosystem",
    axis: "visual",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
    detection: null,
  },
  {
    id: "T09",
    title: "架构图",
    axis: "content",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 3 },
    browserSafe: true,
    detection: "检测是否存在 Mermaid 代码块或图片引用的架构图；不判断图的语义正确性。",
  },
  {
    id: "T10",
    title: "对照表",
    axis: "content",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 1, pass: 3 },
    browserSafe: true,
    detection: "统计表格数量与表头列数；不判断表格内容是否真实构成差异化对比。",
  },
  {
    id: "T11",
    title: "引用 / 背书",
    axis: "content",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 1, pass: 3 },
    browserSafe: false,
    detection: null,
  },
  {
    id: "T12",
    title: "收尾五件套",
    axis: "structure",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
    detection: "检测治理文件是否存在（LICENSE / CONTRIBUTING / CODE_OF_CONDUCT / SECURITY.md）及 README 是否链接；不判断文件内容是否充分。",
  },
  {
    id: "T13",
    title: "i18n 规范",
    axis: "inclusive",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 1, pass: 3 },
    browserSafe: false,
    detection: "检测 BCP 47 命名的多语言 README 文件与显式支持策略声明；不判断所选默认语言是否匹配真实用户群体。",
  },
  {
    id: "T14",
    title: "包容性语言",
    axis: "inclusive",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
    detection: null,
  },
  {
    id: "T15",
    title: "LLM 友好元数据",
    axis: "ai",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 3 },
    browserSafe: false,
    detection: "按关键词与结构特征统计语义化章节标题与代码块；不判断文案是否真正便于 LLM 理解。",
  },
  {
    id: "T16",
    title: "无障碍 a11y",
    axis: "inclusive",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: true,
    detection: "统计缺失 alt 的图像与缺失表头的表格；只覆盖可静态检测的 a11y 面，不覆盖对比度、焦点顺序或动态内容。",
  },
  {
    id: "T17",
    title: "默认语言策略",
    axis: "content",
    evaluator: "agent-reviewed",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 1, pass: 3 },
    browserSafe: false,
    detection: null,
  },
  {
    id: "T18",
    title: "截图自动化",
    axis: "visual",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
    detection: "检测截图自动化 workflow 与截图文件命名模式；不执行截图，也不判断截图与代码是否同步。",
  },
  {
    id: "T19",
    title: "CI 可复现与可诊断",
    axis: "structure",
    evaluator: "deterministic",
    appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
    thresholds: { partial: 2, pass: 4 },
    browserSafe: false,
    detection: "检测 lockfile 是否入库、CI 是否使用 frozen install、运行时版本是否固定；不执行 CI，也不判断依赖是否可复现安装成功。",
  },
];
