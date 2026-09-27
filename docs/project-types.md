---
title: 项目类型判定与适用边界
date: 2026-09-27
status: active
scope: how readme-craft classifies a target project and what falls outside the six types
---

# 项目类型判定与适用边界

`readme-craft check` 需要先知道目标项目属于哪一类，才知道哪些铁律适用、哪些应记 `N/A`。
本文件说明判定优先级、六类的判据，以及**已知不被覆盖的形态**与绕过方式。

事实源：类型枚举定义在 `scripts/lib/types.ts` 的 `PROJECT_TYPES`；判定逻辑在
`scripts/lib/project.ts`；每条铁律的适用范围写在 `rules.yaml` 的 `applies_to`。

---

## 1. 判定优先级

从高到低，命中即止：

| 优先级 | 来源 | 说明 |
|---|---|---|
| 1 | 命令行 `--type` | 可重复传入，声明一种或多种类型；最高优先级 |
| 2 | 目标仓库 `.readme-craft.yaml` | 写 `projectTypes: [cli, library]`，必须非空且合法 |
| 3 | 自动探测 | 读 manifest 与目录结构推断 |
| 4 | 无法唯一判断 | 记 `ambiguous`，条件规则一律 `unverified`，**不猜总分** |

判定结果会在报告里标注来源（`（来源：cli / config / detect）`），便于确认分类是否符合预期。

---

## 2. 六类的判据

| 类型 | 含义 | 自动探测信号（节选） |
|---|---|---|
| `cli` | 命令行工具 / 脚本 | `package.json` 有 `bin`；`pyproject.toml` 含 `[project.scripts]`；`Cargo.toml` 且有 `src/main.rs` |
| `library` | 供他人集成的库 / SDK | `package.json` 有 `main`/`exports` 且无 `bin`；`pyproject.toml` 无 scripts；`Cargo.toml` 无 `src/main.rs` |
| `desktop` | 桌面应用 | 依赖含 `electron` / `@tauri-apps/api`；存在 `Package.swift` 或 `*.xcodeproj` |
| `web-app` | 前端 Web 应用 | 存在根级 `index.html` |
| `service` | 后端服务 / API | 存在 `Dockerfile` / `docker-compose.yml`；或 `package.json` 有 `start` 脚本且有 Dockerfile |
| `knowledge-base` | 文档 / 方法论知识库 | 无任何 manifest 信号，且根目录有 ≥2 个 `.md` |

一个项目可以同时属于多类（例如 CLI + library）。多类判定时，规则按「任一适用类型适用」生效。

---

## 3. 已知不被自动探测覆盖的形态

以下形态**没有**专门判据，自动探测很可能落到错误类型或 `ambiguous`。这不是缺陷，是当前
显式边界的诚实记录。

### 3.1 Monorepo / 多包仓库

- 现状：探测器只看根目录。一个 `packages/*` 形式的 monorepo，如果根目录没有 `index.html`
  或 `Dockerfile`，可能落到 `library` 或 `ambiguous`。
- 影响：根 README 通常需要 `Ecosystem` 类内容（T08b），但类型判错会让部分条件规则被记 `na`。
- 建议做法：**显式声明**。在根 `.readme-craft.yaml` 写
  ```yaml
  projectTypes: [library, cli]
  ```
  或直接 `--type library --type cli`。
- 不建议：为 monorepo 新增第七类类型。`library + cli` 已能覆盖绝大多数 monorepo 的 README 需求。

### 3.2 SDK / 多语言发布的单一项目

- 现状：探测器按「先命中的语言」给单一语言类型，不区分同一项目的多语言实现
  （例如 Python + TypeScript 的 SDK）。
- 影响：类型本身仍正确（`library`），但 `applies_to` 的判定不区分语言，因此不存在误判。
- 建议做法：无需特殊处理。若 README 需要按语言分节，属于内容组织问题，不影响评分口径。

### 3.3 混合型项目（应用 + 库 + 服务同仓）

- 现状：可能同时命中 `cli` / `library` / `service`，判定为多类型。
- 影响：多类型下适用规则变多，`verifiedMaximum` 会变大。这是正确行为——混合型项目确实要满足更多铁律。
- 建议做法：如实声明全部类型，不要为了降低适用满分而只声明其中一种。

### 3.4 纯文档站点（无代码）

- 现状：若有 `index.html` 会命中 `web-app`；只有 Markdown 时命中 `knowledge-base`。
- 影响：若实际是静态文档站但没有 `index.html`（例如 Hugo/Jekyll 需要构建），会被判为 `knowledge-base`。
- 建议做法：显式声明 `projectTypes: [web-app, knowledge-base]`。

### 3.5 容器镜像 / 基础设施仓库

- 现状：有 `Dockerfile` 会命中 `service`，但 Terraform / Ansible 等基础设施仓库不属于六类中的任何一类。
- 影响：可能误判为 `service`。
- 建议做法：显式声明最接近的类型，并接受少量规则不适用。若这类形态变常见，再考虑扩展枚举。

---

## 4. 分类错误的代价与纠正

- 代价：类型判错会让部分本应检查的铁律记为 `na`（漏检），或让不适用的铁律被检查（误报）。
  分数本身不会因此失真到无法使用，但**适用项数会变化**，`verifiedMaximum` 随之变化。
- 纠正：任何时候都可以用 `--type` 覆盖，无需修改代码。
- 反馈：如果某类真实项目反复被判错，请记录典型 manifest 形态，作为扩展探测信号的输入。

---

## 5. 扩展判据的门槛

新增类型或新增探测信号时，必须同时满足：

1. 现有六类的组合无法合理表达该形态（用 `--type` 多值 + `N/A` 也表达不了）。
2. 有真实、可追溯的项目证据，而不只是设想。
3. 新增后 `rules.yaml` 的 `applies_to` 需要相应更新，否则新类型会让所有规则都变成 `na`。

不满足以上条件时，正确做法是用现有类型的组合 + 显式声明，而不是扩展枚举。
