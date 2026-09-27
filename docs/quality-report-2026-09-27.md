# README 质量提升执行报告（2026-09-27 · 完整版）

## 1. 本轮的核心突破

此前 16 个项目都只能看到「已核验 40/50，未核验 9 项，**不输出总分**」——
因为 9 条需要语义理解的铁律（T01/T02/T04/T05/T07/T08/T11/T14/T17）默认 `unverified`，
工具不猜。本轮为全部 16 个项目写了 `review.yaml`，**首次拿到完整归一化百分制**。

## 2. 全部项目评分

| 项目 | 类型 | 总分 | 唯一/主要缺口 |
|------|------|------|-------------|
| **DavyLinks** | cli | **85.9** | 首屏无产品截图 |
| **finBoss** | cli | **84.7** | 首屏无 hero 视觉 |
| **MouthType** | desktop | **84.7** | 界面截图仍为 TODO 占位 |
| **snake-game** | library | **84.4** | 无在线试玩链接 |
| **CastPlay** | service+cli | **84.4** | 4 张界面截图为 TODO 占位 |
| **Mouthpiece** | desktop | **84.4** | 界面截图仍为 TODO 占位 |
| **CodeWiki** | library | **84.4** | 首屏缺 tagline |
| **davybase** | knowledge-base | **84.4** | — |
| **agent-config** | knowledge-base | **82.2** | 首屏无软链拓扑图 |
| **FLOW** | knowledge-base | **81.1** | 无托管在线 Demo |
| **ATLAS** | knowledge-base | **80.0** | 无真实运行截图 |
| **davy** | library | **78.8** | 无运行截图 |
| **echo** | library | **76.7** | 首屏未引用已自动生成的截图 |
| **typewhisper-zh** | knowledge-base | **75.6** | 3 项 partial，均因中文分支未入库 |
| **deepsearch** | library | **75.6** | 无截图、无可交互验证入口 |
| **SkyNet** | service | **71.3** | 首屏无视觉；纯后端无 GUI |

**分布**：85+ 共 1 个，80-85 共 11 个，75-80 共 3 个，<75 共 1 个。中位数 82.2。

## 3. 修掉的真实问题

### 3.1 跨项目系统性缺陷：首屏结构（4 个项目）

**ATLAS、davy、snake-game、typewhisper-zh** 都出现同一问题：
`## 架构` 章节与 mermaid 图排在 `# 主标题` **之前**，导致 GitHub 首屏先渲染架构图、
再渲染标题，标题不在首屏中央。

已全部把架构块下移，H1 回到 frontmatter 之后的第一个位置。

**规律**：凡是按「frontmatter → 架构 → 标题 → 副标题」顺序生成的 README 都有这个问题。
规则只有一条：**H1 必须是 frontmatter 之后第一个块级元素**。

### 3.2 事实性错误（2 个项目）

- **FLOW**：README 声称按「16 铁律 + 10 反模式 + 80 分量表」适配，
  实际当前规范是 19 铁律 + 13 反模式 + 归一化百分制。这是对方法论本身的错误陈述。
- **typewhisper-zh**：`brew install --cask <音标 cask>` 是未填的占位符。
  已核实上游真实 cask 名（`typewhisper/tap/typewhisper`）并显式说明该命令指向英文版。

### 3.3 我自己犯的错误（已纠正）

补 deepsearch 版本 badge 时，第一次写成 `3.3.3`（那是 Spring Boot 父 pom 版本），
实际项目 version 是 `1.0.0`。核对 `pom.xml` 的 project 级 version 后立即改正。

**这正是方法论 T01/T11 禁止的行为**——未核实就写数字。

### 3.4 缺失的可验证性

- **SkyNet**：补 `curl -s http://127.0.0.1:8000/health` 最小验证（含预期输出）
- **FLOW**：补「⏱️ 先看效果（30 秒，零部署）」4 个免安装入口
- **DavyLinks**：补 English-only 语言声明，并主动区分「中文信源属内容」与「文档语言为英文」

### 3.5 内网项目的诚实处理

**deepsearch / echo** 托管在内网 GitLab，无法使用 GitHub CI/star badge。
选择如实标注 `build: local only`，而非留空或伪造 CI 通过状态。

## 4. 可复用的经验

### 4.1 review.yaml 是最高投入产出比的改进

一份 20 行的 review.yaml 比重写整篇 README 有效得多：

- 让 9 条语义铁律从「不参与评分」变成「有据可查的分数」
- 每条 reason 强制写清扣分理由，**逼你承认哪里不够好**
- 结果可复现：`npx github:davyzhong/readme-craft check . --review review.yaml`

本轮发现的问题（首屏结构、事实性错误、不可执行命令）**几乎全部是写 review 时才暴露的**——
因为「逐条对照评分锚点检查」这个动作会强迫你回到具体行号。

### 4.2 N/A 比扣分更诚实

16 个项目里有 8 个把 T11（引用背书）标为 `na`：

- 私有/内网项目（davybase、agent-config、deepsearch、echo、finBoss）→ 无外部客户
- 早期阶段（CodeWiki、MouthType、snake-game）→ 无可溯源引用
- fork 项目（Mouthpiece）→ 引用无法验证的上游背书属于误导

**判断标准**：不适用 → `na`；适用但没做好 → 低分。混淆两者会让分数失去意义。

### 4.3 工具的检测边界必须显式披露

本轮 readme-craft 自身加了 `detection` 字段。评审时能清楚看到：
T03 只数 badge 数量和 shields.io 来源，**不判断 badge 指向的检查是否真实可用**。
所以「T03 得 5 分」不等于「badge 反映的项目健康度真实可信」。

### 4.4 最大的共性缺口是视觉，不是文字

11 个项目的扣分点集中在 T01（视觉锤）与 T05（30 秒试用），
而两者都指向同一件事：**没有真实的运行截图**。

CastPlay、MouthType、Mouthpiece 的截图是 `[TODO]` 占位——
README 如实标注了这点（符合证据铁律），但读者确实看不到产品长什么样。

## 5. 下一步建议（按投入产出比）

| 优先级 | 动作 | 覆盖 | 预期收益 |
|--------|------|------|---------|
| **1** | 给 3 个 GUI 项目补真实截图 | CastPlay / MouthType / Mouthpiece | 各 +2~3 分，且兑现已声明的截图自动化 |
| **2** | 首屏引用已自动生成的截图 | echo / agent-config / deepsearch | 各 +1~2 分，零成本（截图已存在） |
| **3** | 部署 readme-craft 自身到 GitHub Pages 并在 README 引用 | 自身 | 同时给所有下游项目提供可点击的在线示例 |
| 4 | typewhisper-zh 中文分支入库 | typewhisper-zh | 3 项 partial 全部解除，可达 85+ |
| 5 | 给纯后端项目补架构图/时序图 | deepsearch / SkyNet / ATLAS | 提升首屏信息密度 |

第 1、2 项都**不需要重写 README**，只需要补图或补一行引用。

## 6. 待 push

- **deepsearch / echo**：内网 GitLab 本机不可达，commit 已落在本地，需在内网环境推送
- 其余 14 个项目均已 push 完成
