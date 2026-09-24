// 静态 Web 评分页（M3-5）：浏览器本地运行 browser-safe 确定性规则。
// 与 CLI 共用 scripts/lib/content-checks.ts；本文件只做交互与渲染，不复制评分逻辑。

import { RULES, RULES_VERSION } from "./generated/rules.ts";
import type { ProjectedProjectType, ProjectedRule } from "./generated/rules.ts";
import { CONTENT_CHECKERS, statusOf } from "../../scripts/lib/content-checks.ts";
import type { Outcome } from "../../scripts/lib/content-checks.ts";
import { STYLE } from "./style.ts";

type RuleStatus = "pass" | "partial" | "fail" | "na" | "unverified";

interface Row {
  rule: ProjectedRule;
  status: RuleStatus;
  score: number | null;
  reason: string;
}

const ALL_TYPES: { value: ProjectedProjectType; label: string }[] = [
  { value: "cli", label: "CLI" },
  { value: "library", label: "库" },
  { value: "desktop", label: "桌面应用" },
  { value: "web-app", label: "Web 应用" },
  { value: "service", label: "服务" },
  { value: "knowledge-base", label: "知识库" },
];

const AXIS_LABELS: Record<string, string> = {
  structure: "结构",
  content: "内容",
  visual: "视觉",
  ai: "AI",
  inclusive: "包容",
};

const STATUS_LABELS: Record<RuleStatus, string> = {
  pass: "✅ 通过",
  partial: "⚠️ 部分",
  fail: "❌ 未达",
  na: "N/A",
  unverified: "❔ 未核验",
};

function evaluate(readme: string, types: ProjectedProjectType[]): Row[] {
  const rows: Row[] = [];
  for (const rule of RULES) {
    const applicable = rule.appliesTo.some((t) => types.includes(t));
    if (!applicable) {
      rows.push({ rule, status: "na", score: null, reason: `不适用于项目类型 ${types.join("/")}` });
      continue;
    }
    if (!rule.browserSafe) {
      const reason =
        rule.evaluator === "agent-reviewed"
          ? "agent-reviewed 规则需 Agent/人工评审，Web 端不核验"
          : "该规则依赖文件系统或外部环境，Web 端不核验";
      rows.push({ rule, status: "unverified", score: null, reason });
      continue;
    }
    const checker = CONTENT_CHECKERS[rule.id];
    if (!checker) {
      rows.push({ rule, status: "unverified", score: null, reason: "该规则暂无浏览器检查器" });
      continue;
    }
    const outcome: Outcome = checker({ readme, types });
    if (outcome.kind === "score") {
      rows.push({ rule, status: statusOf(rule.thresholds, outcome.score), score: outcome.score, reason: outcome.reason });
    } else {
      rows.push({ rule, status: outcome.kind, score: null, reason: outcome.reason });
    }
  }
  return rows;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderResults(rows: Row[]): string {
  const scored = rows.filter((r) => r.score !== null);
  const verifiedScore = scored.reduce((sum, r) => sum + (r.score ?? 0), 0);
  const verifiedMaximum = scored.length * 5;
  const unverifiedCount = rows.filter((r) => r.status === "unverified").length;

  const lines = rows
    .map((r) => {
      const scorePart = r.score === null ? "—" : `${r.score}/5`;
      return (
        `<tr class="status-${r.status}">` +
        `<td>${escapeHtml(r.rule.id)}</td>` +
        `<td>${escapeHtml(r.rule.title)}</td>` +
        `<td>${escapeHtml(AXIS_LABELS[r.rule.axis] ?? r.rule.axis)}</td>` +
        `<td>${STATUS_LABELS[r.status]}</td>` +
        `<td>${scorePart}</td>` +
        `<td>${escapeHtml(r.reason)}</td>` +
        `</tr>`
      );
    })
    .join("\n");

  const summary =
    unverifiedCount > 0
      ? `已核验得分：${verifiedScore}/${verifiedMaximum} 适用分；未核验 ${unverifiedCount} 项（不输出总分）`
      : `总分：归一化 ${verifiedMaximum === 0 ? "0.0" : ((verifiedScore / verifiedMaximum) * 100).toFixed(1)}/100` +
        `（原始得分 ${verifiedScore}/${verifiedMaximum} 适用满分）`;

  return (
    `<table><thead><tr>` +
    `<th>#</th><th>铁律</th><th>轴</th><th>状态</th><th>得分</th><th>说明</th>` +
    `</tr></thead><tbody>${lines}</tbody></table>` +
    `<p class="summary">${escapeHtml(summary)}</p>`
  );
}

function main(): void {
  const style = document.createElement("style");
  style.textContent = STYLE;
  document.head.appendChild(style);

  const picker = document.getElementById("type-picker");
  const input = document.getElementById("readme-input") as HTMLTextAreaElement | null;
  const run = document.getElementById("run");
  const results = document.getElementById("results");
  const version = document.getElementById("spec-version");
  if (!picker || !input || !run || !results || !version) return;

  version.textContent = `规范版本 ${RULES_VERSION} · ${RULES.length} 条铁律`;

  picker.append(
    ...ALL_TYPES.map((t) => {
      const label = document.createElement("label");
      const box = document.createElement("input");
      box.type = "checkbox";
      box.value = t.value;
      label.append(box, document.createTextNode(` ${t.label}`));
      return label;
    }),
  );

  run.addEventListener("click", () => {
    const readme = input.value;
    const types = Array.from(picker.querySelectorAll<HTMLInputElement>("input:checked")).map(
      (b) => b.value as ProjectedProjectType,
    );
    if (types.length === 0) {
      results.innerHTML = `<p class="error">请先显式选择至少一个项目类型。</p>`;
      return;
    }
    if (readme.trim() === "") {
      results.innerHTML = `<p class="error">请粘贴 README 内容。</p>`;
      return;
    }
    results.innerHTML = renderResults(evaluate(readme, types));
  });
}

main();
