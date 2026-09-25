# tests/fixtures — 六类项目 fixture

每个目录是一个最小项目标本，用于 `check` 的适用性判定与规则评分回归测试。

## 正负向约定

| fixture | 角色 | `pnpm readme-craft check <dir> --type cli` 预期退出码 |
|---|---|---|
| `cli-golden/` | **正向**：全部适用确定性规则 pass，agent-reviewed 规则 unverified | `0` |
| `cli/` | **负向**：极简 README，多条确定性规则 fail | `1` |
| `library/` `desktop/` `web-app/` `service/` `knowledge-base/` | 适用性矩阵标本 | 视规则结果而定 |

终验命令集只使用 `cli-golden`（正向）与 `cli`（负向）；两者退出码均为测试断言锁定的契约，不是临时观察值。

## 规则

- fixture 只放检查器需要的最小文件，禁止伪造成可运行的真实项目。
- 本目录只保留当前测试使用的项目类型样例；未列入目录树的历史演示材料不属于当前交付物。
- 修改检查器逻辑后必须重跑 `pnpm test`，确认 fixture 预期仍成立。
