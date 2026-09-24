// 从 rules.yaml 生成带边界标记的文档区块。
// 对外区块只展示归一化百分制 + 适用项数 + 未核验项数（§0.6 评分展示策略）。
// 生成必须幂等：连续运行两次零 diff；--check 不写文件，过期返回 stale 清单。

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Axis, Evaluator, Spec } from "./types.ts";
import { proseId } from "./types.ts";
import { loadSpec } from "./spec.ts";

export class GenerateError extends Error {
  override readonly name = "GenerateError";
}

export interface GeneratedBlock {
  /** 仓库相对路径 */
  file: string;
  /** 标记名：<!-- BEGIN GENERATED:<name> --> */
  name: string;
  render: (spec: Spec) => string;
  /**
   * true 时 render 输出完整文件内容（不依赖标记），用于 web/src/generated 等纯生成文件；
   * 缺省走 <!-- BEGIN/END GENERATED --> 区块替换。
   */
  wholeFile?: boolean;
}

const AXIS_LABELS: Record<Axis, string> = {
  structure: "结构",
  content: "内容",
  visual: "视觉",
  ai: "AI",
  inclusive: "包容",
};

const EVALUATOR_LABELS: Record<Evaluator, string> = {
  deterministic: "脚本确定性",
  "agent-reviewed": "Agent 评审",
};

/** 把内容写进一对生成标记之间。标记缺失或重复抛 GenerateError。 */
export function applyBlock(content: string, name: string, inner: string): string {
  const begin = `<!-- BEGIN GENERATED:${name} -->`;
  const end = `<!-- END GENERATED:${name} -->`;
  const beginCount = content.split(begin).length - 1;
  const endCount = content.split(end).length - 1;
  if (beginCount === 0 || endCount === 0) {
    throw new GenerateError(`缺少生成标记 ${name}`);
  }
  if (beginCount > 1 || endCount > 1) {
    throw new GenerateError(`生成标记 ${name} 重复出现`);
  }
  const beginEnd = content.indexOf(begin) + begin.length;
  const endStart = content.indexOf(end);
  if (endStart < beginEnd) {
    throw new GenerateError(`生成标记 ${name} 顺序错误`);
  }
  return `${content.slice(0, beginEnd)}\n${inner}\n${content.slice(endStart)}`;
}

export function renderVersionSummary(spec: Spec): string {
  return (
    `> 规范版本 **${spec.version}** · **${spec.rules.length}** 条铁律 · ` +
    `**${spec.antiPatterns.length}** 条反模式 · 评分对外展示：归一化百分制 + 适用项数 + 未核验项数（原始得分 / 适用满分见检查报告）`
  );
}

export function renderRuleSummary(spec: Spec): string {
  const rows = spec.rules.map(
    (r) =>
      `| **${proseId(r.id)}** | ${r.title} | ${AXIS_LABELS[r.axis]} | ${r.intent} | ${EVALUATOR_LABELS[r.evaluator]} |`,
  );
  return [
    "| # | 铁律 | 轴 | 核心动作 | 评估方式 |",
    "|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

export function renderAntiPatternSummary(spec: Spec): string {
  const rows = spec.antiPatterns.map(
    (a) => `| **${proseId(a.id)}** | ${a.title} | ${a.maps_to.map(proseId).join(" / ")} |`,
  );
  return ["| # | 反模式 | 解药 |", "|---|---|---|", ...rows].join("\n");
}

export function renderScoringTable(spec: Spec): string {
  const rows = spec.rules.map(
    (r) =>
      `| ${proseId(r.id)} ${r.title} | ${AXIS_LABELS[r.axis]} | ${EVALUATOR_LABELS[r.evaluator]} | ✅/⚠️/❌/N/A | _/5 |`,
  );
  return [
    "每条铁律满分 5 分；不适用项计 N/A 并从满分中扣除；无法核验的项单独计数，不猜总分。",
    "",
    "| 铁律 | 轴 | 评估方式 | 状态 | 得分 |",
    "|---|---|---|---|---|",
    ...rows,
    "",
    "**总分**：归一化 __/100（原始得分 __/__ 适用满分；未核验 __ 项）",
  ].join("\n");
}

export function renderSkillChecklist(spec: Spec): string {
  const rows = spec.rules.map(
    (r) => `| ${proseId(r.id)} ${r.title} | ${AXIS_LABELS[r.axis]} | ✅/⚠️/❌/N/A | |`,
  );
  return [
    "| 铁律 | 轴 | 状态 | 备注 |",
    "|---|---|---|---|",
    ...rows,
    "",
    "**评分口径**：归一化百分制（得分 / 适用项满分 × 100）+ 适用项数 + 未核验项数；agent-reviewed 规则默认 unverified，不伪造分数。",
  ].join("\n");
}

export function renderBannerStats(spec: Spec): string {
  return (
    `<text x="600" y="118" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="20" font-weight="400" fill="#c7d2fe">` +
    `${spec.rules.length} 条铁律 · ${spec.antiPatterns.length} 条反模式 · 量化评分 · craft-readme Skill</text>`
  );
}

/**
 * 浏览器规则投影（M3-4）：只含 Web 评分页所需字段。
 * browserSafe = rules.yaml 的 browser_safe（缺省 false）；agent-reviewed 恒为 false。
 */
export function renderRulesProjection(spec: Spec): string {
  const rows = spec.rules.map((r) => {
    const appliesTo = r.applies_to.map((t) => JSON.stringify(t)).join(", ");
    return (
      `  {\n` +
      `    id: ${JSON.stringify(r.id)},\n` +
      `    title: ${JSON.stringify(r.title)},\n` +
      `    axis: ${JSON.stringify(r.axis)},\n` +
      `    evaluator: ${JSON.stringify(r.evaluator)},\n` +
      `    appliesTo: [${appliesTo}],\n` +
      `    thresholds: { partial: ${r.thresholds.partial}, pass: ${r.thresholds.pass} },\n` +
      `    browserSafe: ${r.browser_safe === true},\n` +
      `  },`
    );
  });
  return `// GENERATED FILE — 由 \`pnpm readme-craft generate\` 从 rules.yaml 生成，请勿手改。
// 浏览器安全子集（browserSafe: true）= 仅依赖 Markdown 字符串与显式项目类型的确定性检查；
// 文件系统 / 远程链接 / agent-reviewed 规则在 Web 端一律显示 unverified。

export const RULES_VERSION = ${JSON.stringify(spec.version)};

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
${rows.join("\n")}
];
`;
}

/** 生成区块注册表：目标文件 ↔ 标记 ↔ 渲染器。新增区块必须先在此登记。 */
export const GENERATED_BLOCKS: GeneratedBlock[] = [
  { file: "README.md", name: "version-summary", render: renderVersionSummary },
  { file: "README.md", name: "rule-summary", render: renderRuleSummary },
  { file: "README.md", name: "anti-pattern-summary", render: renderAntiPatternSummary },
  { file: "checklist.md", name: "scoring-table", render: renderScoringTable },
  { file: "skill/SKILL.md", name: "skill-checklist", render: renderSkillChecklist },
  { file: "assets/banner.svg", name: "banner-stats", render: renderBannerStats },
  {
    file: "web/src/generated/rules.ts",
    name: "rules-projection",
    render: renderRulesProjection,
    wholeFile: true,
  },
];

export interface GenerateResult {
  /** --check 模式下内容已过期的文件（仓库相对路径） */
  stale: string[];
}

export function generateAll(
  root: string,
  opts: { check: boolean; blocks?: GeneratedBlock[]; spec?: Spec },
): GenerateResult {
  const spec = opts.spec ?? loadSpec(path.join(root, "rules.yaml"));
  const blocks = opts.blocks ?? GENERATED_BLOCKS;
  const stale: string[] = [];

  for (const block of blocks) {
    const filePath = path.join(root, block.file);
    if (block.wholeFile) {
      // 整文件生成：render 输出完整内容；check 模式下文件缺失也计 stale
      const after = block.render(spec);
      const before = existsSync(filePath) ? readFileSync(filePath, "utf8") : null;
      if (before !== after) {
        stale.push(block.file);
        if (!opts.check) {
          mkdirSync(path.dirname(filePath), { recursive: true });
          writeFileSync(filePath, after);
        }
      }
      continue;
    }
    if (!existsSync(filePath)) {
      throw new GenerateError(`生成目标不存在：${block.file}`);
    }
    const before = readFileSync(filePath, "utf8");
    const after = applyBlock(before, block.name, block.render(spec));
    if (after !== before) {
      stale.push(block.file);
      if (!opts.check) writeFileSync(filePath, after);
    }
  }
  return { stale };
}
