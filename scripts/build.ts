// CLI bundle 构建（M3-0）：esbuild 打包 scripts/readme-craft.ts → dist/readme-craft.mjs。
// 确定性：无时间戳/banner/sourcemap，同版本同输入重建零 diff；
// 独立性：rules.yaml / rules.schema.json / package.json version 通过 define 内嵌，
// bundle 在无 tsx、无源码布局的纯 node 环境下可运行 check。

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSync } from "esbuild";

export function buildBundle(root: string): { outfile: string } {
  const embedded = {
    rulesYaml: readFileSync(path.join(root, "rules.yaml"), "utf8"),
    schemaJson: readFileSync(path.join(root, "rules.schema.json"), "utf8"),
    version: (JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as { version: string })
      .version,
  };
  const outfile = path.join(root, "dist", "readme-craft.mjs");
  buildSync({
    entryPoints: [path.join(root, "scripts", "readme-craft.ts")],
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node24",
    outfile,
    define: { __README_CRAFT_EMBEDDED__: JSON.stringify(embedded) },
    // CJS 依赖（yaml/ajv）打入 ESM 包时需要 require shim；固定字符串，不影响确定性
    banner: {
      js: "import { createRequire as __readmeCraftCreateRequire } from 'node:module'; const require = __readmeCraftCreateRequire(import.meta.url);",
    },
    logLevel: "silent",
  });
  return { outfile };
}

// 直接执行（pnpm run build）时构建本仓 bundle
const invokedAsScript = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedAsScript) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const { outfile } = buildBundle(repoRoot);
  process.stdout.write(`bundle 已生成：${path.relative(repoRoot, outfile)}\n`);
}
