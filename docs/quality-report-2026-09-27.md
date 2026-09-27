# README 质量提升执行报告（2026-09-27 · 最终版）

## 1. 本轮做了什么

不是重写 README，而是**用 readme-craft 自己的工具给已有 README 做可复验的体检**，并按体检结果修掉真实缺口。

核心突破：此前所有项目只能看到「已核验 40/50，未核验 9 项，**不输出总分**」——
因为 9 条需要语义理解的铁律默认 `unverified`，工具不猜。本轮为全部 16 个项目写了
`review.yaml`，**首次拿到完整归一化百分制**。

## 2. 最终评分（16 个项目）

| 项目 | 类型 | 总分 | 剩余缺口 |
|------|------|------|---------|
| **DavyLinks** | cli | **85.9** | 首屏无产品截图 |
| **finBoss** | cli | **84.7** | 首屏无 hero 视觉 |
| **MouthType** | desktop | **84.7** | 界面截图为 TODO 占位 |
| **snake-game** | library | **84.4** | 无在线试玩链接 |
| **CastPlay** | service+cli | **84.4** | 4 张界面截图为 TODO 占位 |
| **Mouthpiece** | desktop | **84.4** | 界面截图为 TODO 占位 |
| **CodeWiki** | library | **84.4** | 首屏缺 tagline |
| **davybase** | knowledge-base | **84.4** | — |
| **agent-config** | knowledge-base | **84.4** | 无终端执行截图 |
| **FLOW** | knowledge-base | **81.1** | 无托管在线 Demo |
| **ATLAS** | knowledge-base | **80.0** | 无真实运行截图 |
| **echo** | library | **78.9** | 无真实集成效果截图 |
| **davy** | library | **78.8** | 无运行截图 |
| **deepsearch** | library | **77.8** | 无运行截图 |
| **typewhisper-zh** | knowledge-base | **75.6** | 3 项 partial（中文分支未入库）|
| **SkyNet** | service | **72.5** | 无运行截图 |

**分布**：85+ 共 1 个，80-85 共 9 个，75-80 共 5 个，<75 共 1 个。

## 3. 修掉的真实问题

### 3.1 跨项目系统性缺陷：首屏结构（4 个项目）

**ATLAS、davy、snake-game、typewhisper-zh** 都出现同一问题：
`## 架构` 章节排在 `# 主标题` **之前**，GitHub 首屏先渲染架构图再渲染标题。
已全部下移，H1 回到 frontmatter 之后的第一个位置。

**规律**：按「frontmatter → 架构 → 标题」顺序生成的 README 都有这个问题。
规则只有一条：**H1 必须是 frontmatter 之后第一个块级元素**。

### 3.2 架构图位置（5 个项目）

**SkyNet、deepsearch、davy、echo** 的架构图原本在正文第 51 行左右，
**agent-config** 更是没有任何图。已把架构图提到首屏（badge 之后、第一个内容章节之前），
agent-config 另补「软链拓扑」标题（该图是本项目的核心设计说明）。

效果：agent-config 82.2 → 84.4，echo 76.7 → 78.9，deepsearch 75.6 → 77.8，SkyNet 71.3 → 72.5。

### 3.3 事实性错误（2 个项目）

- **FLOW**：README 声称按「16 铁律 + 10 反模式 + 80 分量表」适配，
  实际当前规范是 19 铁律 + 13 反模式 + 归一化百分制。这是对方法论本身的错误陈述。
- **typewhisper-zh**：`brew install --cask <音标 cask>` 是未填占位符。
  已核实上游真实 cask 名（`typewhisper/tap/typewhisper`）并显式说明指向英文版。

### 3.4 缺失的可验证性与语言策略

- **SkyNet**：补 `curl /health` 最小验证（含预期输出）
- **FLOW**：补「⏱️ 先看效果（30 秒，零部署）」4 个免安装入口
- **DavyLinks**：补 English-only 声明，并区分「中文信源属内容」与「文档语言为英文」
- **finBoss / FinBoss**：补默认语言策略声明

### 3.5 基础设施（readme-craft 自身）

- **npm 发布加固**：tag/version 一致性校验 + 预发布走 `--tag next` + 发布前质量门禁
- **GitHub Pages 自动部署**：新增 `pages.yml`，此前靠手动推 gh-pages 分支，
  线上 `app.js` 已落后于本地构建；现改为 main 上影响 `web/` 或 `rules.yaml`
  的改动自动触发构建部署
- **检测边界披露**：`rules.yaml` 每条 deterministic 规则新增 `detection` 字段，
  CLI 与 Web 页都输出边界提示
- **review 契约**：`review.schema.json` + `specVersion` 校验 + 未知字段拒绝

## 4. 我犯的错误（已纠正）

补 deepsearch 版本 badge 时，第一次写成 `3.3.3`（那是 Spring Boot 父 pom 版本），
实际项目 version 是 `1.0.0`。核对 `pom.xml` 后立即改正。

**这正是方法论禁止的行为**——未核实就写数字。

## 5. 放弃的一个方向（诚实记录）

曾尝试把「README 渲染快照」推给 3 个项目（echo / agent-config / deepsearch），
解决「首屏未引用已生成截图」的问题。实施中发现：

- 快照只是 README 内容的渲染，**不是产品界面截图**，对读者判断产品形态无帮助
- 旧脚本用 `file://` 直接打开 `.md`，截图里全是 `**` 和 `[](link)` 源码符号，
  反而暴露「未渲染」而非展示 README

改用 GitHub 官方 `/markdown` API 渲染后结构正确，但**本质上仍是 README 快照而非产品截图**，
对 T01（视觉锤）的提升有限。已完全回滚，不引入无价值产物。

**结论**：这类项目的 T01 缺口只能靠真实产品截图填补，渲染快照解决不了。

## 6. 可复用的经验

### 6.1 review.yaml 是最高投入产出比的改进

20 行文件比重写整篇 README 有效得多：
- 让 9 条语义铁律从「不参与评分」变成「有据可查的分数」
- 每条 reason 强制写清扣分理由，**逼你承认哪里不够好**
- 结果可复现：`npx github:davyzhong/readme-craft check . --review review.yaml`

本轮发现的 4 个系统性问题（首屏结构、事实错误、不可执行命令、架构图位置）
**全部是写 review 时才暴露的**——因为「逐条对照评分锚点」会强迫回到具体行号。

### 6.2 N/A 比扣分更诚实

8 个项目把 T11 标为 `na`：私有/内网项目、fork 项目、早期阶段项目。
引用无法验证的上游背书（Mouthpiece）或列举内部业务方（echo）属于误导。

**判断标准**：不适用 → `na`；适用但没做好 → 低分。

### 6.3 工具的检测边界必须显式披露

T03 只数 badge 数量和 shields.io 来源，**不判断 badge 指向的检查是否真实可用**。
所以「T03 得 5 分」不等于「badge 反映的项目健康度真实可信」。
这一信息现在由 `rules.yaml` 的 `detection` 字段承载，并在报告尾部显式输出。

## 7. 剩余缺口的处理建议

| 缺口类型 | 项目 | 需要什么 | 谁来做 |
|---------|------|---------|--------|
| 真实产品截图 | CastPlay / MouthType / Mouthpiece | 跑起应用 + Playwright 截图 | 需人工运行应用 |
| 真实运行截图 | SkyNet / deepsearch / davy / ATLAS / echo | 启动服务 + 截 Swagger/终端 | 需人工启动服务 |
| 产品分支入库 | typewhisper-zh | 把 DavyWhisper 中文分支推到仓库 | 需发布决策 |
| 在线 Demo | FLOW / snake-game | 部署到 Pages 或提供试用入口 | 需部署决策 |

**这些都是"需要真实运行环境或发布决策"的事项，不是文档问题。**

## 8. 待 push

- **deepsearch / echo**：内网 GitLab 本机不可达，commit 已落在本地，需在内网环境推送
- 其余 14 个项目 + readme-craft 自身均已 push 完成
