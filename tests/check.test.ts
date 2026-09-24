import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkProject, emitReport } from "../scripts/lib/check.ts";
import { internalId } from "../scripts/lib/types.ts";

function tmpProject(readme: string, extra?: (dir: string) => void): string {
  const dir = mkdtempSync(path.join(tmpdir(), "readme-craft-check-"));
  writeFileSync(path.join(dir, "README.md"), readme);
  extra?.(dir);
  return dir;
}

const JSON_TOP_FIELDS = [
  "specVersion",
  "toolVersion",
  "projectTypes",
  "rules",
  "verifiedScore",
  "verifiedMaximum",
  "unverifiedCount",
  "errors",
];

const RULE_FIELDS = ["id", "evaluator", "status", "score", "maximum", "evidence", "reason", "source"];

test("report has the fixed JSON contract fields", () => {
  const dir = tmpProject("# 极简\n");
  const report = checkProject(dir, { types: ["cli"] });
  for (const f of JSON_TOP_FIELDS) assert.ok(f in report, `缺顶层字段 ${f}`);
  assert.ok(Array.isArray(report.rules));
  for (const r of report.rules) {
    for (const f of RULE_FIELDS) assert.ok(f in r, `规则 ${r.id} 缺字段 ${f}`);
    if (r.status === "na" || r.status === "unverified") {
      assert.equal(r.score, null, `${r.id} 的 ${r.status} 状态 score 必须为 null`);
    }
  }
});

test("README without badges scores T03 as fail with evidence", () => {
  const dir = tmpProject("# 极简\n\n没有 badge。\n");
  const report = checkProject(dir, { types: ["cli"] });
  const t03 = report.rules.find((r) => r.id === "T03");
  assert.ok(t03);
  assert.equal(t03.source, "deterministic");
  assert.equal(t03.status, "fail");
  assert.equal(t03.score, 0);
});

test("4-7 shields badges including license score T03 pass", () => {
  const readme = [
    "# 项目",
    "",
    "[![ci](https://img.shields.io/github/actions/workflow/status/a/b/ci.yml)](x)",
    "[![version](https://img.shields.io/npm/v/x)](x)",
    "[![license](https://img.shields.io/badge/license-MIT-lightgrey)](x)",
    "[![downloads](https://img.shields.io/npm/dt/x)](x)",
    "[![security](https://img.shields.io/badge/security-policy-green)](x)",
  ].join("\n");
  const dir = tmpProject(readme);
  const report = checkProject(dir, { types: ["cli"] });
  const t03 = report.rules.find((r) => r.id === "T03");
  assert.ok(t03);
  assert.equal(t03.status, "pass");
  assert.ok((t03.score ?? 0) >= 3);
});

test("T09 is N/A for a simple cli project without architecture needs", () => {
  const dir = tmpProject("# 小工具\n\n单文件 CLI。\n");
  const report = checkProject(dir, { types: ["cli"] });
  const t09 = report.rules.find((r) => r.id === "T09");
  assert.ok(t09);
  assert.equal(t09.status, "na");
  assert.ok(t09.reason.length > 0);
});

test("agent-reviewed rules default to unverified and suppress the total score", () => {
  const dir = tmpProject("# 极简\n");
  const report = checkProject(dir, { types: ["cli"] });
  const t02 = report.rules.find((r) => r.id === "T02");
  assert.ok(t02);
  assert.equal(t02.status, "unverified");
  assert.ok(report.unverifiedCount > 0);
});

test("ambiguous project type marks everything unverified instead of guessing", () => {
  const dir = tmpProject("# 只有一个 README\n");
  const report = checkProject(dir, {});
  assert.equal(report.projectTypes.length, 0);
  assert.ok(report.rules.every((r) => r.status === "unverified"));
  assert.ok(report.verifiedScore === 0 && report.verifiedMaximum === 0);
});

test("checker-level N/A always carries a reason", () => {
  const dir = tmpProject("# 极简\n");
  const report = checkProject(dir, { types: ["knowledge-base"] });
  for (const r of report.rules) {
    if (r.status === "na") {
      assert.ok(r.reason.length > 0, `${r.id} 的 N/A 必须附理由`);
      assert.equal(r.score, null);
    }
  }
  // 无截图/无 CI 的极简项目：T18、T19 应为 N/A
  const naIds = report.rules.filter((r) => r.status === "na").map((r) => r.id);
  assert.ok(naIds.includes("T18") && naIds.includes("T19"), JSON.stringify(naIds));
  void internalId; // 映射工具占位使用
});

test("text report hides total score when unverified items remain", () => {
  const dir = tmpProject("# 极简\n");
  const report = checkProject(dir, { types: ["cli"] });
  const text = report.text;
  assert.ok(text.includes("未核验"));
  assert.ok(!/总分：/.test(text), JSON.stringify(text));
});

test("--output writes the JSON report atomically", () => {
  const dir = tmpProject("# 极简\n");
  const out = path.join(dir, "report.json");
  const report = checkProject(dir, { types: ["cli"] });
  emitReport(report, "json", out);
  assert.ok(existsSync(out));
  const written = JSON.parse(readFileSync(out, "utf8")) as { specVersion: string };
  assert.equal(written.specVersion, report.specVersion);
  assert.ok(!("text" in written), "JSON 输出不应包含 text 字段");
});

test("governance files drive T12 score", () => {
  const dir = tmpProject("# 项目\n\n## License\n\nMIT\n", (d) => {
    writeFileSync(path.join(d, "LICENSE"), "MIT\n");
    writeFileSync(path.join(d, "CONTRIBUTING.md"), "# c\n");
    writeFileSync(path.join(d, "CODE_OF_CONDUCT.md"), "# coc\n");
    writeFileSync(path.join(d, "SECURITY.md"), "# s\n");
    mkdirSync(path.join(d, ".github", "workflows"), { recursive: true });
    writeFileSync(
      path.join(d, ".github", "workflows", "ci.yml"),
      "jobs:\n  t:\n    steps:\n      - run: npm ci\n",
    );
    writeFileSync(path.join(d, "package-lock.json"), "{}\n");
    writeFileSync(
      path.join(d, "package.json"),
      JSON.stringify({ name: "x", packageManager: "npm@11.0.0" }),
    );
  });
  const report = checkProject(dir, { types: ["library"] });
  const t12 = report.rules.find((r) => r.id === "T12");
  assert.ok(t12);
  assert.ok((t12.score ?? 0) >= 3, `T12 得分 ${t12.score}`);
  const t19 = report.rules.find((r) => r.id === "T19");
  assert.ok(t19);
  assert.ok((t19.score ?? 0) >= 3, `T19 得分 ${t19.score}`);
});

test("errors array collects review-file problems without crashing", () => {
  const dir = tmpProject("# 极简\n");
  const review = path.join(dir, "review.yaml");
  writeFileSync(review, "reviews:\n  - id: T03\n    score: 5\n    evidence: [x]\n    reason: y\n");
  const report = checkProject(dir, { types: ["cli"], reviewPath: review });
  assert.ok(report.errors.length > 0, "review 覆盖 deterministic 规则必须报错");
});

// ---------- CLI 退出码 ----------

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(repoRoot, "scripts", "readme-craft.ts");

function runCli(args: string[]) {
  return spawnSync(process.execPath, [cliPath, ...args], { encoding: "utf8" });
}

function passingProject(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "readme-craft-pass-"));
  writeFileSync(
    path.join(dir, "README.md"),
    [
      "# 完备项目",
      "",
      "[![ci](https://img.shields.io/github/actions/workflow/status/a/b/ci.yml)](x)",
      "[![version](https://img.shields.io/npm/v/x)](x)",
      "[![license](https://img.shields.io/badge/license-MIT-lightgrey)](x)",
      "[![downloads](https://img.shields.io/npm/dt/x)](x)",
      "[![security](https://img.shields.io/badge/security-policy-green)](x)",
      "[![docs](https://img.shields.io/badge/docs-latest-blue)](x)",
      "",
      "## 安装",
      "```bash",
      "npm install x",
      "```",
      "## Quickstart",
      "三步跑起来。",
      "## 使用",
      "## 架构",
      '<a href="a.png"><img src="a.png" width="270" alt="主界面三栏仪表盘截图"></a>',
      '<a href="b.png"><img src="b.png" width="270" alt="设置页面与快捷键截图"></a>',
      '<a href="c.png"><img src="c.png" width="270" alt="导出结果预览截图"></a>',
      "[演示视频](https://youtube.com/watch?v=demo)",
      "",
      "| 维度 | 本项目 | 竞品 |",
      "|---|---|---|",
      "| 本地优先 | ✓ | ✗ |",
      "",
      "目前仅中文，欢迎 PR 补充其他语言。",
      "",
      "## Sponsors",
      "感谢支持者。",
      "## Roadmap",
      "- [ ] 更多",
      "## License",
      "MIT",
    ].join("\n"),
  );
  writeFileSync(path.join(dir, "LICENSE"), "MIT\n");
  writeFileSync(path.join(dir, "CONTRIBUTING.md"), "# c\n");
  writeFileSync(path.join(dir, "CODE_OF_CONDUCT.md"), "# coc\n");
  writeFileSync(path.join(dir, "SECURITY.md"), "# s\n");
  writeFileSync(path.join(dir, "llms.txt"), "summary\n");
  writeFileSync(path.join(dir, "package-lock.json"), "{}\n");
  writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "x", packageManager: "npm@11.0.0", bin: { x: "x.js" } }));
  writeFileSync(path.join(dir, ".node-version"), "24.15.0\n");
  mkdirSync(path.join(dir, ".github", "workflows"), { recursive: true });
  writeFileSync(
    path.join(dir, ".github", "workflows", "ci.yml"),
    "jobs:\n  t:\n    steps:\n      - run: npm ci\n      - run: npx markdown-link-check README.md\n",
  );
  writeFileSync(
    path.join(dir, ".github", "workflows", "screenshot.yml"),
    "on:\n  schedule:\n    - cron: '0 0 * * *'\njobs:\n  s:\n    steps:\n      - run: node scripts/screenshot.js\n",
  );
  return dir;
}

test("CLI check exits 1 when a verified rule fails", () => {
  const dir = tmpProject("# 极简\n");
  const res = runCli(["check", dir, "--type", "cli"]);
  assert.equal(res.status, 1, res.stderr);
});

test("CLI check exits 0 when deterministic rules pass and agent rules are unverified", () => {
  const dir = passingProject();
  const res = runCli(["check", dir, "--type", "cli"]);
  assert.equal(res.status, 0, `${res.stdout}\n${res.stderr}`);
  assert.ok(res.stdout.includes("未核验"), res.stdout);
});

test("CLI check --strict exits 1 on partial", () => {
  const dir = tmpProject("# 极简\n");
  const res = runCli(["check", dir, "--type", "cli", "--strict"]);
  assert.equal(res.status, 1, res.stderr);
});

test("CLI check with unknown flag exits 2", () => {
  const res = runCli(["check", ".", "--nope"]);
  assert.equal(res.status, 2);
});

test("CLI check with missing path exits 2", () => {
  const res = runCli(["check"]);
  assert.equal(res.status, 2);
});

test("CLI check --format json outputs the fixed contract", () => {
  const dir = tmpProject("# 极简\n");
  const res = runCli(["check", dir, "--type", "cli", "--format", "json"]);
  const parsed = JSON.parse(res.stdout) as Record<string, unknown>;
  assert.ok("specVersion" in parsed && "verifiedScore" in parsed && "unverifiedCount" in parsed);
  assert.ok(!("text" in parsed));
});

// ---------- M2-R1 条件化适用性 ----------

test("T06: 非 GUI 类型无图像证据时计 na 而非 fail", () => {
  const dir = tmpProject("# 纯文本 CLI\n\n```bash\nx run\n```\n");
  const report = checkProject(dir, { types: ["cli"] });
  const t06 = report.rules.find((r) => r.id === "T06");
  assert.equal(t06?.status, "na", `T06 应 na，实际 ${t06?.status}（${t06?.reason}）`);
});

test("T06: desktop/web-app 项目无图像仍 fail", () => {
  const dir = tmpProject("# 桌面应用\n");
  const report = checkProject(dir, { types: ["desktop"] });
  const t06 = report.rules.find((r) => r.id === "T06");
  assert.equal(t06?.status, "fail");
  assert.equal(t06?.score, 0);
});

test("T06: cli 项目自带截图组时仍正常评分", () => {
  const dir = tmpProject(
    [
      "# 带截图的 CLI",
      '![安装成功的终端输出截图](a.png)',
      '![统计面板输出截图](b.png)',
      '![导出结果预览截图](c.png)',
    ].join("\n"),
  );
  const report = checkProject(dir, { types: ["cli"] });
  const t06 = report.rules.find((r) => r.id === "T06");
  assert.ok((t06?.score ?? 0) >= 3, `有截图组应正常评分，实际 ${t06?.status} ${t06?.score}`);
});

test("T13: 无多语言信号时计 unverified 而非 fail", () => {
  const dir = tmpProject("# 单语言项目\n\n没有 i18n 任何线索。\n");
  const report = checkProject(dir, { types: ["cli"] });
  const t13 = report.rules.find((r) => r.id === "T13");
  assert.equal(t13?.status, "unverified", `T13 应 unverified，实际 ${t13?.status}（${t13?.reason}）`);
});

test("T13: 显式单语言策略仍 pass", () => {
  const dir = tmpProject("# 项目\n\n目前仅中文，欢迎 PR 补充其他语言。\n");
  const report = checkProject(dir, { types: ["cli"] });
  const t13 = report.rules.find((r) => r.id === "T13");
  assert.equal(t13?.status, "pass");
});

test("T13: BCP47 误命名可事实判定低分", () => {
  const dir = tmpProject("# 项目\n", (d) => writeFileSync(path.join(d, "README.EN.md"), "# x\n"));
  const report = checkProject(dir, { types: ["cli"] });
  const t13 = report.rules.find((r) => r.id === "T13");
  assert.equal(t13?.status, "partial");
  assert.equal(t13?.score, 1);
});

// ---------- M2-R4 golden / 负向 fixture ----------

test("golden fixture（cli-golden）exit 0：适用确定性规则全 pass，agent 规则 unverified", () => {
  const res = runCli(["check", path.join(repoRoot, "tests/fixtures/cli-golden"), "--type", "cli"]);
  assert.equal(res.status, 0, `${res.stdout}\n${res.stderr}`);
  assert.ok(res.stdout.includes("未核验"), res.stdout);
  assert.ok(!res.stdout.includes("fail"), res.stdout);
});

test("tests/fixtures/cli 是负向 fixture：exit 1 为预期", () => {
  const res = runCli(["check", path.join(repoRoot, "tests/fixtures/cli"), "--type", "cli"]);
  assert.equal(res.status, 1, `${res.stdout}\n${res.stderr}`);
});
