# readme-craft 项目规范

## 项目定位

readme-craft 是一套 README 方法论、规则引擎与工具链。核心目标：基于真实项目证据，稳定产出结构清晰、可执行、无虚假信息的 README。

## 目录约定

- 根目录：项目入口、方法论、检查清单与治理文件。
- `templates/`：按项目类型组织的 README 模板。
- `examples/`：可复制的集成示例与配置片段。
- `skill/`：可安装的 craft-readme Skill 完整包视图（METHODOLOGY.md / checklist.md / templates 为指向根部的受控软链）。
- `assets/`：视觉资产。
- `scripts/`：CLI 与工具脚本。
- `tests/`：测试与六类项目 fixture。
- `web/`：纯前端本地评分页。
- `.local/`：**私有目录**（.gitignore 排除，不推送到 GitHub）。存放审计报告、内部计划、个人笔记等含隐私内容。
- `docs/plans/`：仅存放可公开、已脱敏的项目计划；含隐私的审计细节留在 `.local/`，不得复制进公开计划。

目录名使用小写 kebab-case。

## 内容与证据规则

1. 不伪造安装命令、性能数据、用户引用、客户 Logo、截图或支持平台。
2. 示例无法追溯到真实项目证据时，必须明确标注。
3. 方法论规则必须说明适用范围；不适用项使用 `N/A`。
4. 全仓版本、规则数量、评分口径以 `rules.yaml` 为唯一事实源。
5. 自反性：readme-craft 自身的 README 与对外声明必须遵守本方法论。

## 隐私分离规则

> 判定标准：「这个文件提到内部项目名或本地路径吗？」
> 有 → `.local/` ｜ 没有 → 公开目录

## 工作流程

1. 开始工作前执行 `git pull --ff-only`。
2. 先更新规范或设计，再修改实践。
3. 修改后运行 `pnpm validate && pnpm test && pnpm typecheck`。
4. 使用 Conventional Commits。
5. commit 后立即 push；rebase、force push、公开发布需 owner 批准。

## 当前阶段

项目已发布：v3.0.0-alpha.0。GitHub 公开仓库 + Action v1 + Pages 评分页 + npx github: 可用。npm registry 发布待配置 NPM_TOKEN 后推 tag 触发。旧仓库 readme-craft-dev 已归档（private）。

## 计划索引

- 当前唯一权威计划：[`docs/plans/2026-09-25-midcycle-freeze-review.md`](docs/plans/2026-09-25-midcycle-freeze-review.md)
- 前序公共发布与隐私收尾计划（已由当前计划承接）：[`docs/plans/2026-09-24-public-release-closeout.md`](docs/plans/2026-09-24-public-release-closeout.md)
