// Playwright 截图自动化示例（T18）：复制到目标项目后按需修改 TARGETS。
// 契约：固定视口、显式 URL、语义文件名（无时间戳/随机数）、任何失败非零退出。
//
// 用法：
//   npm i -D playwright && npx playwright install chromium   # 一次性准备（不进 readme-craft CI）
//   node screenshot.mjs http://localhost:3000                # 或 TARGET_URL=... node screenshot.mjs

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const TARGET_URL = process.argv[2] ?? process.env.TARGET_URL;
if (!TARGET_URL) {
  console.error("用法：node screenshot.mjs <目标 URL>（或设置 TARGET_URL）");
  process.exit(1);
}

// 固定视口：跨机器、跨时间产出一致尺寸
const OUT_DIR = path.join("docs", "screenshots");

// 语义文件名：文件名说明内容，review 和 diff 才可读
const TARGETS = [
  { name: "home-dashboard", route: "/" },
  { name: "settings-panel", route: "/settings" },
  { name: "export-preview", route: "/export" },
];

let browser;
try {
  mkdirSync(OUT_DIR, { recursive: true });
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const t of TARGETS) {
    await page.goto(new URL(t.route, TARGET_URL).href, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(OUT_DIR, `${t.name}.png`) });
    console.log(`✓ ${t.name}.png`);
  }
} catch (err) {
  console.error(`截图失败：${err.message}`);
  process.exitCode = 1; // 失败必须非零退出，CI 才能拦截过期截图
} finally {
  await browser?.close();
}
