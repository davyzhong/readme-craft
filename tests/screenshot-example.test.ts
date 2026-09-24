import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pwDir = path.join(repoRoot, "examples", "screenshot-automation", "playwright");
const vhsDir = path.join(repoRoot, "examples", "screenshot-automation", "vhs");

// ---------- M3-2 Playwright 示例（静态校验，不下载浏览器、不进 CI） ----------

test("playwright 示例：文件齐备", () => {
  assert.ok(existsSync(path.join(pwDir, "README.md")), "缺 README.md");
  assert.ok(existsSync(path.join(pwDir, "screenshot.mjs")), "缺 screenshot.mjs");
});

test("playwright 示例：固定视口 + 语义文件名 + 失败非零退出", () => {
  const src = readFileSync(path.join(pwDir, "screenshot.mjs"), "utf8");
  assert.ok(/viewport:\s*\{\s*width:\s*\d+,\s*height:\s*\d+\s*\}/.test(src), "必须固定视口尺寸");
  assert.ok(/process\.exitCode\s*=\s*1|process\.exit\(1\)/.test(src), "失败必须非零退出");
  assert.ok(!/Date\.now|Math\.random/.test(src), "文件名不得含时间戳/随机数（确定性）");
  assert.ok(/TARGET_URL|argv/.test(src), "URL 必须显式传入，不写死");
});

test("playwright 示例：README 说明不进本仓 CI、不自动下载浏览器", () => {
  const md = readFileSync(path.join(pwDir, "README.md"), "utf8");
  assert.ok(md.includes("CI"), "README 需说明与 CI 的关系");
});

// ---------- M3-3 VHS 示例 ----------

test("vhs 示例：tape 固定尺寸、输入速度与输出路径", () => {
  const tape = readFileSync(path.join(vhsDir, "demo.tape"), "utf8");
  assert.ok(/^Output\s+\S+/m.test(tape), "tape 必须声明 Output 路径");
  assert.ok(/^Set\s+Width\s+\d+/m.test(tape) && /^Set\s+Height\s+\d+/m.test(tape), "tape 必须固定终端尺寸");
  assert.ok(/^Set\s+TypingSpeed/m.test(tape), "tape 必须固定输入速度");
  assert.ok(existsSync(path.join(vhsDir, "README.md")), "缺 README.md");
});
