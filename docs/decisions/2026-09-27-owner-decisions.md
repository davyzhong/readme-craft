---
title: 已决事项与风险接受记录
date: 2026-09-27
status: active
scope: owner decisions that close open gates or accept known risk
---

# 已决事项与风险接受记录

本文件记录已经由 owner 拍板、因此不再作为开放门槛的事项。每条都写明决定、依据和复启条件，
避免同样的问题在后续 review 中被重复提出。

索引：`docs/plans/2026-09-25-midcycle-freeze-review.md` 是当前权威计划；本文件是它的决定台账。

---

## D-001 · npm 发布 workflow 加固（已执行）

**决定**：加固 `.github/workflows/npm-publish.yml`，并在 owner 批准 CI 变更的前提下落地。

**加固内容**：

1. 发布前校验 tag 与 `package.json` version 严格一致，不一致即中止。
2. 预发布版本（version 含 `-`）强制走 `npm publish --tag next`，不占用 default 通道。
3. 稳定版本才允许写入 default dist-tag。
4. 发布前执行 `typecheck` / `test` / `validate` / `check:generated` 全量门禁。

**依据**：加固前 workflow 使用宽泛的 `tags: ['v*']` 触发且执行 `npm publish --access public`，
没有 tag 与 version 的一致性校验，也没有区分预发布通道。当前包版本为 `3.0.0-alpha.0`，
一旦误触发会把预发布包推入 default 通道，导致 `npm i readme-craft` 拿到 alpha。

**结果**：[`2026-09-25-review.md`](../archive/2026-09-25-review.md) 的 P0 发布门槛关闭。

**复启条件**：npm 发布策略从「推 tag 即发」改为其他形式，或引入多包/多通道发布时重新评估。

---

## D-002 · 公开 Git 历史与许可证归属（风险已接受）

**决定**：不改写 Git 历史。保留现有公开历史，接受其中的身份元数据，并确认许可证归属无需变更。

**依据**：

- 现有历史的作者身份为 `qiming <qiming@users.noreply.github.com>`（97 commits）与
  `davyzhong <zhong.davy@gmail.com>`（2 commits）。二者为同一自然人（Davy Zhong）的不同
  Git 身份，不构成第三方隐私泄露。
- `LICENSE` 声明 `Copyright (c) 2026 qiming`，与上述主要提交身份一致，无需修改。
- 历史中不包含需要移除的私有项目标识、凭证或内部路径；相关审计细节仅存在于 gitignored
  的 `.local/`。
- 改写历史会要求所有克隆方重新克隆、破坏既有 commit 引用，并使 `main` 与已发布 tag
  `v1`（Action）之间的可追溯性失效。收益不足以覆盖代价。

**接受的风险**：外部观察者可通过 `git log` 看到两个关联的提交身份。这是可接受的公开署名信息，
不构成敏感信息泄露。

**结果**：[`2026-09-25-review.md`](../archive/2026-09-25-review.md) 的 P0 历史门槛关闭，
冻结阻塞解除。

**复启条件**：若未来发现历史中确实存在凭证、内部主机名、第三方私有项目名或他人隐私信息，
则重新提出历史清理提案（届时需协调所有克隆方并验证所有公开 refs）。

---

## D-003 · 冻结决定（可进入维护冻结）

**决定**：核心产品范围进入维护冻结态。

**依据**：方法论、规则引擎、CLI、Skill、Action、Web 评分页、CI 门禁、公开归档均已交付并通过
全量验证（`validate` / `test` 147 / `typecheck` / `web:test` / `check:generated`）。
P0 发布门槛与历史门槛已分别由 D-001、D-002 关闭。

**复启条件**（仅限以下情形）：

- 已证实的 P1 缺陷（崩溃、越界、错误发布）。
- 外部兼容或安全故障。
- 核心用户流程出现可复现问题。
- 规则事实源 `rules.yaml` 的缺陷导致评分失真。

新增产品领域（如通用文档平台、托管服务、多模型编排）不属于复启理由，需要独立立项。

---

## 仍开放但不阻塞的事项

以下事项已被 review 记录为有限 backlog，不阻塞冻结，按需处理：

- 启发式规则的检测边界需要更明确地暴露给用户（避免把确定性检测包装为语义保证）。
- `review` YAML 缺正式 JSON Schema 与版本字段。
- 缺少 Action 的端到端消费者仓库演练。
- 六类项目类型对 monorepo / SDK / 多语言仓库的分类边界需要文档化。
