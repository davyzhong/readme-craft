import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CONTENT_CHECKERS, statusOf } from "../../scripts/lib/content-checks.ts";
import { checkProject } from "../../scripts/lib/check.ts";
import { RULES } from "../src/generated/rules.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIXTURES = ["tests/fixtures/cli-golden", "tests/fixtures/cli"];

test("content checker 集合恰好等于 browserSafe 规则集合", () => {
  const browserSafe = RULES.filter((r) => r.browserSafe).map((r) => r.id).sort();
  assert.deepEqual(Object.keys(CONTENT_CHECKERS).sort(), browserSafe);
  for (const rule of RULES) {
    if (!rule.browserSafe) {
      assert.ok(!(rule.id in CONTENT_CHECKERS), `${rule.id} 依赖文件系统/评审，不得出现在 content-checks`);
    }
  }
});

test("statusOf 按阈值映射 pass/partial/fail", () => {
  const thresholds = { partial: 2, pass: 4 };
  assert.equal(statusOf(thresholds, 5), "pass");
  assert.equal(statusOf(thresholds, 4), "pass");
  assert.equal(statusOf(thresholds, 3), "partial");
  assert.equal(statusOf(thresholds, 2), "partial");
  assert.equal(statusOf(thresholds, 1), "fail");
  assert.equal(statusOf(thresholds, 0), "fail");
});

test("Web 与 CLI 对同一 fixture 的 browser-safe 规则结果逐项一致", () => {
  for (const fixture of FIXTURES) {
    const root = path.join(repoRoot, fixture);
    const report = checkProject(root, {});
    const readme = readFileSync(path.join(root, "README.md"), "utf8");
    for (const rule of RULES.filter((r) => r.browserSafe)) {
      const cli = report.rules.find((r) => r.id === rule.id);
      assert.ok(cli, `${fixture} 缺少 ${rule.id} 的 CLI 结果`);
      const applicable = rule.appliesTo.some((t) =>
        (report.projectTypes as string[]).includes(t),
      );
      if (!applicable) {
        assert.equal(cli.status, "na", `${fixture} ${rule.id} 不适用时应为 na`);
        continue;
      }
      const outcome = CONTENT_CHECKERS[rule.id]!({
        readme,
        types: report.projectTypes as never,
      });
      if (outcome.kind === "score") {
        assert.equal(cli.score, outcome.score, `${fixture} ${rule.id} 得分不一致`);
        assert.equal(cli.status, statusOf(rule.thresholds, outcome.score), `${fixture} ${rule.id} 状态不一致`);
      } else {
        assert.equal(cli.status, outcome.kind, `${fixture} ${rule.id} 状态不一致`);
      }
    }
  }
});
