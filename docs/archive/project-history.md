# 项目演进史

截至 2026-09-25 的可验证项目脉络。该时间线描述产品演进，不代表每个历史实现都仍受支持；版本事实应以 `CHANGELOG.md`、Git tags 与对应源码为准。

| 阶段 | 演进 | 证据与沉淀 |
|---|---|---|
| v1 | 从 README 写作经验整理出可复用的结构与内容方法，并以示例和模板降低上手成本。 | `METHODOLOGY.md` 的历史章节、`CHANGELOG.md` |
| v2 | 扩展到 19 条评估规则、反模式、按类型模板和可量化清单；将实践沉淀为 Agent 可读取的 Skill。 | `rules.yaml`、`checklist.md`、`templates/`、`skill/SKILL.md` |
| v2.3.x | 加强自检、视觉与项目类型适配；形成公开演示与版本化方法论。 | Git tag 与 `CHANGELOG.md` |
| v3.0 alpha | 将规则集中为 `rules.yaml`，提供确定性 CLI、Agent review 合并、Skill 安装器、GitHub Action、本地 Web 评分页和批量审计；固定公开报告口径。 | `package.json`、`scripts/`、`action.yml`、`web/`、`README.md` |
| 2026-09 | 公开发布与私有开发资料分离；进行中期冻结审查，纠正过期声明，补安全边界并建立公开/私有知识归档。 | [`2026-09-25 review`](2026-09-25-review.md)、[`authoritative plan`](../plans/2026-09-25-midcycle-freeze-review.md) |

## 演进原则

项目始终围绕同一问题：让 README 基于项目真实证据，结构清楚、可执行并可重复检查。v3 增加的是同一流程的确定性工具与接入面，并非扩展为通用文档平台。规则变更应以 `rules.yaml` 和方法论为依据，并同步更新生成内容、模板、测试和版本记录。

## 证据限制

此文档根据当前可访问的 Git 对象、tag、变更日志和当前文件整理。完整的内部提交时间线及原始审计仅保存在私有归档，不在公开文档重述；如有不可访问或无法确认的历史细节，不应仅凭本摘要推断。
