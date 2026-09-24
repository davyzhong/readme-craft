<div align="center">

# 📜 readme-craft

**README 方法论 + 规则引擎 + CLI + Skill — 让任何项目的 README 稳定产出高分，而不是靠模板拼凑。**

[![npm](https://img.shields.io/npm/v/readme-craft)](https://www.npmjs.com/package/readme-craft)
[![License](https://img.shields.io/github/license/davyzhong/readme-craft)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/davyzhong/readme-craft/validate.yml)](./.github/workflows/validate.yml)
[![Node](https://img.shields.io/badge/node-%E2%89%A524.15-blue)](./package.json)

[快速开始](#-快速开始) · [19 条铁律](./METHODOLOGY.md) · [在线评分](https://davyzhong.github.io/readme-craft/) · [GitHub Action](#-github-action) · [Skill](#-skill)

</div>

---

## 🚀 快速开始

### npx 直接用（零安装）

```bash
npx readme-craft check .          # 检查当前项目的 README
npx readme-craft check . --type cli  # 指定项目类型
```

### npm 全局安装

```bash
npm install -g readme-craft
readme-craft check .
```

### 五个命令

| 命令 | 用途 |
|---|---|
| `readme-craft check <path>` | 对项目 README 执行确定性规则检查 |
| `readme-craft validate` | 校验自身仓库文档一致性（版本/链接/锚点/占位符/生成区块） |
| `readme-craft generate [--check]` | 从 rules.yaml 生成/校验文档区块 |
| `readme-craft pack-skill` | 构建可分发的 Skill 平铺包 |
| `readme-craft install-skill --target <path>` | 安装 Skill 到指定目录 |

`check` 只运行确定性规则（链接存在、图片 alt、治理文件等）；需要语义判断的规则标为 `unverified`，可用 `--review <yaml>` 合并 Agent 评分。退出码：`0` 成功、`1` 存在 fail、`2` 参数/环境错误。

---

## 📐 19 条铁律速览

| 轴 | 铁律 | 核心动作 |
|---|---|---|
| **视觉** | T1 视觉锤 · T6 视觉矩阵 · T8 Feature 分组 · T18 截图自动化 | 首屏必须有视觉；截图由脚本产生，禁止手工维护 |
| **内容** | T2 三秒价值主张 · T3 Badge 矩阵 · T7 卖点编号 · T9 架构图 · T10 对照表 · T11 引用背书 · T17 默认语言 | 1 句话讲清做什么给谁用；不伪造数据/引用/截图 |
| **结构** | T4 安装多路 · T5 Quickstart · T12 收尾五件套 · T19 CI 可复现 | 覆盖正式支持的平台；lockfile 入库 + frozen install |
| **包容** | T13 i18n · T14 包容性语言 · T16 a11y | BCP 47 命名；alt 描述具体；不依赖颜色单一传达信息 |
| **AI** | T15 LLM 友好 | 语义标题 + 代码块优先；结构化元数据可选 |

[→ 完整方法论（19 铁律 + 13 反模式 + 评分锚点）](./METHODOLOGY.md) · [→ 自检清单](./checklist.md)

---

## 🔧 GitHub Action

```yaml
- uses: davyzhong/readme-craft@v1
  with:
    path: .
    type: cli   # cli / library / desktop / web-app / service / knowledge-base
```

只读，无 PR 回写，无 token 需求。输出：`verified-score` / `verified-maximum` / `unverified-count` / `report-path`。

---

## 🌐 在线评分

打开 **<https://davyzhong.github.io/readme-craft/>**，粘贴 README + 选择项目类型，浏览器本地运行检查（内容不离开浏览器）。

---

## 🤖 Skill

让 AI Agent 按方法论产出 README：

```bash
git clone https://github.com/davyzhong/readme-craft.git
readme-craft install-skill --target ~/.claude/skills/craft-readme
```

或在 Agent 提示词里直接引用：`@/path/to/readme-craft/skill/SKILL.md`

---

## 🏗️ 4 套模板

| 模板 | 行数 | 适用 |
|---|---|---|
| minimal | ≤80 | CLI / 个人小工具 |
| standard | 200-400 | 后端服务 / 框架 / 库 |
| rich | 大型 | GUI 桌面 / 产品 / AI/ML |
| cn-academic | 200-400 | 中文知识库 / 方法论 |

[→ 浏览模板](./templates/)

---

## 📊 评分模型

- 每条规则 0-5 分（六档锚点，确定性规则自动核验）
- 不适用项标 `N/A`，从满分中扣除
- 存在未核验项时不输出总分（诚实原则）
- 对外展示归一化百分制 + 适用项数 + 未核验项数

---

## 🛡️ License

[MIT](./LICENSE) — 拿去用，注明出处。

---

<div align="center">
<sub>📜 让读者在 30 秒内决定"装 / 不装 / 走 / 留"。</sub>
<br>
<sub>🤖 让 LLM 在 30 秒内决定"用 / 不用 / 引 / 不引"。</sub>
</div>
