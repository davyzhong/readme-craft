// readme-craft check：对目标项目 README 执行确定性规则，合并 Agent 评审，输出报告。
// 契约见统一执行方案 §3.4 / 设计稿 §9：JSON 顶层字段与规则字段固定；na/unverified 的 score 为 null。
// 纯内容检查（T03/T09/T10/T16）在 content-checks.ts，与 Web 端共用；本文件只保留 fs 增强层。

import { existsSync, readdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { Evaluator, ProjectType, Rule, RuleStatus, Spec } from "./types.ts";
import { internalId } from "./types.ts";
import { loadSpec, toolVersion } from "./spec.ts";
import { resolveProjectTypes } from "./project.ts";
import type { Outcome } from "./content-checks.ts";
import {
  CONTENT_CHECKERS,
  GENERIC_ALTS,
  extractImages,
  na,
  score,
  statusOf,
  unverified,
} from "./content-checks.ts";

const TOOL_VERSION = toolVersion();

// ---------- 报告类型（JSON 契约） ----------

export interface RuleResult {
  id: string;
  evaluator: Evaluator;
  status: RuleStatus;
  score: number | null;
  maximum: number;
  evidence: string[];
  reason: string;
  source: "deterministic" | "agent-reviewed";
}

export interface CheckReport {
  specVersion: string;
  toolVersion: string;
  projectTypes: string[];
  rules: RuleResult[];
  verifiedScore: number;
  verifiedMaximum: number;
  unverifiedCount: number;
  errors: string[];
  /** 文本形态报告；JSON 输出时不包含 */
  text: string;
}

// ---------- 确定性检查器 ----------

interface Ctx {
  root: string;
  readme: string;
  types: ProjectType[];
}

function listDir(ctx: Ctx, rel: string): string[] {
  const dir = path.join(ctx.root, rel);
  return existsSync(dir) ? readdirSync(dir) : [];
}

function readRel(ctx: Ctx, rel: string): string | null {
  const p = path.join(ctx.root, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : null;
}

const CHECKERS: Record<string, (ctx: Ctx) => Outcome> = {
  T03(ctx) {
    return CONTENT_CHECKERS.T03!(ctx);
  },

  T06(ctx) {
    const imgs = extractImages(ctx.readme);
    const hasVideo = /\.mp4|youtu\.?be|\.gif|vimeo/i.test(ctx.readme);
    const isGui = ctx.types.some((t) => t === "desktop" || t === "web-app");
    // 条件化（M2-R1）：非 GUI 类型且无任何图像/视频引用时无视觉检查面，不直接判 0 分
    if (imgs.length === 0 && !hasVideo && !isGui) {
      return na("非 GUI 类型且无图像/视频引用，视觉需求由 Agent 复核");
    }
    if (imgs.length === 0) return score(0, ["image-count=0"], "全文 0 张图");
    if (imgs.length < 3) return score(1, [`image-count=${imgs.length}`], "不足 3 张截图，未成组");
    const badAlt = imgs.filter((i) => !i.alt || GENERIC_ALTS.has(i.alt.toLowerCase()));
    let s = badAlt.length === 0 ? 3 : 2;
    if (s === 3 && hasVideo) s = 4;
    const automated =
      listDir(ctx, "scripts").some((f) => /screenshot/i.test(f)) ||
      listDir(ctx, ".github/workflows").some((f) => /screenshot|vhs|playwright/i.test(f));
    if (s >= 3 && automated) s = 5;
    return score(s, [`image-count=${imgs.length}`, `bad-alt=${badAlt.length}`], `图像 ${imgs.length} 张，视频 ${hasVideo ? "有" : "无"}，自动化 ${automated ? "有" : "无"}`);
  },

  T09(ctx) {
    return CONTENT_CHECKERS.T09!(ctx);
  },

  T10(ctx) {
    return CONTENT_CHECKERS.T10!(ctx);
  },

  T12(ctx) {
    const files = listDir(ctx, ".");
    const hasFile = (re: RegExp) => files.some((f) => re.test(f));
    const license = hasFile(/^LICENSE/i) || /#{1,3}\s*.*License/i.test(ctx.readme);
    const contributing = hasFile(/^CONTRIBUTING\.md$/i);
    const coc = hasFile(/^CODE_OF_CONDUCT\.md$/i);
    const security = hasFile(/^SECURITY\.md$/i);
    if (!license && !contributing && !coc && !security) return score(0, [], "五件套全缺");
    let s = 1;
    if (license && contributing) s = 2;
    if (license && contributing && coc && security) s = 3;
    if (s >= 3 && /sponsor|acknowledg|致谢|赞助/i.test(ctx.readme)) s = 4;
    if (s >= 4 && /roadmap|star history/i.test(ctx.readme)) s = 5;
    const present = [license && "license", contributing && "contributing", coc && "coc", security && "security"].filter(Boolean);
    return score(s, present as string[], `治理文件齐备度到 ${s} 分档`);
  },

  T13(ctx) {
    const files = listDir(ctx, ".");
    const i18nFiles = files.filter((f) => /^README\.[a-z]{2}(-[A-Za-z]{2,8})?\.md$/.test(f));
    const badNamed = files.filter(
      (f) => /^README\.[A-Za-z-]+\.md$/.test(f) && !i18nFiles.includes(f),
    );
    const hasPolicy = /仅.{0,4}(中文|英文)|欢迎 PR|支持策略|多语言|languages?\b|translations?/i.test(ctx.readme);
    if (badNamed.length > 0) return score(1, [`bad-named=${badNamed.join(",")}`], "多语言文件命名不符合 BCP 47");
    if (i18nFiles.length > 0 && hasPolicy) return score(3, i18nFiles, "命名合规且有支持策略");
    if (i18nFiles.length > 0) return score(2, i18nFiles, "命名合规但无支持策略说明");
    if (hasPolicy) return score(3, ["support-policy"], "单语言且显式说明支持策略");
    // 条件化（M2-R1）：是否有海外用户是事实外部信息，确定性检查无法断言，不直接判 0 分
    return unverified("无多语言文件也无支持策略声明；是否存在海外用户需作者/Agent 确认");
  },

  T15(ctx) {
    // frontmatter 存在时必须是合法 YAML：GitHub 会解析渲染，非法时整块报
    // "Error in user YAML"（实战案例：badge 被误插进 frontmatter，行首 ! 被
    // 解析为 tag 语法 —— 见 docs/audits/2026-09-23-sibling-readme-audit.md §九）
    const fm = ctx.readme.match(/^---\n([\s\S]*?)\n---/);
    if (fm?.[1] !== undefined) {
      try {
        YAML.parse(fm[1]);
      } catch (e) {
        const firstLine = (e instanceof Error ? e.message.split("\n")[0] : String(e)) ?? "";
        return score(1, ["frontmatter=invalid-yaml"], `frontmatter YAML 非法（GitHub 渲染报错）：${firstLine.slice(0, 100)}`);
      }
    }
    const headings = ctx.readme.match(/^#{1,3}\s+.*$/gm) ?? [];
    const semantic = headings.filter((h) =>
      /install|安装|quickstart|快速|usage|使用|architect|架构|features?|特性|license|许可/i.test(h),
    );
    if (semantic.length < 2) return score(1, [`semantic-headings=${semantic.length}`], "语义化章节标题不足");
    const hasFence = /```/.test(ctx.readme);
    let s = 2;
    if (hasFence) s = 3;
    const hasMeta = /^---\n[\s\S]*?\n---/.test(ctx.readme) || existsSync(path.join(ctx.root, "llms.txt"));
    if (s >= 3 && hasMeta) s = 4;
    return score(s, [`semantic-headings=${semantic.length}`], `语义标题 ${semantic.length} 个，代码块 ${hasFence ? "有" : "无"}，可选元数据 ${hasMeta ? "有" : "无"}`);
  },

  T16(ctx) {
    return CONTENT_CHECKERS.T16!(ctx);
  },

  T18(ctx) {
    const imgs = extractImages(ctx.readme).filter((i) => /\.(png|jpe?g|gif|webp|mp4)$/i.test(i.src));
    const workflows = listDir(ctx, ".github/workflows");
    const autoWorkflow = workflows.filter((f) => /screenshot|vhs|playwright/i.test(f));
    const autoScript = listDir(ctx, "scripts").filter((f) => /screenshot/i.test(f));
    const automated = autoWorkflow.length > 0 || autoScript.length > 0;
    if (!automated) {
      if (imgs.length === 0) return na("README 无本地截图引用，无截图自动化需求");
      const dated = imgs.filter((i) => /\d{4}[-_年]?\d{2}|img_\d+|screenshot\s*\d/i.test(i.src));
      if (dated.length > 0) return score(0, [`dated-names=${dated.length}`], "截图文件名带日期/序号，疑似手工维护");
      return score(1, [`local-images=${imgs.length}`], "有本地截图但无截图脚本");
    }
    let s = 3;
    const wfText = autoWorkflow.map((f) => readRel(ctx, `.github/workflows/${f}`) ?? "").join("\n");
    if (/cron/i.test(wfText)) s = 4;
    return score(s, [...autoWorkflow, ...autoScript], "截图由脚本/CI 产生");
  },

  T19(ctx) {
    const files = listDir(ctx, ".");
    const workflows = listDir(ctx, ".github/workflows").filter((f) => /\.ya?ml$/.test(f));
    const hasCi = workflows.length > 0 || files.includes(".gitlab-ci.yml");
    const lockfiles = ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "Cargo.lock", "poetry.lock", "uv.lock"];
    const lock = lockfiles.find((f) => files.includes(f));
    if (!hasCi && !lock) return na("项目无 CI 且无 lockfile，无复现性检查面");
    const gitignore = readRel(ctx, ".gitignore") ?? "";
    if (lockfiles.some((f) => gitignore.split("\n").map((l) => l.trim()).includes(f))) {
      return score(0, [], ".gitignore 排除了 lockfile（A13）");
    }
    if (hasCi && !lock) return score(0, [], "CI 存在但 lockfile 未入库");
    const wfText = workflows.map((f) => readRel(ctx, `.github/workflows/${f}`) ?? "").join("\n");
    const frozen = /npm ci|frozen-lockfile|--frozen/im.test(wfText);
    if (!frozen) return score(1, [lock ?? ""], "lockfile 入库但 CI 未用 frozen install");
    const pkg = readRel(ctx, "package.json");
    const pinned =
      (pkg ? "packageManager" in (JSON.parse(pkg) as object) : false) ||
      files.includes(".node-version") ||
      files.includes(".nvmrc") ||
      /node-version/i.test(wfText);
    if (!pinned) return score(2, [lock ?? "", "frozen-install"], "frozen install 就位但版本未固定");
    let s = 3;
    if (/markdown-link-check|lychee|readme-craft|链接检查/i.test(wfText)) s = 4;
    return score(s, [lock ?? "", "frozen-install", "pinned-versions"], "lockfile + frozen install + 版本固定");
  },
};

// ---------- review 合并 ----------

interface ReviewEntry {
  id: string;
  score?: number;
  status?: string;
  evidence?: string[];
  reason?: string;
}

interface ParsedReview {
  scored: Map<string, { score: number; evidence: string[]; reason: string }>;
  na: Map<string, string>;
  errors: string[];
}

function parseReviewFile(reviewPath: string, spec: Spec): ParsedReview {
  const result: ParsedReview = { scored: new Map(), na: new Map(), errors: [] };
  let data: unknown;
  try {
    data = YAML.parse(readFileSync(reviewPath, "utf8"));
  } catch (err) {
    result.errors.push(`review 文件解析失败：${(err as Error).message}`);
    return result;
  }
  const entries = (data as { reviews?: unknown })?.reviews;
  if (!Array.isArray(entries)) {
    result.errors.push("review 文件缺少 reviews 列表");
    return result;
  }
  const ruleById = new Map(spec.rules.map((r) => [r.id, r]));
  for (const raw of entries as ReviewEntry[]) {
    const id = internalId(String(raw?.id ?? ""));
    const rule = ruleById.get(id);
    if (!rule) {
      result.errors.push(`review 引用了不存在的规则：${raw?.id}`);
      continue;
    }
    if (rule.evaluator !== "agent-reviewed") {
      result.errors.push(`review 不能覆盖 deterministic 规则：${id}`);
      continue;
    }
    if (raw.status === "na") {
      if (!raw.reason || raw.reason.trim() === "") {
        result.errors.push(`${id} 的 na 必须附非空 reason`);
        continue;
      }
      result.na.set(id, raw.reason);
      continue;
    }
    if (typeof raw.score !== "number" || !Number.isInteger(raw.score) || raw.score < 0 || raw.score > 5) {
      result.errors.push(`${id} 的 score 必须是 0-5 的整数`);
      continue;
    }
    if (!raw.reason) {
      result.errors.push(`${id} 缺少 reason`);
      continue;
    }
    result.scored.set(id, { score: raw.score, evidence: raw.evidence ?? [], reason: raw.reason });
  }
  return result;
}

// ---------- 主流程 ----------

export interface CheckOptions {
  types?: string[];
  reviewPath?: string;
  format?: "text" | "json";
  output?: string;
  strict?: boolean;
}

export function checkProject(projectRoot: string, opts: CheckOptions): CheckReport {
  const spec = loadSpec();
  const resolution = resolveProjectTypes(projectRoot, { ...(opts.types ? { types: opts.types } : {}) });

  const readmePath = path.join(projectRoot, "README.md");
  const errors: string[] = [];
  let readme = "";
  if (existsSync(readmePath)) {
    readme = readFileSync(readmePath, "utf8");
  } else {
    errors.push(`目标项目缺少 README.md：${readmePath}`);
  }

  const review = opts.reviewPath ? parseReviewFile(opts.reviewPath, spec) : null;
  if (review) errors.push(...review.errors);

  const ctx: Ctx = { root: projectRoot, readme, types: resolution.types };
  const results: RuleResult[] = [];

  for (const rule of spec.rules) {
    const base = {
      id: rule.id,
      evaluator: rule.evaluator,
      maximum: 5,
      source: rule.evaluator,
    } as const;

    if (resolution.ambiguous) {
      results.push({ ...base, status: "unverified", score: null, evidence: [], reason: "项目类型无法唯一判断，不猜适用性" });
      continue;
    }

    const applicable = rule.applies_to.some((t) => resolution.types.includes(t));
    if (!applicable) {
      results.push({ ...base, status: "na", score: null, evidence: [], reason: `不适用于项目类型 ${resolution.types.join("/")}` });
      continue;
    }

    if (rule.evaluator === "agent-reviewed") {
      const scored = review?.scored.get(rule.id);
      const naReason = review?.na.get(rule.id);
      if (scored) {
        results.push({ ...base, status: statusOf(rule.thresholds, scored.score), score: scored.score, evidence: scored.evidence, reason: scored.reason });
      } else if (naReason) {
        results.push({ ...base, status: "na", score: null, evidence: [], reason: naReason });
      } else {
        results.push({ ...base, status: "unverified", score: null, evidence: [], reason: "agent-reviewed 规则默认未核验，由 Skill/Agent 补充" });
      }
      continue;
    }

    const outcome = CHECKERS[rule.id]?.(ctx) ?? { kind: "unverified" as const, reason: "该确定性规则暂无检查器" };
    if (outcome.kind === "score") {
      results.push({ ...base, status: statusOf(rule.thresholds, outcome.score), score: outcome.score, evidence: outcome.evidence, reason: outcome.reason });
    } else {
      results.push({ ...base, status: outcome.kind, score: null, evidence: [], reason: outcome.reason });
    }
  }

  const scoredResults = results.filter((r) => r.score !== null);
  const verifiedScore = scoredResults.reduce((sum, r) => sum + (r.score ?? 0), 0);
  const verifiedMaximum = scoredResults.length * 5;
  const unverifiedCount = results.filter((r) => r.status === "unverified").length;

  const report: CheckReport = {
    specVersion: spec.version,
    toolVersion: TOOL_VERSION,
    projectTypes: resolution.types,
    rules: results,
    verifiedScore,
    verifiedMaximum,
    unverifiedCount,
    errors,
    text: "",
  };
  report.text = renderText(report, resolution.source);
  return report;
}

function renderText(report: CheckReport, source: string): string {
  const lines: string[] = [];
  lines.push(`项目类型：${report.projectTypes.join(" + ") || "（未判定）"}（来源：${source}）`);
  lines.push(`规范版本：${report.specVersion} · 工具版本：${report.toolVersion}`);
  lines.push("");
  for (const r of report.rules) {
    const scorePart = r.score === null ? "  - " : `${r.score}/${r.maximum}`;
    lines.push(`  ${r.id} [${r.source}] ${r.status.padEnd(10)} ${scorePart}  ${r.reason}`);
  }
  lines.push("");
  if (report.unverifiedCount > 0) {
    lines.push(`已核验得分：${report.verifiedScore}/${report.verifiedMaximum} 适用分；未核验 ${report.unverifiedCount} 项（不输出总分）`);
  } else {
    const normalized = report.verifiedMaximum === 0 ? 0 : (report.verifiedScore / report.verifiedMaximum) * 100;
    lines.push(`总分：归一化 ${normalized.toFixed(1)}/100（原始得分 ${report.verifiedScore}/${report.verifiedMaximum} 适用满分）`);
  }
  if (report.errors.length > 0) {
    lines.push(`错误：${report.errors.join("；")}`);
  }
  return lines.join("\n");
}

/** 供 CLI 使用：计算退出码。 */
export function exitCodeOf(report: CheckReport, strict: boolean): number {
  if (report.errors.length > 0) return 2; // 输入/运行环境错误
  const verified = report.rules.filter((r) => r.score !== null);
  if (strict) {
    return verified.some((r) => r.status === "partial" || r.status === "fail") ? 1 : 0;
  }
  return verified.some((r) => r.status === "fail") ? 1 : 0;
}

/** 供 CLI 使用：产出文本/JSON，并按需原子写入 --output。 */
export function emitReport(report: CheckReport, format: "text" | "json", output?: string): string {
  const content =
    format === "json"
      ? JSON.stringify(
          Object.fromEntries(Object.entries(report).filter(([k]) => k !== "text")),
          null,
          2,
        ) + "\n"
      : report.text + "\n";
  if (output) {
    const tmp = `${output}.tmp-${process.pid}`;
    writeFileSync(tmp, content);
    renameSync(tmp, output); // 原子写入
  }
  return content;
}
