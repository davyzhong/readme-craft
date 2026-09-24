# README 写作方法论 v3.0.0-alpha.0

> **目的**：给你一套**判断 + 决策**框架，而不是 checklist。checklist 是死的，框架让你在面对陌生项目时也能产出高归一化得分的 README。
> **当前口径**：规则与评分以 `rules.yaml` 为唯一事实源（19 铁律 / 13 反模式 / 0-5 分锚点 / 归一化百分制）；本文件是规则的散文解释，两者冲突时以 `rules.yaml` 为准。
>
> **基于**：9 个本地自建项目对照 + 8 个 GitHub 公认最佳范本（fastapi、supabase、deno、tailwind、tauri、ollama、huggingface transformers、whisper-desktop、knowledge-base-app、iris、config-manager、atlas-planning）的逐字逐行分析；融合 12 个方法论/工具竞品对标（standard-readme、Art of README、awesome-readme、opensource.guide、Write the Docs 等）。

---

## 历史背景：v1 → v2 升级摘要（历史口径；现行规则见 §2 与 rules.yaml）

| 维度 | v1 | v2 |
|---|---|---|
| 评估轴 | 3 条 | **5 条**（新增 AI 轴、包容轴） |
| 铁律数量 | 12 | **16**（新增 T13 i18n / T14 包容性 / T15 LLM 友好 / T16 a11y） |
| 反模式数量 | 8 | **10**（新增 A9 零 i18n / A10 emoji 满屏） |
| 评分量表 | 60 分 | **80 分**（历史原始分口径；v3 起改归一化百分制） |
| 同行对标 | ✗ | **✓** |
| 时代差距 | 2025 前 | 2024-2026 趋势（动态 SVG / Deploy 按钮 / LLM 元数据 / 视频 / SECURITY.md） |

---

## 1. 五条评估轴

任何 README 都可沿五条轴评估。v1 三轴已不够，因为 2025+ 出现两个新维度：**AI 轴**（机器可读性）和**包容轴**（多语言 / 无障碍 / 包容性语言）。

| 轴 | 问的问题 | 核心矛盾 |
|---|---|---|
| **结构轴** | 读者打开后的阅读顺序对吗？层级对吗？ | 完整 vs 易扫 — 把细节放在哪一层 |
| **内容轴** | 价值主张清不清楚？证据链完不完整？ | 营销 vs 真实 — 让谁相信你 |
| **视觉轴** | 首屏能不能抓住人？节奏对吗？ | 信息密度 vs 美感 — 在哪里"喘气" |
| **AI 轴**（v2 新增） | LLM / Agent 能正确理解吗？能被检索/引用吗？ | 人读 vs 机读 — 自然语言 vs 结构化元数据 |
| **包容轴**（v2 新增） | 海外用户能用吗？屏读用户能听吗？少数群体能被代表吗？ | 本国 vs 国际 / 健视 vs 视障 / 默认指代 vs 多元 |

19 条铁律分布在这五条轴上，每条都在解决一个具体矛盾。

---

## 2. 19 条铁律（按重要性；锚点定义见 rules.yaml）

### T1 视觉锤 · 首屏决定一切（视觉轴 · **最重要**）

> **违反这一条，其他 15 条都白搭。**

- **做法**：首屏必须有**中央 logo + tagline + 1 张 hero 视觉**
- **视觉类型**：产品截图 / GIF / 短视频 / SVG 架构图 / 终端截图 / 数据看板 / **动态 SVG banner**（v2 新增）
- **进阶**：浅色/深色双 logo（用 `<picture>` + `prefers-color-scheme`）
- **反面教材**：一个真实项目只有 54 行 0 图 — 没人知道这是什么

**v2 进阶**：动态 SVG banner 是 2025-2026 的新趋势。`gofiber/fiber`、`brenocq/implot3d` 用 GitHub Actions 自动生成 star history / discussion count SVG，banner 实时更新。

**为什么最重要**：GitHub 仓库卡片只显示首屏 + 一句话描述。首屏没有视觉 = 在 GitHub Explore / 搜索结果 / 外部引用中**完全没有辨识度**。

---

### T2 三秒价值主张（内容轴 · 第二重要）

> **T1 抓眼球，T2 抓脑子。**

- **做法**：1 句话讲"解决什么问题、给谁用"。第二句话讲"为什么选你不选别人"。
- **公式**：`[做什么] + [给谁] + [独特优势]`
- **反面教材**：`VoiceType` 说"macOS 原生语音听写应用" — 讲了做什么，没讲独特优势。

**好的范例**：
- `knowledge-base-app`: "AI Native 知识生产线 — 把碎片信息炼成体系化知识库"
- `whisper-desktop`: "Speech-to-text and AI text processing for macOS ... Your voice data stays on your Mac with local models - or use cloud APIs for faster processing."
- `fastapi`: "FastAPI framework, high performance, easy to learn, fast to code, ready for production"

---

### T3 Badge 矩阵 · 建立可信度（内容轴）

- **做法**：4-7 个 badge，必须包含：CI 状态 / 版本 / 许可证 / 下载量 / 社区入口 / **Security**（v2 新增）
- **位置**：紧跟 logo 下方，与 hero 图同一屏
- **来源**：[shields.io](https://shields.io) 标准化
- **反面教材**：badge 太多（>10 个反而失焦），或没有 badge（看起来像私人玩具）

**v2 标准组合**（按优先级）：
1. CI/CD（build status）— 质量与维护活跃度信号
2. 版本（PyPI / npm / GitHub release）— 可用性信号
3. 许可证 — 合规信号
4. 下载量 / Star — 规模信号
5. Security（v2 新增）— Dependabot / Code scanning / Secret scanning
6. 文档链接 — 可深入信号

---

### T4 安装多路齐发（结构轴 · 第二屏）

> **不要假设你的用户只用一个平台。**

- **5 路**：macOS / Linux / Windows / Docker / 从源码
- **每路**：单行命令（curl / brew / choco / winget / scoop）
- **格式**：
  ```markdown
  ### macOS
  ```bash
  brew install yourname/tap/yourproject
  ```
  ### Linux
  ```bash
  curl -fsSL https://your.sh | sh
  ```
  ...
  ```
- **反面教材**：`VoiceType` 没有安装步骤 — 只能猜。
- **范例**：`deno` 给了 6 种安装方式（Shell/PowerShell/brew/choco/winget/scoop）。

---

### T5 30 秒试用 + 60 秒 Quickstart（结构轴 · **v2 升级**）

> **v1 只有 60 秒 Quickstart，v2 加 30 秒试用按钮作为"零部署入口"。**

- **30 秒试用按钮（v2 新增）**：顶部加 "Deploy to Netlify / Vercel / Cloudflare" 或 "Open in Gitpod / Codespaces" 按钮。
- **60 秒 Quickstart**：从零到 demo ≤ 60 秒。给出 3-5 个编号步骤，每步可复制。
- **配图**：必须有真实终端输出截图（不是示意图）
- **反面教材**：`VoiceType` 没有 Quickstart — 用户装完后不知道第一步做什么。

**fastapi 范例**：
```
1. uv add "fastapi[standard]"
2. Create main.py (show 10 lines)
3. Run: uv run fastapi dev
4. Open http://127.0.0.1:8000/docs
5. See screenshot of Swagger UI
```

**v2 新趋势**：`postfiot/posthog`、`refinedev/refine`、`gofiber/fiber` 全部在 README 顶部加 Deploy 按钮。

---

### T6 视觉矩阵（视觉轴 · **v2 升级**）

> **v1 是截图三列（3 张静态图），v2 是视觉矩阵（3 截图 + 1 视频）。**

- **做法**：
  - **3 张截图一组**，`<a><img></a>` 包裹（点击放大），`width=270`，带 alt
  - **1 段视频**（≤ 60 秒，无音频，带字幕更好），放在截图三列后
- **位置**：放在 Features 章节上方
- **反面教材**：单独放 1 张大图（不够丰富）或 8 张散落（没有节奏）

**whisper-desktop 静态范例**：
```html
<p align="center">
  <a href=".github/screenshots/home.png"><img src=".github/screenshots/home.png" width="270" alt="Home Dashboard"></a>
  <a href=".github/screenshots/recording.png"><img src=".github/screenshots/recording.png" width="270" alt="Recording & Hotkeys"></a>
  <a href=".github/screenshots/prompts.png"><img src=".github/screenshots/prompts.png" width="270" alt="Custom Prompts"></a>
</p>
```

**v2 视频范例**：
```html
<p align="center">
  <a href="https://youtube.com/watch?v=xxx"><img src="assets/video-thumb.png" width="800" alt="Demo video (60s)"></a>
</p>
```

**v2 新趋势**：`lobehub/lobe-chat`、`Clean-Coder-AI` 等 2024-2026 项目普遍嵌入 30-60 秒演示视频；`vhs` / `ttygif` 让终端 GIF 制作零门槛。

---

### T7 卖点编号清单（内容轴）

- **做法**：4-6 条编号，每条 `粗体关键词 + 一行量化收益`
- **格式**：
  ```markdown
  - **Fast**: 性能对标 NodeJS/Go（基于 Starlette + Pydantic）。[One of the fastest Python frameworks](#performance)。
  - **Fast to code**: 开发速度提升 200%-300%。*
  - **Fewer bugs**: 减少 40% 人为错误。*
  ```
- **数量**：4-6 条最佳。少于 3 条显单薄，多于 8 条没人看
- **反面教材**：`ScreenCast` 用 emoji bullet 堆 28 个特性 — 信息密度太高反而抓不住重点

**fastapi 7 keys 模式**是最经典的范本。

---

### T8 Feature 分组 + Ecosystem（视觉轴 · **v2 升级**）

> **v1 只解决"单项目内功能分组"，v2 还要解决"项目在生态中的位置"。**

- **T8a 单项目分组**：按维度分组（核心 / 平台 / 扩展 / 安全），每组一个二级标题
- **T8b Ecosystem（v2 新增）**：多模块项目加兄弟项目 / SDK / 工具列表
- **格式**：emoji + 粗体词 + 一句话描述

**T8a 范例 — whisper-desktop**：
```
### Transcription
- **Nine engines** - WhisperKit、Parakeet、Granite Speech、Qwen3 ASR、Voxtral、Groq、OpenAI Whisper 等
### Dictation
- **System-wide** - 推送/切换/混合模式，全局快捷键，自动粘贴
### AI Processing
- **Custom prompts** - 处理转录或任意文本。8 个内置预设
```

**T8b 范例 — lobe-chat**：列出 12 个子模块（chat / lobe-ui / database 等）独立入口链接。

---

### T9 架构图（内容轴 · 复杂项目必须）

- **做法**：1 张图说清"组件 + 关系 + 数据流"
- **工具**：Mermaid（最易维护）/ SVG / 外部 draw.io 导出
- **反面教材**：用文字描述 5 个组件的关系 — 没人看

**FlowOps 范例**：用 mermaid 画"三层两模块"架构，彩色 classDef 让模块边界清晰。

---

### T10 对照表（内容轴 · 体现差异）

- **做法**：和同类项目 / 平台 / 语言的对比
- **三种用法**：
  1. **同类对比**："为什么选我们不选 X" — 风险大，要有理有据
  2. **平台支持**：用 table 列操作系统 × 版本
  3. **多语言支持**：用 table 列语言 × 客户端（supabase 的 8×6 矩阵是范本）

**tauri 范例**：
```
| Platform   | Versions                                |
| Windows    | 7 and above                             |
| macOS      | 10.15 and above                         |
| Linux      | webkit2gtk 4.1 (Ubuntu 22.04+)          |
```

---

### T11 引用 / 背书（内容轴 · 信任放大）

- **三种形式**：
  1. **企业 logo 墙** — Sponsors / Used by
  2. **用户 quote** — "We adopted FastAPI for..." — Microsoft / Uber / Netflix
  3. **学术引用** — BibTeX 格式（transformers 用了，`pip install` 就能 cite）

- **反面教材**：用假数据 / 编造 quote — 行业都看得到，会被识破
- **v2 新增反虚假约束**：每条 quote 必须可溯源（链接到原始页面）；logo 必须经官方授权

---

### T12 收尾五件套（结构轴 · **v2 升级**）

> **v1 是 License + Contributing + Sponsors 三件套；v2 升级为五件套。**

- **必含**：
  1. **License** — 一句话 + 链接
  2. **Contributing** — 链接到 CONTRIBUTING.md
  3. **Code of Conduct**（v2 新增）— 链接到 Contributor Covenant
  4. **SECURITY.md**（v2 新增）— 漏洞披露流程（GitHub Docs 官方推荐）
  5. **Sponsors / Acknowledgements** — 谁资助了 / 致谢

- **可选**：
  - Roadmap（checkbox 形式，让社区看到方向）
  - Citation（学术项目）
  - Related Projects / See Also
  - **Community Stats**（v2 新增）— Star History SVG + Contributor 头像列表

**反面教材**：`iris` 把 21 国国旗 logo 列阵 + 19 个 supporter 头像墙 — 喧宾夺主。

---

### T13 i18n 规范（包容轴 · **v2 新增**）

> **standard-readme 在 2017 就规定了 BCP 47 命名规则，readme-craft 直到 v2 才纳入。**

- **做法**：
  - `README.md` 必须是英文（GitHub 搜索默认匹配）
  - 多语言版本用 `README.<BCP47>.md`，例如 `README.zh.md` / `README.ja.md` / `README.de.md`
  - 不强制全语言覆盖，但必须明确**支持策略**（"English + Chinese 暂支持，其他欢迎 PR"）
- **反面教材**：33 国国旗 logo 链接全部塞进 README — 翻译维护地狱；首页被国旗淹没
- **v2 修正 A6 反模式**：A6 "翻译列阵"的具体解药从"放 3-5 国"升级为"T13 i18n 规范 + 目录分流"

**gofiber/fiber 范例**：17 种语言，每种独立 README，顶部加语言切换徽章。

---

### T14 包容性语言（包容轴 · **v2 新增**）

> **Write the Docs 文档学者社区在 2024+ 把"减少偏见"独立成章；开源协作的伦理基础。**

- **做法**：
  - **they 单数**：避免 "he" or "she" 默认指代，用 "they" 单数
  - **多元人名**：示例人名覆盖多种文化背景（不只是"John Smith"）
  - **去性别默认**：避免 "manpower" → "workforce" / "chairman" → "chair"
  - **第二人称口语化**：用 "you" 而非 "the user"（更具亲和力也更包容）
- **反面教材**：示例代码里所有用户名都是"John Smith"或"Zhang San"
- **v2 修正**：让 T7 卖点编号 / T8 Feature 分组 / T12 致谢等所有"示例文本"都过语言包容检查

---

### T15 LLM 友好元数据（AI 轴）

> **2024+ 起 LLM / Agent 大量阅读 README；zero-shot 检索 / 引用 / 生成任务都依赖 README 的结构与可选元数据。**
> **D-4 冻结决策（v3）**：不强制在 README 顶部放 YAML frontmatter——GitHub 渲染不隐藏 frontmatter，会损害 T1 首屏。LLM 友好以**语义标题 + 代码块**为主，结构化元数据（frontmatter 或独立 `llms.txt`）为可选增强。

- **优先做法**（无成本、无副作用）：
  - 关键章节用**语义标题**（避免 "Section 1" 而用 "Installation" / "Quickstart"）
  - 命令行示例用代码块（不是截图）
- **可选增强**：结构化元数据，二选一——
  - 独立 `llms.txt`（不影响渲染，推荐）
  - YAML frontmatter（若使用，注意 GitHub 会在标题上方渲染出可见内容，先确认对 T1 首屏的影响；frontmatter 必须是合法 YAML，否则 GitHub 直接报 `Error in user YAML`）：

  ```markdown
  ---
  name: your-project
  description: 一句话讲清楚做什么 + 给谁用
  capabilities:
    - install
    - quickstart
    - deploy
    - troubleshoot
  tags:
    - cli
    - rust
    - web-framework
  ---
  ```

- **反面教材**：README 全部是 PNG 截图 — LLM 看不到，只能 OCR，丢信息
- **趋势**：awesome-ai-devtools 自动从结构化元数据生成 README；MCP server 元数据正成为新标准

---

### T16 无障碍 a11y（包容轴 · **v2 新增**）

> **Write the Docs 把 a11y 独立成章；GitHub 在 README 渲染层加 a11y 检查。**

- **做法**：
  - **所有图像 alt 描述具体内容**（不是 "screenshot" 而是 "Dashboard with three columns: tasks, calendar, settings"）
  - **表格必须带 header 行**（屏读器才能识别行列关系）
  - **不依赖颜色单一传达信息**（错误用红色 + 图标，不只红色）
  - **命令行示例配 alt**（`alt="Terminal showing successful installation: YourProject v1.0 installed"`）
  - **避免全大写 / 超长行 / 低对比度配色**
- **反面教材**：截图 alt 全是 "image" / "img" / "screenshot"；表格只有数据行没有 header
- **v2 新趋势**：awesome-readme 2024+ 多个项目加了 `aria-label` / `alt text` / `contrast` 检查

---

### T17 默认语言策略（内容轴 · **v2.1 新增**）

> **standard-readme 在 2017 规定 `README.md` 默认英文（GitHub 搜索匹配默认）。但中文项目应该让中文用户打开看到中文。**

- **做法**：
  - **判断读者群体**：
    - 中文用户为主（如国内个人/团队项目）→ `README.md` = 中文，`README.en.md` = 英文
    - 海外用户为主 → `README.md` = 英文，`README.zh.md` = 中文
    - 双语用户都有 → 默认语言 = 优先群体，另一种放 `<lang>.md`
  - **判断流程**：
    1. 项目作者日常用什么语言思考？
    2. Issues / Discussions / Discord 主要讨论语言？
    3. 团队成员母语分布？
  - **不要做**：堆 33 国国旗墙（A6 反模式）
  - **不要做**：i18n 链接散落全文（应该顶部一处集中切换）

- **反面教材（v2.1 新发现）**：
  - 实际**项目是中文**但 README.md 是英文 → 中文用户打开 GitHub 仓库看到全英文，第一印象不对
  - 反过来也成立：英文项目用中文 README → 海外用户看不懂

- **v2.1 教训来源**：readme-craft 自身 v2 改造时，21 个兄弟项目都按 `README.md` 英文 + `README.zh.md` 中文处理，**但用户实际工作语言是中文**，导致默认看到英文版本，需要全部翻转为中文为主。

- **示例**：
  - 国内开源工具 → `README.md` 中文 + `README.en.md` 英文
  - 中国出海 SaaS → `README.md` 英文 + `README.zh.md` 中文（匹配 GitHub 搜索）
  - 中文方法论文档 → `README.md` 中文（无需英文版）

---

### T18 截图自动化（视觉轴 · **v2.2 新增**）

> **README 引用的截图必须由自动化脚本产生，禁止人工维护——这是 v0.5.1 教训。**

- **为什么是 v2.2 新增铁律**：
  - retro-arcade v0.5.0 真实界面（果园竞技场 + 12 条带天赋小蛇）与 README 引用的旧截图（v0.4.x 圆球蛇）差异巨大
  - 用户手动指出"界面差距太大"，但旧截图已经 push 到 GitHub 仓库
  - 即使本地更新了截图，下次代码改了又会过时
  - **唯一解药：截图脚本自动化**

- **做法**：
  - **CLI 工具**：vhs（终端 GIF/MP4）+ terminalizer
  - **Web 应用**：Playwright / Puppeteer / Cypress（headless Chromium）
  - **桌面应用**：Playwright（macOS）+ Appium（Windows）
  - **GitHub Action**：`.github/workflows/screenshot.yml`
    ```yaml
    on:
      push:
        paths: [源代码路径]
      schedule:
        - cron: '0 0 * * *' # 每天 0 点
      workflow_dispatch:
    ```
  - **触发机制**：
    1. 代码 push 触发（开发改完代码立即更新截图）
    2. 定时触发（每天 0 点兜底，防止遗漏）
    3. 手动触发（workflow_dispatch，紧急情况下用）

- **自动化要求**：
  - 截图必须由脚本产生，**禁止人工 update**
  - 截图文件名语义化（`retro-arcade-playing.png` 而非 `img_20260921.png`）
  - 截图分辨率固定（桌面 1280×800 / 移动 390×844）
  - 截图覆盖 README 截图矩阵的全部场景

- **反面教材**：
  - 截图是手动截的（如 `Screenshot 2026-09-21 上午10.09.18.png`）
  - 截图文件名带日期（每次更新都要重命名）
  - 截图和代码不同步（README 里截图是 v0.4.x，实际界面是 v0.5.0）
  - CI 里没有截图自动化 workflow

- **v2.2 教训来源**：
  - retro-arcade v0.5.0 上线后，用户手动指出 README 截图严重过时
  - 修复方案：Playwright + GitHub Action 自动化（v0.5.1 commit `c783360`）
  - 推广到 readme-craft 所有方法论项目：**每个项目都必须有自动化截图脚本**

- **实施方案**：
  - ✅ retro-arcade v0.5.1 已落地（`scripts/screenshot.js` + `.github/workflows/screenshot.yml`）
  - ⏳ readme-craft 自身 banner.svg（暂用手画 SVG，可升级为 Playwright 自动化）
  - ⏳ 21 个兄弟项目：每个项目都需要截图脚本（v3 计划批量落地）

- **示例**（retro-arcade 实际代码片段）：
  ```javascript
  // scripts/screenshot.js
  const SCREENSHOT_CONFIG = [
    { name: 'retro-arcade-snake-select-latest.png', viewport: { width: 1280, height: 800 } },
    { name: 'retro-arcade-mobile-select.png', viewport: { width: 390, height: 844 } },
    // ... 更多场景
  ];
  ```

---

### T19 CI 可复现与可诊断（结构轴 · v2.3 新增，**v2.3.1 修订**）

> **README 项目配套的 CI 必须可复现、可诊断——失败时能明确指出缺什么，而不是靠放宽安装换绿灯。**

- **为什么 v2.3.1 重写**：
  - v2.3 版本条把「`npm ci`→`npm install`、移除 cache」当作解药，实际是**牺牲依赖可复现性换 CI 变绿**，方向错误
  - 13 个兄弟项目 CI 报错的根因是「`.gitignore` 排除 lockfile + `cache: 'npm'` 强依赖 lockfile」——正确修复是提交 lockfile，而不是绕开它

- **5 条铁则（v2.3.1 修订版）**：
  1. **lockfile 必须入库**：`package-lock.json` / `pnpm-lock.yaml` / `yarn.lock` 提交进仓库，不从 `.gitignore` 排除
  2. **CI 用 frozen install**：`npm ci` / `pnpm install --frozen-lockfile` / `yarn --frozen-lockfile`；lockfile 缺失时 CI 明确报错是**期望行为**，不是要修的 bug
  3. **cache 绑定 lockfile**：`actions/setup-node` 的 `cache` 依赖 lockfile 存在；要么「lockfile 入库 + 开 cache」，要么两者都不用
  4. **运行时与包管理器版本固定**：`package.json` 用 `packageManager` 字段固定包管理器精确版本；Node 版本用 `.nvmrc` 或 workflow 显式固定
  5. **README 链接检查进 CI + 报错可诊断**：README 引用的相对链接与双语文件（如 `README.en.md`）存在性检查进 CI；失败信息必须指明缺失文件与修复路径

- **反面教材**（v3 批量落地时的真实事故，v2.3.1 修正了结论）：
  - **13 个项目同时报 lockfile 缺失**：根因是 `.gitignore` 排除 lockfile 却开启 `cache: 'npm'` → 正确修复 = 提交 lockfile
  - **双语翻转后链接失效**：v2.1 双语策略翻转后 README 仍引用已删除的 `README.zh.md` → 正确修复 = 更新引用，并让链接检查拦住这类错误
  - **pnpm / corepack 兼容问题**：正确修复 = `packageManager` 字段固定版本（而非永久回避 corepack）

- **CI 检查表**：
  - [ ] lockfile 在仓库内（不在 `.gitignore`）
  - [ ] CI 用 frozen install（`npm ci` / `pnpm install --frozen-lockfile`）
  - [ ] 若用 `cache:`，lockfile 必须已入库
  - [ ] `packageManager` 固定包管理器版本；Node 版本固定
  - [ ] README 相对链接 / 双语文件存在性检查在 CI 中
  - [ ] 失败信息可诊断（指明缺失文件与修复动作）

- **教训来源**：v3 T18 截图自动化批量落地 16 个项目后，13 个 CI 集中报错；逐个修复发现本质同类（lockfile 处理 + README 链接），遂升级为铁律 + 反模式。

- **AI Agent 集成规则**：任何 Agent 帮你写 GitHub Action 前，必须先读本条 + 过一遍检查表；新 workflow 若靠「放宽安装」让 CI 变绿，视为违反本铁律。

---

## 3. 13 条反模式（必须避免 · v2.3）

| # | 反模式 | 症状 | 危害 | 解药 |
|---|---|---|---|---|
| **A1** | 零视觉 | 没有 hero 图、没有任何截图 | 首屏无辨识度，GitHub Explore 完全错过 | T1 hero + T6 视觉矩阵 |
| **A2** | 内部 jargon 主导 | proxy 配美杜莎、内部 API 链接、配置细节 | 外部用户完全看不懂 | T2 价值主张前置 + 内部链接另起 § |
| **A3** | Checklist 堆砌 | "✅ 完成了 P0 ✅ 完成了 P1" — 全是 ✅ | 看着像 PR 列表，不是 README | T7 卖点编号清单，把"做了什么"翻译成"能得到什么" |
| **A4** | 安装埋在第 5 屏 | 500 行后才出现安装命令 | 用户已经走了 | T4 安装多路齐发提到第二屏 |
| **A5** | 没 demo 截图 | 只说"运行如下"但不截图 | 用户不信 | T6 视觉矩阵 + Quickstart 配真实输出 |
| **A6** | 翻译列阵 | 33 国国旗 logo 链接全部塞进 README | 翻译维护地狱；首页被国旗淹没 | T13 i18n 规范：BCP 47 命名 + i18n 目录分流 |
| **A7** | 没"为什么用我" | 只讲 features，不讲对比 | 用户不知道差异化 | T10 对照表 |
| **A8** | 没版本/状态 | 不知道当前是 alpha 还是 stable | 用户不知道敢不敢用 | T3 badge + What's New 章节 |
| **A9**（v2 新增） | 零 i18n 但有海外用户 | README 全英文但 Discord / Issues 大量非英语 | 海外用户放弃使用 | T13 i18n 策略 + 至少一个 i18n README 文件 |
| **A10**（v2 新增） | emoji 满屏无实质 | 标题全是 🎉🚀💡🔥 但内容是空话 | 信息密度低，像营销文案不像工程文档 | T7 卖点编号：每条 emoji 必须配"关键词 + 量化收益" |
| **A11**（v2.1 新增） | 默认语言错位 | 中文项目用英文 README / 英文项目用中文 README | 用户第一眼看到非母语内容直接关闭 | T17 默认语言策略：按用户群体反推 |
| **A12**（v2.2 新增） | 截图手工维护 | 截图是手动截图，文件名带日期，代码改了 README 不变 | README 永远过时，图文不符 | T18 截图自动化：Playwright + GitHub Action |
| **A13**（v2.3 新增） | CI 不可复现 | `.gitignore` 排除 lockfile 却开 cache、CI 绕开 frozen install、双语 README 引用已删除文件、包管理器版本漂移 | CI 集中报错且无法定位根因 | T19 CI 可复现与可诊断：lockfile 入库 + frozen install + 版本固定 + 链接检查 |

---

## 4. 评分锚点与归一化口径（v3）

v3 起，评分以仓库 `rules.yaml` 为唯一事实源：每条铁律按 0-5 六档锚点打分（逐条锚点定义见 `rules.yaml` 与 `checklist.md` 生成评分表）；不适用项计 N/A 并从适用满分中扣除；无法核验的项单独计数，未核验项清零前不输出总分。对外展示**归一化百分制 + 适用项数 + 未核验项数**（v2.3.1 的 95 分原始量表为历史口径，见文末版本演进）。

各轴铁律构成（每条满分 5 分）：

### 结构轴（20 分）
- T4 安装多路齐发（5 分）
- T5 30 秒试用 + 60 秒 Quickstart（5 分）
- T12 收尾五件套（5 分）
- **T19 CI 可复现与可诊断（5 分，v2.3 新增）**

### 内容轴（35 分）
- T2 三秒价值主张（5 分）
- T3 Badge 矩阵（5 分）
- T7 卖点编号（5 分）
- T9 架构图（5 分）
- T10 对照表（5 分）
- T11 引用背书（5 分）
- T17 默认语言策略（5 分，v2.1 新增）

### 视觉轴（20 分）
- T1 视觉锤（5 分）
- T6 视觉矩阵（5 分）
- T8 Feature 分组 + Ecosystem（5 分）
- T18 截图自动化（5 分，v2.2 新增）

### 包容轴（15 分）
- T13 i18n 规范（5 分，v2 新增）
- T14 包容性语言（5 分，v2 新增）
- T16 无障碍 a11y（5 分，v2 新增）

### AI 轴（5 分）
- T15 LLM 友好元数据（5 分，v2 新增）

**分数解释**：v3 起不再使用「80-95 上 Trending」式原始分评级；发版建议以归一化百分制为准，见 `checklist.md` 的「发版建议（归一化百分制）」表。评级只看缺口分布，不构成任何分数承诺。

**典型案例评分**（v2.1 85 分制下的历史评测；v2.3 起 95 分制，数值不可直接比较，仅作历史参考）：
- `whisper-desktop`：64/85
- `fastapi`：76/85
- `knowledge-base-app`：60/85（v2.1 新增 T17 默认中文 +5 → 65/85）
- `iris`：48/85
- `VoiceType`：22/85
- `bare-minimum`：14/85
- `config-manager`：50/85

---

## 5. 同行对标

> **readme-craft 是唯一把"方法论 + 反模式 + 量化评分 + AI Skill + 真实案例 + AI 时代适配"做成完整闭环的 README 项目。**

| 项目 | 类型 | 方法论 | 反模式 | 评分 | AI Skill | i18n | a11y | LLM |
|---|---|---|---|---|---|---|---|---|
| **readme-craft v3.0.0-alpha.0** | 方法论+Skill | 19 铁律 | 13 条 | 95 分（v3 起归一化） | ✓ craft-readme | ✓ T13 | ✓ T16 | ✓ T15 |
| readme.so | 在线编辑器 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| readme-md-generator | CLI 工具 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| standard-readme | 规范 | section 列表 | ✗ | ✗ | ✗ | ✓ BCP 47 | ✗ | ✗ |
| common-readme | 早期规范 | 5 段模板 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Art of README | 长文 | 散文 | "Things NOT" | ✗ | ✗ | ✗ | ✗ | ✗ |
| awesome-readme | 范例库 | 100+ 案例 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| makeareadme | 教程+编辑器 | 段落式 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| opensource.guide | 权威指南 | 4 黄金问题 | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| Write the Docs | 文档学 | a11y / 去偏见 | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| Zalando | 企业模板 | 合规章节 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

**关键洞察**：
1. **方法论赛道 readme-craft 是真正完整的** — 其他项目覆盖维度都不超过 2-3 个
2. **standard-readme 在 i18n 上领先** — readme-craft 已纳入
3. **Write the Docs 在 a11y / 包容性语言上领先** — readme-craft 已纳入
4. **没有任何竞品覆盖 AI / LLM 友好维度** — readme-craft 首创 T15

---

## 6. 工作流（从 0 到归一化高分）

```
1. 收集素材（30 分钟）
   - 项目源码、依赖、配置
   - 现有截图（如有）
   - 一句话讲清楚"做什么"
   - 列出至少 5 个核心卖点 + 至少 1 张截图

2. 选模板（5 分钟）
   - 看 METHODS 表选最匹配的 1 套（v2 新增"按包容性需求选模板"）
   - 不要混搭

3. 填模板（60 分钟）
   - 把 T1-T16 逐条填入对应章节
   - 缺素材的部分标注 [TODO: ...]
   - v2 新增：填完后用 LLM 测试一遍 README（chat 提问 5 个常见问题，看答案是否准确）

4. 自检（10 分钟）
   - 用 checklist 走一遍（v3 为 19 项）
   - 按 v3 归一化口径打一次分（未核验项单独列出，不猜总分）
   - v2 新增：用 axe-core / pa11y 等工具做 a11y 检查
   - v2 新增：读一遍检查是否使用包容性语言

5. 发布
   - 发版阈值按 checklist.md「发版建议（归一化百分制）」执行（0.x 标 Beta、1.0 正式版等）
   - v2.3 的 95 分制阈值为历史口径，不再使用
```

---

## 7. 适用边界

| 项目类型 | 推荐模板 | 重点铁律 | v2 新增考虑 |
|---|---|---|---|
| CLI 工具 | minimal + standard | T4 安装 / T5 Quickstart / T9 架构 | T16 a11y 终端示例 alt |
| GUI 桌面应用 | rich | T1 hero / T6 视觉矩阵 / T8a 分组 | T15 LLM 元数据 + T16 a11y |
| Web 框架/库 | standard + rich | T7 卖点 / T9 架构 / T10 对照 | T13 i18n（框架级多语言） |
| 后端服务 | standard | T4 / T5 / T11 | T15 LLM 元数据 + SECURITY.md |
| AI/ML 项目 | rich + academic elements | T7 量化收益 / T8 多模型分组 / T11 学术引用 | T15 LLM 元数据 + Citation |
| 中文知识库/方法论 | cn-academic | T8 emoji 分组 / T9 架构图 / T12 Roadmap | T13 i18n（中文 + 英文） |
| 个人小工具 | minimal | T1 + T2 + T3 即可 | T15 LLM 元数据 |

---

## 8. 进化路线

- **v1（2026-09-21）** — 12 铁律 + 8 反模式 + 4 模板 + craft-readme Skill + VoiceType 示例
- **v2 → v2.3（2026-09-21）** — 铁律 16→19（+i18n / 包容性 / LLM / a11y / 默认语言 / 截图自动化 / CI），反模式 10→13，量表 80→95
- **v2.3.1（2026-09-22）** — 治理修复：版本口径统一、T19 重写为「CI 可复现与可诊断」、治理文件齐备、案例诚实化、评分展示与营销数字解耦
- **v3.0（计划）** — `rules.yaml` 单一事实源 + `validate` / `generate` / `check` CLI + Skill 打包；对外评分改为归一化百分制 + N/A；alpha（核心）→ beta（Action + 截图示例）→ RC（本地 Web 评分页）。详见 [`docs/superpowers/plans/2026-09-22-optimization-master-plan.md`](docs/superpowers/plans/2026-09-22-optimization-master-plan.md)

---

<div align="center">
<sub>📜 写好 README = 把项目翻译成读者愿意扫 30 秒的语言。</sub>
<br>
<sub>🤖 现在还要翻译成——LLM 能理解和引用的元数据。</sub>
<br>
<sub>🌍 现在还要翻译成——海外用户 / 屏读用户 / 少数群体都能用的语言。</sub>
</div>