# Changelog

本项目显著变更记录。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

规则数量、评分口径与版本号以 `rules.yaml` 为唯一事实源；本文件只记录叙述性变更，
不作为事实源。v3.0 之前的版本号沿用当时的 README 声明，`v3.0.0-alpha.0` 起由
`rules.yaml` 与 `package.json` 共同确定。

## [Unreleased]

### Added

- 启发式检测边界披露：`rules.yaml` 每条 `deterministic` 规则新增 `detection` 字段（由 `validate`
  强制），写明该检查实际使用的手段与不覆盖的语义面；`check` 报告新增 `heuristicRuleIds` 与
  `rules[].heuristic` / `rules[].detection`，文本报告与 Web 评分页输出边界提示。
- `review.schema.json`：Agent review 文件的 JSON Schema（编辑器可补全）；`check` 校验可选的
  `specVersion`（给出时须与 `rules.yaml` 一致）并显式拒绝未知字段。
- `scripts/action-rehearsal.mjs`：以消费者仓库视角演练 Action 入口契约（不修改本仓 CI），
  用于发布前/升级后的人工验收。
- `examples/ci-recipes/readme-check.consumer.yml`：消费者仓库接入 Action 的最小 workflow 配方。
- `docs/project-types.md`：项目类型判定优先级、六类判据，以及 monorepo / SDK / 混合型 /
  基础设施仓等未覆盖形态与绕过方式。
- `docs/decisions/2026-09-27-owner-decisions.md`：owner 决定台账（npm 发布硬化、公开历史与
  许可证归属的风险接受、维护冻结）。

### Changed

- 加固 npm 发布 workflow：发布前校验 tag 与 `package.json` version 一致；预发布版本强制走
  `--tag next`，不再占用 default 通道；发布前执行完整质量门禁。
- `skill/` 的受控软链与 `dist/readme-craft.mjs` 的 `.gitignore` 例外在 README 中说明。
- 冻结状态文档化：`docs/archive/2026-09-25-review.md` 状态改为 completed 并更新冻结结论，
  `docs/plans/2026-09-25-midcycle-freeze-review.md` 增加 `resolved_by` 指向决定台账。
- `CHANGELOG.md` 补齐 v1.0 → v2.3 历史条目。

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

## [2.3] — 2026-09-21

### Added

- T19 CI 自愈（结构轴）：lockfile 入仓库、CI 安装方式、README 链接检查。
- A13 反模式：workflow 不自愈。

### Changed

- 评分量表 90 → 95。

> 注：T19 的初版建议（用 `npm install` 替代 `npm ci`、移除 `cache: npm`）在 v3.0-alpha 中被判定为
> 与业界可复现实践冲突，已重写为「CI 可复现与可诊断」。

## [2.2] — 2026-09-21

### Added

- T18 截图自动化（视觉轴）：截图必须由脚本产生，禁止人工维护。
- A12 反模式：截图手工维护。

### Changed

- 评分量表 85 → 90。

## [2.1] — 2026-09-21

### Added

- T17 默认语言策略：按目标用户群体反推默认语言。
- A11 反模式：默认语言错位。

### Changed

- 评分量表 80 → 85。
- 同步 `skill/SKILL.md` 到 17 铁律 + 11 反模式口径。

## [2] — 2026-09-21

### Added

- T13 i18n 规范、T14 包容性语言、T15 LLM 友好元数据、T16 无障碍 a11y。
- A9 反模式：零 i18n 但有海外用户；A10 反模式：emoji 满屏无实质。
- 同行对标章节、`assets/banner.svg`。

### Changed

- 评估轴从 3 条扩到 5 条（新增 AI 轴、包容轴）。
- 铁律 12 → 16，反模式 8 → 10，评分量表 60 → 80。

## [1.0] — 2026-09-21

### Added

- 初始方法论：12 条铁律（T1-T12）、8 条反模式（A1-A8）、60 分评分量表、适用边界决策表。
- 四套模板：`minimal` / `standard` / `rich` / `cn-academic`。
- `craft-readme` Skill 初版。
- MouthType before/after 案例。
