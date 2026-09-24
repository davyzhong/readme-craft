"use strict";
(() => {
  // web/src/generated/rules.ts
  var RULES_VERSION = "3.0.0-alpha.0";
  var RULES = [
    {
      id: "T01",
      title: "\u89C6\u89C9\u9524",
      axis: "visual",
      evaluator: "agent-reviewed",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 2, pass: 4 },
      browserSafe: false
    },
    {
      id: "T02",
      title: "\u4E09\u79D2\u4EF7\u503C\u4E3B\u5F20",
      axis: "content",
      evaluator: "agent-reviewed",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 2, pass: 4 },
      browserSafe: false
    },
    {
      id: "T03",
      title: "Badge \u77E9\u9635",
      axis: "content",
      evaluator: "deterministic",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 2, pass: 3 },
      browserSafe: true
    },
    {
      id: "T04",
      title: "\u5B89\u88C5\u591A\u8DEF\u9F50\u53D1",
      axis: "structure",
      evaluator: "agent-reviewed",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 2, pass: 3 },
      browserSafe: false
    },
    {
      id: "T05",
      title: "30 \u79D2\u8BD5\u7528 + 60 \u79D2 Quickstart",
      axis: "structure",
      evaluator: "agent-reviewed",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 2, pass: 4 },
      browserSafe: false
    },
    {
      id: "T06",
      title: "\u89C6\u89C9\u77E9\u9635",
      axis: "visual",
      evaluator: "deterministic",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 2, pass: 4 },
      browserSafe: false
    },
    {
      id: "T07",
      title: "\u5356\u70B9\u7F16\u53F7\u6E05\u5355",
      axis: "content",
      evaluator: "agent-reviewed",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 2, pass: 4 },
      browserSafe: false
    },
    {
      id: "T08",
      title: "Feature \u5206\u7EC4 + Ecosystem",
      axis: "visual",
      evaluator: "agent-reviewed",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 2, pass: 4 },
      browserSafe: false
    },
    {
      id: "T09",
      title: "\u67B6\u6784\u56FE",
      axis: "content",
      evaluator: "deterministic",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 2, pass: 3 },
      browserSafe: true
    },
    {
      id: "T10",
      title: "\u5BF9\u7167\u8868",
      axis: "content",
      evaluator: "deterministic",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 1, pass: 3 },
      browserSafe: true
    },
    {
      id: "T11",
      title: "\u5F15\u7528 / \u80CC\u4E66",
      axis: "content",
      evaluator: "agent-reviewed",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 1, pass: 3 },
      browserSafe: false
    },
    {
      id: "T12",
      title: "\u6536\u5C3E\u4E94\u4EF6\u5957",
      axis: "structure",
      evaluator: "deterministic",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 2, pass: 4 },
      browserSafe: false
    },
    {
      id: "T13",
      title: "i18n \u89C4\u8303",
      axis: "inclusive",
      evaluator: "deterministic",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 1, pass: 3 },
      browserSafe: false
    },
    {
      id: "T14",
      title: "\u5305\u5BB9\u6027\u8BED\u8A00",
      axis: "inclusive",
      evaluator: "agent-reviewed",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 2, pass: 4 },
      browserSafe: false
    },
    {
      id: "T15",
      title: "LLM \u53CB\u597D\u5143\u6570\u636E",
      axis: "ai",
      evaluator: "deterministic",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 2, pass: 3 },
      browserSafe: false
    },
    {
      id: "T16",
      title: "\u65E0\u969C\u788D a11y",
      axis: "inclusive",
      evaluator: "deterministic",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 2, pass: 4 },
      browserSafe: true
    },
    {
      id: "T17",
      title: "\u9ED8\u8BA4\u8BED\u8A00\u7B56\u7565",
      axis: "content",
      evaluator: "agent-reviewed",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 1, pass: 3 },
      browserSafe: false
    },
    {
      id: "T18",
      title: "\u622A\u56FE\u81EA\u52A8\u5316",
      axis: "visual",
      evaluator: "deterministic",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 2, pass: 4 },
      browserSafe: false
    },
    {
      id: "T19",
      title: "CI \u53EF\u590D\u73B0\u4E0E\u53EF\u8BCA\u65AD",
      axis: "structure",
      evaluator: "deterministic",
      appliesTo: ["cli", "library", "desktop", "web-app", "service", "knowledge-base"],
      thresholds: { partial: 2, pass: 4 },
      browserSafe: false
    }
  ];

  // scripts/lib/content-checks.ts
  var na = (reason) => ({ kind: "na", reason });
  var score = (s, evidence, reason) => ({
    kind: "score",
    score: s,
    evidence,
    reason
  });
  function statusOf(thresholds, s) {
    if (s >= thresholds.pass) return "pass";
    if (s >= thresholds.partial) return "partial";
    return "fail";
  }
  var GENERIC_ALTS = /* @__PURE__ */ new Set(["image", "img", "screenshot", "picture", "photo", "icon", "\u56FE", "\u622A\u56FE"]);
  function extractImages(readme) {
    const imgs = [];
    for (const m of readme.matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)/g)) {
      imgs.push({ alt: m[1] ?? "", src: m[2] ?? "" });
    }
    for (const m of readme.matchAll(/<img\b[^>]*>/gi)) {
      const tag = m[0];
      const alt = tag.match(/alt="([^"]*)"/)?.[1] ?? "";
      const src = tag.match(/src="([^"]*)"/)?.[1] ?? "";
      const width = tag.match(/width="?(\d+)/)?.[1];
      imgs.push({ alt, src, ...width ? { width } : {} });
    }
    return imgs;
  }
  function countTables(readme) {
    return (readme.match(/^\|[\s:|-]+\|$/gm) ?? []).length;
  }
  function hasMermaid(readme) {
    return /```mermaid/.test(readme);
  }
  var CONTENT_CHECKERS = {
    T03(ctx) {
      const n = (ctx.readme.match(/shields\.io/g) ?? []).length;
      if (n === 0) return score(0, ["badge-count=0"], "\u6CA1\u6709\u4EFB\u4F55 shields.io badge");
      const text = ctx.readme.toLowerCase();
      const has = (...keys) => keys.some((k) => text.includes(k));
      if (n < 4 || n > 10) return score(1, [`badge-count=${n}`], `badge \u6570\u91CF ${n}\uFF0C\u4E0D\u5728 4-7 \u533A\u95F4`);
      let s = 2;
      const evidence = [`badge-count=${n}`];
      if (has("license") && has("version", "/v/", "release")) s = 3;
      if (s >= 3 && has("workflow", "actions", "build") && has("dt", "downloads", "stars")) s = 4;
      if (s >= 4 && has("security", "dependabot") && has("docs", "documentation")) s = 5;
      evidence.push("shields-io-format");
      return score(s, evidence, `shields.io badge ${n} \u4E2A\uFF0C\u4FE1\u53F7\u8986\u76D6\u5230 ${s} \u5206\u6863`);
    },
    T09(ctx) {
      if (ctx.types.length > 0 && ctx.types.every((t) => t === "cli")) {
        return na("\u7B80\u5355 CLI \u9879\u76EE\u53EF\u8C41\u514D\u67B6\u6784\u56FE");
      }
      if (hasMermaid(ctx.readme)) {
        return score(3, ["mermaid-diagram"], "\u5B58\u5728 mermaid \u67B6\u6784\u56FE\uFF08\u5185\u5BB9\u8986\u76D6\u5EA6\u9700 Agent \u590D\u6838\uFF09");
      }
      const archImg = extractImages(ctx.readme).some((i) => /arch|架构|diagram/i.test(i.src + i.alt));
      if (archImg) return score(3, ["architecture-image"], "\u5B58\u5728\u67B6\u6784\u56FE\u56FE\u7247");
      return score(0, [], "\u590D\u6742\u9879\u76EE\u7F3A\u5C11\u67B6\u6784\u56FE");
    },
    T10(ctx) {
      const n = countTables(ctx.readme);
      if (n === 0) return score(0, ["table-count=0"], "\u6CA1\u6709\u4EFB\u4F55\u8868\u683C");
      return score(3, [`table-count=${n}`], `\u542B ${n} \u4E2A\u8868\u683C\uFF08\u5185\u5BB9\u8D28\u91CF\u9700 Agent \u590D\u6838\uFF09`);
    },
    T16(ctx) {
      const imgs = extractImages(ctx.readme);
      const badAlt = imgs.filter((i) => !i.alt || GENERIC_ALTS.has(i.alt.toLowerCase()));
      const vagueAlt = imgs.filter((i) => i.alt && i.alt.trim().length < 8);
      if (imgs.length > 0 && badAlt.length > 0) {
        return score(1, [`bad-alt=${badAlt.length}`], `${badAlt.length} \u5F20\u56FE\u50CF\u7F3A alt \u6216 alt \u4E3A\u5360\u4F4D\u8BCD`);
      }
      const tables = countTables(ctx.readme);
      if (tables === 0 && imgs.length === 0) return score(3, [], "\u65E0\u56FE\u50CF\u65E0\u8868\u683C\uFF0C\u65E0 a11y \u8FDD\u89C4\u9762\uFF08\u5EFA\u8BAE Agent \u590D\u6838\uFF09");
      if (vagueAlt.length > 0) return score(3, [`vague-alt=${vagueAlt.length}`], "alt \u5B58\u5728\u4F46\u4E0D\u591F\u5177\u4F53");
      return score(4, [], "\u56FE\u50CF alt \u5177\u4F53\u3001\u8868\u683C\u5747\u6709 header \u884C");
    }
  };

  // web/src/style.ts
  var STYLE = `
:root {
  color-scheme: light dark;
  --fg: #1f2430;
  --bg: #f7f7fb;
  --card: #ffffff;
  --border: #d8dbe6;
  --accent: #4f46e5;
}
@media (prefers-color-scheme: dark) {
  :root {
    --fg: #e6e8f0;
    --bg: #14161f;
    --card: #1d2030;
    --border: #343950;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
  background: var(--bg);
  color: var(--fg);
  line-height: 1.6;
}
main { max-width: 960px; margin: 0 auto; padding: 24px 16px 48px; }
h1 { font-size: 1.5rem; margin-bottom: 4px; }
.privacy {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.92rem;
}
.input-panel { display: grid; gap: 10px; margin: 18px 0; }
fieldset {
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  background: var(--card);
}
fieldset label { white-space: nowrap; }
textarea {
  width: 100%;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85rem;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  color: var(--fg);
  resize: vertical;
}
button {
  justify-self: start;
  padding: 8px 22px;
  font-size: 0.95rem;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
}
button:hover { opacity: 0.9; }
table {
  width: 100%;
  border-collapse: collapse;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  font-size: 0.88rem;
}
th, td { padding: 8px 10px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; }
th { background: rgba(127, 127, 160, 0.12); }
tr.status-fail td:first-child { border-left: 3px solid #dc2626; }
tr.status-partial td:first-child { border-left: 3px solid #d97706; }
tr.status-pass td:first-child { border-left: 3px solid #16a34a; }
tr.status-unverified td:first-child { border-left: 3px solid #64748b; }
tr.status-na td:first-child { border-left: 3px solid var(--border); }
.summary { font-weight: 600; margin-top: 12px; }
.error { color: #dc2626; font-weight: 600; }
footer { margin-top: 28px; font-size: 0.85rem; opacity: 0.85; }
code { background: rgba(127, 127, 160, 0.18); padding: 1px 5px; border-radius: 4px; }
`;

  // web/src/main.ts
  var ALL_TYPES = [
    { value: "cli", label: "CLI" },
    { value: "library", label: "\u5E93" },
    { value: "desktop", label: "\u684C\u9762\u5E94\u7528" },
    { value: "web-app", label: "Web \u5E94\u7528" },
    { value: "service", label: "\u670D\u52A1" },
    { value: "knowledge-base", label: "\u77E5\u8BC6\u5E93" }
  ];
  var AXIS_LABELS = {
    structure: "\u7ED3\u6784",
    content: "\u5185\u5BB9",
    visual: "\u89C6\u89C9",
    ai: "AI",
    inclusive: "\u5305\u5BB9"
  };
  var STATUS_LABELS = {
    pass: "\u2705 \u901A\u8FC7",
    partial: "\u26A0\uFE0F \u90E8\u5206",
    fail: "\u274C \u672A\u8FBE",
    na: "N/A",
    unverified: "\u2754 \u672A\u6838\u9A8C"
  };
  function evaluate(readme, types) {
    const rows = [];
    for (const rule of RULES) {
      const applicable = rule.appliesTo.some((t) => types.includes(t));
      if (!applicable) {
        rows.push({ rule, status: "na", score: null, reason: `\u4E0D\u9002\u7528\u4E8E\u9879\u76EE\u7C7B\u578B ${types.join("/")}` });
        continue;
      }
      if (!rule.browserSafe) {
        const reason = rule.evaluator === "agent-reviewed" ? "agent-reviewed \u89C4\u5219\u9700 Agent/\u4EBA\u5DE5\u8BC4\u5BA1\uFF0CWeb \u7AEF\u4E0D\u6838\u9A8C" : "\u8BE5\u89C4\u5219\u4F9D\u8D56\u6587\u4EF6\u7CFB\u7EDF\u6216\u5916\u90E8\u73AF\u5883\uFF0CWeb \u7AEF\u4E0D\u6838\u9A8C";
        rows.push({ rule, status: "unverified", score: null, reason });
        continue;
      }
      const checker = CONTENT_CHECKERS[rule.id];
      if (!checker) {
        rows.push({ rule, status: "unverified", score: null, reason: "\u8BE5\u89C4\u5219\u6682\u65E0\u6D4F\u89C8\u5668\u68C0\u67E5\u5668" });
        continue;
      }
      const outcome = checker({ readme, types });
      if (outcome.kind === "score") {
        rows.push({ rule, status: statusOf(rule.thresholds, outcome.score), score: outcome.score, reason: outcome.reason });
      } else {
        rows.push({ rule, status: outcome.kind, score: null, reason: outcome.reason });
      }
    }
    return rows;
  }
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function renderResults(rows) {
    const scored = rows.filter((r) => r.score !== null);
    const verifiedScore = scored.reduce((sum, r) => sum + (r.score ?? 0), 0);
    const verifiedMaximum = scored.length * 5;
    const unverifiedCount = rows.filter((r) => r.status === "unverified").length;
    const lines = rows.map((r) => {
      const scorePart = r.score === null ? "\u2014" : `${r.score}/5`;
      return `<tr class="status-${r.status}"><td>${escapeHtml(r.rule.id)}</td><td>${escapeHtml(r.rule.title)}</td><td>${escapeHtml(AXIS_LABELS[r.rule.axis] ?? r.rule.axis)}</td><td>${STATUS_LABELS[r.status]}</td><td>${scorePart}</td><td>${escapeHtml(r.reason)}</td></tr>`;
    }).join("\n");
    const summary = unverifiedCount > 0 ? `\u5DF2\u6838\u9A8C\u5F97\u5206\uFF1A${verifiedScore}/${verifiedMaximum} \u9002\u7528\u5206\uFF1B\u672A\u6838\u9A8C ${unverifiedCount} \u9879\uFF08\u4E0D\u8F93\u51FA\u603B\u5206\uFF09` : `\u603B\u5206\uFF1A\u5F52\u4E00\u5316 ${verifiedMaximum === 0 ? "0.0" : (verifiedScore / verifiedMaximum * 100).toFixed(1)}/100\uFF08\u539F\u59CB\u5F97\u5206 ${verifiedScore}/${verifiedMaximum} \u9002\u7528\u6EE1\u5206\uFF09`;
    return `<table><thead><tr><th>#</th><th>\u94C1\u5F8B</th><th>\u8F74</th><th>\u72B6\u6001</th><th>\u5F97\u5206</th><th>\u8BF4\u660E</th></tr></thead><tbody>${lines}</tbody></table><p class="summary">${escapeHtml(summary)}</p>`;
  }
  function main() {
    const style = document.createElement("style");
    style.textContent = STYLE;
    document.head.appendChild(style);
    const picker = document.getElementById("type-picker");
    const input = document.getElementById("readme-input");
    const run = document.getElementById("run");
    const results = document.getElementById("results");
    const version = document.getElementById("spec-version");
    if (!picker || !input || !run || !results || !version) return;
    version.textContent = `\u89C4\u8303\u7248\u672C ${RULES_VERSION} \xB7 ${RULES.length} \u6761\u94C1\u5F8B`;
    picker.append(
      ...ALL_TYPES.map((t) => {
        const label = document.createElement("label");
        const box = document.createElement("input");
        box.type = "checkbox";
        box.value = t.value;
        label.append(box, document.createTextNode(` ${t.label}`));
        return label;
      })
    );
    run.addEventListener("click", () => {
      const readme = input.value;
      const types = Array.from(picker.querySelectorAll("input:checked")).map(
        (b) => b.value
      );
      if (types.length === 0) {
        results.innerHTML = `<p class="error">\u8BF7\u5148\u663E\u5F0F\u9009\u62E9\u81F3\u5C11\u4E00\u4E2A\u9879\u76EE\u7C7B\u578B\u3002</p>`;
        return;
      }
      if (readme.trim() === "") {
        results.innerHTML = `<p class="error">\u8BF7\u7C98\u8D34 README \u5185\u5BB9\u3002</p>`;
        return;
      }
      results.innerHTML = renderResults(evaluate(readme, types));
    });
  }
  main();
})();
