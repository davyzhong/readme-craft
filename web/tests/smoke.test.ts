// Web 浏览器冒烟测试（审批门 2-3）：真实 Chromium 打开本地评分页，验证端到端评分链路。
// 未安装浏览器时 skip（CI 不装浏览器；安装步骤进入 CI 需另行批准）。
// 运行：pnpm web:smoke（也被 pnpm web:test 的 glob 覆盖）。

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import type { Browser } from "playwright";
import { createWebServer } from "../../scripts/web-preview.ts";
import { RULES } from "../src/generated/rules.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

async function launchBrowser(t: { skip: (msg?: string) => void }): Promise<Browser | null> {
  try {
    return await chromium.launch();
  } catch {
    t.skip("Chromium 未安装：pnpm exec playwright install chromium");
    return null;
  }
}

test("smoke: 浏览器端到端评分 golden fixture", async (t) => {
  const browser = await launchBrowser(t);
  if (!browser) return;

  const server = createWebServer(repoRoot);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;

  try {
    const page = await browser.newPage();
    const externalRequests: string[] = [];
    page.on("request", (req) => {
      if (!req.url().startsWith(`http://127.0.0.1:${port}/`)) externalRequests.push(req.url());
    });

    await page.goto(`http://127.0.0.1:${port}/`);
    await page.waitForSelector("#readme-input");

    // 隐私声明与规范版本展示
    const bodyText = await page.textContent("body");
    assert.ok(bodyText?.includes("不会被上传"), "缺少隐私声明");
    assert.ok(bodyText?.includes("规范版本"), "缺少规范版本");

    // 粘贴 golden fixture README，显式选择 cli 类型，运行检查
    const readme = readFileSync(path.join(repoRoot, "tests", "fixtures", "cli-golden", "README.md"), "utf8");
    await page.fill("#readme-input", readme);
    await page.check('#type-picker input[value="cli"]');
    await page.click("#run");
    await page.waitForSelector("#results table tbody tr");

    const rows = await page.$$("#results table tbody tr");
    assert.equal(rows.length, RULES.length, "每条规则一行");

    // browser-safe 规则在浏览器中真实出分（T03 golden fixture 应通过）
    const t03 = await page.textContent("#results tr:nth-child(3)");
    assert.ok(t03?.includes("T03"), "第三行应为 T03");
    assert.ok(t03?.includes("✅"), `T03 应通过：${t03}`);

    // 依赖文件系统的规则在 Web 端必须 unverified（T12 收尾五件套）
    const t12row = await page.textContent("#results tr:nth-child(12)");
    assert.ok(t12row?.includes("❔"), `T12 在 Web 端应未核验：${t12row}`);

    // 存在未核验项时不输出总分
    const summary = await page.textContent("#results .summary");
    assert.ok(summary?.includes("未核验"), "应报告未核验项数");
    assert.ok(!/总分：/.test(summary ?? ""), "有未核验项不得输出总分");

    // CSP 禁外联：除本预览服务器外不应有任何请求
    assert.deepEqual(externalRequests, [], `存在外部请求：${externalRequests.join(", ")}`);

    await page.close();
  } finally {
    await browser.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("smoke: 空输入与未选类型给出错误提示", async (t) => {
  const browser = await launchBrowser(t);
  if (!browser) return;

  const server = createWebServer(repoRoot);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;

  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.click("#run");
    await page.waitForSelector("#results .error");
    assert.ok((await page.textContent("#results .error"))?.includes("项目类型"));

    await page.check('#type-picker input[value="library"]');
    await page.click("#run");
    await page.waitForSelector("#results .error");
    assert.ok((await page.textContent("#results .error"))?.includes("README"));
    await page.close();
  } finally {
    await browser.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
