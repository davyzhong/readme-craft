# web/ · 本地 README 评分页

纯前端、纯本地的 README 评分页：粘贴 README 内容、显式选择项目类型，浏览器在本地运行 browser-safe 确定性规则并显示报告。**内容不离开浏览器**——不上传、不遥测、不依赖 `rules.yaml` 之外的任何数据源。

## 边界

- 只运行 `rules.yaml` 中标记 `browser_safe: true` 的确定性检查（与 CLI 共用 `scripts/lib/content-checks.ts`，无第二套逻辑）；
- 依赖文件系统、远程链接或语义判断的规则一律显示 `unverified`，不猜总分；
- 存在未核验项时不输出总分（与 CLI 同一口径）。

## 命令

```bash
pnpm web:preview   # 构建并在 http://localhost:4173/ 本地预览（Ctrl+C 停止）
pnpm web:test      # Web/CLI 一致性测试（同 fixture 的 browser-safe 结果逐项相等）
pnpm web:build     # 仅构建 web/dist/app.js（esbuild，重建零 diff）
```

规则数据来自 `src/generated/rules.ts`（由 `pnpm generate` 从 `rules.yaml` 投影生成，勿手改）。

← 返回 [项目 README](../README.md)
