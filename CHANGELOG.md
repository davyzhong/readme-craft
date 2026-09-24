# Changelog

本项目显著变更记录。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [3.0.0-alpha.0] — 2026-09-23

### Added

- `rules.yaml` 规则单一事实源：19 铁律 + 13 反模式、0-5 六档锚点、两种 evaluator（deterministic / agent-reviewed）。
- CLI：`validate` / `generate [--check]` / `check` / `pack-skill` / `install-skill`；退出码 0 / 1 / 2。
- `check`：确定性规则自动核验，agent-reviewed 默认 `unverified`；`--review` 合并 Agent 评分；`--strict` 下 partial 计失败。
- 六类项目 fixture（cli / library / desktop / web-app / service / knowledge-base）与适用性判定。
- `pack-skill`：确定性平铺包 + `manifest.json`（sha256）；`install-skill` 显式 `--target`。
- CLI bundle：`dist/readme-craft.mjs`（esbuild，内嵌规则，重建零 diff）。
- 只读 GitHub Action：`davyzhong/readme-craft@v1`。
- 截图自动化示例：Playwright（Web/GUI）+ VHS（终端）。
- 静态 Web 评分页：<https://davyzhong.github.io/readme-craft/>。
- 批量审计工具 `scripts/batch-audit.mjs`。
- README 链接检查 CI 配方：`examples/ci-recipes/link-check.job.yml`。

### Changed

- 评分从 v2 原始分制（95 分）改为归一化百分制 + 适用项数 + 未核验项数。
- T15 从「必须 frontmatter」改为「语义标题 + 代码块优先；结构化元数据可选」。
- T19 从「CI 自愈」重写为「CI 可复现与可诊断」。
- 四套模板占位符统一为显式 snake_case；移除伪数据。
