// 纯内容检查器（M3-5）：只依赖 README 字符串与显式项目类型，不触碰文件系统/网络。
// CLI（scripts/lib/check.ts）与静态 Web 评分页（web/src/main.ts）共用本模块，保证两端结果一致。
// 浏览器安全子集 = rules.yaml 中 browser_safe: true 的规则；其余确定性规则留在 check.ts（含 fs 层）。

import type { ProjectType, RuleStatus, Thresholds } from "./types.ts";

export interface ContentCtx {
  readme: string;
  types: ProjectType[];
}

export type Outcome =
  | { kind: "score"; score: number; evidence: string[]; reason: string }
  | { kind: "na" | "unverified"; reason: string };

export const na = (reason: string): Outcome => ({ kind: "na", reason });
export const unverified = (reason: string): Outcome => ({ kind: "unverified", reason });
export const score = (s: number, evidence: string[], reason: string): Outcome => ({
  kind: "score",
  score: s,
  evidence,
  reason,
});

/** 阈值 → 状态映射（CLI 与 Web 共用，阈值来自 rules.yaml / 投影）。 */
export function statusOf(thresholds: Thresholds, s: number): RuleStatus {
  if (s >= thresholds.pass) return "pass";
  if (s >= thresholds.partial) return "partial";
  return "fail";
}

// ---------- 共享 Markdown 解析辅助 ----------

export const GENERIC_ALTS = new Set(["image", "img", "screenshot", "picture", "photo", "icon", "图", "截图"]);

export interface ImageRef {
  alt: string;
  src: string;
  width?: string;
}

export function extractImages(readme: string): ImageRef[] {
  const imgs: ImageRef[] = [];
  for (const m of readme.matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)/g)) {
    imgs.push({ alt: m[1] ?? "", src: m[2] ?? "" });
  }
  for (const m of readme.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const alt = tag.match(/alt="([^"]*)"/)?.[1] ?? "";
    const src = tag.match(/src="([^"]*)"/)?.[1] ?? "";
    const width = tag.match(/width="?(\d+)/)?.[1];
    imgs.push({ alt, src, ...(width ? { width } : {}) });
  }
  return imgs;
}

export function countTables(readme: string): number {
  return (readme.match(/^\|[\s:|-]+\|$/gm) ?? []).length;
}

export function hasMermaid(readme: string): boolean {
  return /```mermaid/.test(readme);
}

// ---------- 浏览器安全检查器（仅 Markdown 字符串 + 项目类型） ----------

export const CONTENT_CHECKERS: Record<string, (ctx: ContentCtx) => Outcome> = {
  T03(ctx) {
    const n = (ctx.readme.match(/shields\.io/g) ?? []).length;
    if (n === 0) return score(0, ["badge-count=0"], "没有任何 shields.io badge");
    const text = ctx.readme.toLowerCase();
    const has = (...keys: string[]) => keys.some((k) => text.includes(k));
    if (n < 4 || n > 10) return score(1, [`badge-count=${n}`], `badge 数量 ${n}，不在 4-7 区间`);
    let s = 2;
    const evidence = [`badge-count=${n}`];
    if (has("license") && has("version", "/v/", "release")) s = 3;
    if (s >= 3 && has("workflow", "actions", "build") && has("dt", "downloads", "stars")) s = 4;
    if (s >= 4 && has("security", "dependabot") && has("docs", "documentation")) s = 5;
    evidence.push("shields-io-format");
    return score(s, evidence, `shields.io badge ${n} 个，信号覆盖到 ${s} 分档`);
  },

  T09(ctx) {
    if (ctx.types.length > 0 && ctx.types.every((t) => t === "cli")) {
      return na("简单 CLI 项目可豁免架构图");
    }
    if (hasMermaid(ctx.readme)) {
      return score(3, ["mermaid-diagram"], "存在 mermaid 架构图（内容覆盖度需 Agent 复核）");
    }
    const archImg = extractImages(ctx.readme).some((i) => /arch|架构|diagram/i.test(i.src + i.alt));
    if (archImg) return score(3, ["architecture-image"], "存在架构图图片");
    return score(0, [], "复杂项目缺少架构图");
  },

  T10(ctx) {
    const n = countTables(ctx.readme);
    if (n === 0) return score(0, ["table-count=0"], "没有任何表格");
    return score(3, [`table-count=${n}`], `含 ${n} 个表格（内容质量需 Agent 复核）`);
  },

  T16(ctx) {
    const imgs = extractImages(ctx.readme);
    const badAlt = imgs.filter((i) => !i.alt || GENERIC_ALTS.has(i.alt.toLowerCase()));
    const vagueAlt = imgs.filter((i) => i.alt && i.alt.trim().length < 8);
    if (imgs.length > 0 && badAlt.length > 0) {
      return score(1, [`bad-alt=${badAlt.length}`], `${badAlt.length} 张图像缺 alt 或 alt 为占位词`);
    }
    const tables = countTables(ctx.readme);
    if (tables === 0 && imgs.length === 0) return score(3, [], "无图像无表格，无 a11y 违规面（建议 Agent 复核）");
    if (vagueAlt.length > 0) return score(3, [`vague-alt=${vagueAlt.length}`], "alt 存在但不够具体");
    return score(4, [], "图像 alt 具体、表格均有 header 行");
  },
};
