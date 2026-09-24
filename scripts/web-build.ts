// Web 评分页构建（M3-5）：esbuild 打包 web/src/main.ts → web/dist/app.js。
// 与 CLI bundle 同一工具链；确定性构建（无时间戳/sourcemap），重建零 diff。
// content-checks.ts 与 generated/rules.ts 一并打入，证明 Web 端无任何 node 内置依赖。

import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSync } from "esbuild";

export function buildWeb(root: string): { outfile: string } {
  const outfile = path.join(root, "web", "dist", "app.js");
  buildSync({
    entryPoints: [path.join(root, "web", "src", "main.ts")],
    bundle: true,
    platform: "browser",
    format: "iife",
    target: "es2022",
    outfile,
    logLevel: "silent",
  });
  return { outfile };
}

const invokedAsScript = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedAsScript) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const { outfile } = buildWeb(repoRoot);
  process.stdout.write(`Web 产物已生成：${path.relative(repoRoot, outfile)}\n`);
}
