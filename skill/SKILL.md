---
name: craft-readme
description: 写一个图文并茂、符合 19 条铁律 + 13 条反模式 + v3 归一化评分口径的 README.md。当用户提到"写 README"、"项目说明文档"、"改造 README"或希望为新建项目生成 README 时调用。会先读取 METHODOLOGY.md，再收集项目素材，最后按选定模板产出。覆盖 i18n / LLM 友好 / 包容性语言 / 无障碍 a11y / 默认语言（T17）/ 截图自动化（T18）/ CI 可复现（T19）全部适配维度。
version: 3.0.0-alpha.0
license: MIT
---

# craft-readme Skill v3.0.0-alpha

> **目的**：让 Agent 严格按照 readme-craft 方法论产出高分 README。
>
> **v3.0.0-alpha**：规则与评分以仓库 `rules.yaml` 为唯一事实源（19 铁律 / 13 反模式 / 0-5 六档锚点）；包内 METHODOLOGY.md 评分章节与 checklist.md 评分表均为 v3 归一化口径（95 分仅作历史量表标注），散文规则引用由 `pnpm readme-craft validate` 与 rules.yaml 强制对齐。

---

## 何时调用

满足以下任一条件时触发：

1. 用户说："帮我写 README"、"给这个项目生成 README"、"项目说明文档"
2. 用户说："改造 README"、"升级 README"、"README 重写"
3. 用户新建项目 / 新建工具 / 新建库，要求生成对应 README
4. 用户明确点名使用本 Skill（如"用 craft-readme 写 README"，或在提示词中引用本 SKILL.md）

**不调用**：

- 用户只想修复 README 中的某个 typo（用普通编辑能力即可）
- 用户在写非 README 的文档（CHANGELOG / CONTRIBUTING / API doc）
- 用户在审查别人的 README（用 code-review skill）

---

## 输入契约

调用 Skill 时，Agent 需要从用户或环境中获取以下信息：

| 字段 | 必填 | 来源 |
|---|---|---|
| **项目路径** | 必填 | 用户指定，或当前 working dir |
| **目标模板** | 推荐 | `minimal` / `standard` / `rich` / `cn-academic`，默认 `standard` |
| **语言** | 可选 | `zh` / `en` / `both`，默认跟随项目 |
| **i18n 策略** | v2 新增 | `mono`（仅英文） / `dual`（中英） / `multi`（多语言） |
| **目标读者** | 推荐 | 用户画像（一句话） |
| **现截图** | 可选 | 路径列表（如 `.github/screenshots/*.png`） |
| **Logo / 品牌色** | 可选 | emoji 或 SVG 路径 |
| **海外用户占比** | v2 新增 | `none` / `<10%` / `10-50%` / `>50%`，影响 i18n 决策 |

如果必填信息不全，**Agent 主动问 5-7 个问题**补齐，不要假装知道。

---

## 工作流（Agent 必须按顺序执行）

### Step 1 · 加载方法论

```bash
# 读取 Skill 包内的核心方法论（与 SKILL.md 同目录；仓库包视图与平铺安装包均为 ./ 布局）
cat ./METHODOLOGY.md
# 重点读：5 条评估轴 + 19 条铁律 + 13 条反模式 + v3 归一化评分口径 + 同行对标
```

**为什么先读方法论**：避免 Skill 退化成"模板生成器"。Skill 的灵魂是 19 条铁律和 13 条反模式，不是某个具体模板。

### Step 2 · 探查项目（自动）

```bash
ls -la <project_path>
cat <project_path>/pyproject.toml 2>/dev/null || cat <project_path>/package.json 2>/dev/null || cat <project_path>/Cargo.toml 2>/dev/null
cat <project_path>/README.md 2>/dev/null  # 如果有旧版，先评估
find <project_path> -maxdepth 2 -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.svg" -o -name "*.mp4" \) | head -20
# v2 新增：检查国际化痕迹
grep -r "README\.[a-z][a-z]\.md" <project_path> 2>/dev/null
# v2 新增：检查现有 badge
grep -E "img.shields.io|badge" <project_path>/README.md 2>/dev/null | head -10
```

**收集信息**：
- 项目名 / 一句话描述（看 README 或源码注释）
- 主要依赖（识别技术栈）
- 入口命令（看 setup.py / package.json / Cargo.toml）
- 现截图（看 .github/screenshots / docs/assets / 类似路径）
- 是否有 CONTRIBUTING / LICENSE / CODE_OF_CONDUCT / SECURITY
- **v2 新增**：海外用户占比（从 Discord / Issues / Star 来源判断）
- **v2 新增**：是否已有 i18n README

### Step 3 · 选模板 + 选 i18n 策略（v2 升级）

按 [`METHODOLOGY.md` §7 适用边界](./METHODOLOGY.md#7-适用边界) 决策：

```
项目类型 → 模板：
CLI 工具 / 小工具      → minimal 或 standard
GUI 桌面 / Web 应用    → rich
后端服务 / 框架        → standard
AI/ML 项目             → rich + 学术元素
中文知识库 / 方法论     → cn-academic
```

**语言策略双步决策（T13 + T17）**：

```
第 1 步 · 按 T17 定默认语言（看用户群体，不看惯例）：
   主要用户是中文群体（国内个人/团队项目） → README.md = 中文
   海外用户为主                            → README.md = 英文
判断依据：作者工作语言 / Issues 与社区讨论语言 / 团队母语分布

第 2 步 · 按海外用户占比定语言集合：
   none / <10%   → mono（仅默认语言）
   10-50%        → dual（另一语言放 README.en.md / README.zh.md，BCP 47 命名）
   >50%          → multi（鼓励 PR 新增 README.<BCP47>.md）
```

**不确定时**：选 `standard` + `dual`（`README.md` 中文 + `README.en.md` 英文，最普适）。

### Step 4 · 缺失素材追问（必须 · v2 扩到 7 问）

读完项目后，向用户问 **5-7 个问题**，补齐关键决策：

```
v2 推荐问的 7 个问题（按优先级）：
1. 一句话讲清楚你的项目做什么、给谁用？[T2 价值主张]
2. 当前 stable 版本号是什么？许可证？[T3 badge]
3. 最推荐的安装/运行方式是什么？[T4 安装路径]
4. 有哪些截图/视频可以放到 README？[T6 视觉矩阵]
5. 谁在用 / 哪些场景？[T11 引用背书]
6. v2 新增：海外用户占比如何？[T13 i18n 策略]
7. v2 新增：项目有什么独特的技术亮点适合 LLM 引用？[T15 LLM 元数据]
```

**不要超过 7 个问题**（用户会烦）。如果素材充足可酌情减少。

### Step 5 · 套模板 + 填内容（v2 新增关键动作）

读取 [`templates/<chosen>.md`](./templates/)，把 Step 2 收集的信息填入对应章节。

**关键动作**：
- **T1 视觉锤**：如果用户没给 hero 图，**用 mermaid 画一张架构图**作为兜底；并提示用户后续替换
- **T3 Badge 矩阵**：用 shields.io 标准格式；v2 新增 **security badge**
- **T4 安装**：尽量给 5 路；至少有 macOS + Linux
- **T5 Quickstart**：v2 升级，**Web / GUI 项目顶部加 Deploy/试用按钮**
- **T6 视觉矩阵**：v2 升级，**复杂项目补 1 段视频**
- **T7 卖点**：必须 4-6 条；少于 4 条说明卖点没想清楚
- **T8 Feature 分组**：v2 升级，**多模块项目补 T8b Ecosystem**
- **T12 收尾五件套**：v2 升级，**补 Code of Conduct + SECURITY.md 链接**
- **T13 i18n**（强制）：根据 Step 3 双步策略生成对应 README.<lang>.md
- **T14 包容性语言**（强制）：检查示例人名 / 默认指代
- **T15 LLM 友好**（强制）：语义标题 + 代码块优先；结构化元数据（`llms.txt` 或 frontmatter）**可选**——若用 frontmatter，注意 GitHub 渲染不隐藏、且必须是合法 YAML（D-4 冻结决策：不强制顶部 frontmatter）
- **T16 a11y**（强制）：检查所有图像 alt / 表格 header
- **T17 默认语言**（强制）：默认语言按用户群体反推，不照搬「必须英文」惯例
- **T18 截图自动化**（v2.2）：提醒用户截图必须由脚本产生（Playwright / vhs + CI），禁止手工截图
- **T19 CI 可复现**（v2.3）：目标项目有 CI 时，检查 lockfile 入库 + frozen install + 版本固定，**不要**建议放宽安装换绿灯

### Step 6 · 自检（19 项）

读 [`checklist.md`](./checklist.md) 19 条，逐项检查并标注 ✅ / ⚠️ / ❌。

**v2 新增 3 道发版前检查**：

```
1. LLM 友好测试：
   在 ChatGPT / Claude 里问 5 个问题，看答案是否准确。
   如果 LLM 答不全，回到 T15 修。

2. a11y 工具扫描：
   npx pa11y https://github.com/your/repo#readme
   如果 alt 缺失 / 表格无 header，回到 T16 修。

3. 包容性语言查改：
   把 README 喂给 LLM，prompt："请指出不符合包容性语言的地方"
   回到 T14 修。
```

**自检输出格式**（v3 归一化百分制）：

```markdown
## ✅ 自检结果（craft-readme Skill v3.0.0-alpha · 归一化百分制）

<!-- BEGIN GENERATED:skill-checklist -->
| 铁律 | 轴 | 状态 | 备注 |
|---|---|---|---|
| T1 视觉锤 | 视觉 | ✅/⚠️/❌/N/A | |
| T2 三秒价值主张 | 内容 | ✅/⚠️/❌/N/A | |
| T3 Badge 矩阵 | 内容 | ✅/⚠️/❌/N/A | |
| T4 安装多路齐发 | 结构 | ✅/⚠️/❌/N/A | |
| T5 30 秒试用 + 60 秒 Quickstart | 结构 | ✅/⚠️/❌/N/A | |
| T6 视觉矩阵 | 视觉 | ✅/⚠️/❌/N/A | |
| T7 卖点编号清单 | 内容 | ✅/⚠️/❌/N/A | |
| T8 Feature 分组 + Ecosystem | 视觉 | ✅/⚠️/❌/N/A | |
| T9 架构图 | 内容 | ✅/⚠️/❌/N/A | |
| T10 对照表 | 内容 | ✅/⚠️/❌/N/A | |
| T11 引用 / 背书 | 内容 | ✅/⚠️/❌/N/A | |
| T12 收尾五件套 | 结构 | ✅/⚠️/❌/N/A | |
| T13 i18n 规范 | 包容 | ✅/⚠️/❌/N/A | |
| T14 包容性语言 | 包容 | ✅/⚠️/❌/N/A | |
| T15 LLM 友好元数据 | AI | ✅/⚠️/❌/N/A | |
| T16 无障碍 a11y | 包容 | ✅/⚠️/❌/N/A | |
| T17 默认语言策略 | 内容 | ✅/⚠️/❌/N/A | |
| T18 截图自动化 | 视觉 | ✅/⚠️/❌/N/A | |
| T19 CI 可复现与可诊断 | 结构 | ✅/⚠️/❌/N/A | |

**评分口径**：归一化百分制（得分 / 适用项满分 × 100）+ 适用项数 + 未核验项数；agent-reviewed 规则默认 unverified，不伪造分数。
<!-- END GENERATED:skill-checklist -->
```

### Step 7 · 输出（v2 新增 diff 摘要）

把生成的 README 写到 `<project_path>/README.md`（或用户指定路径）。
如果是 i18n 双语，再写 `README.<lang>.md`（v2 新增）。

如果是改造旧 README，输出 diff 摘要（v2 升级版）：

```markdown
## 改造说明（v3 归一化口径）

| 维度 | 旧版 | 新版 | 增量 |
|---|---|---|---|
| 铁律覆盖 | 8/19 | 19/19 | +11 |
| 反模式触发 | 4/13 | 0/13 | -4 |
| 评分 | 25/60（v1 量表） | 76/100（归一化） | 量表不同，仅作方向参考 |
| i18n | ✗ | ✓ dual（T17 中文默认） | 新增 |
| LLM 友好 | ✗ | ✓ | 新增 |
| a11y | ✗ | ✓ 部分 | 新增 |
```

---

## 输出契约

| 产物 | 路径 | 说明 |
|---|---|---|
| 新 README | `<project_path>/README.md` | 主要交付物 |
| **i18n 版本**（v2 新增） | `<project_path>/README.<lang>.md` | 视 Step 3 策略 |
| 自检结果 | 写在回复里 | 19 条逐项状态 + 归一化百分制评分（未核验项清零前不输出总分） |
| 评分 | 写在回复里 | 总分 + 评级 |
| 改造说明 | 写在回复里 | 如果是改造，列出主要 diff |

---

## 约束

### 硬约束（违反必须拒绝）

1. **不能产出 0 图 README**（除非用户明确说"只要文字版"）
2. **不能伪造引用** — 用户 quote 必须真实可验证
3. **不能产出含敏感信息的 README**（密钥、token、内部 IP）
4. **不能跳过自检** — 即使素材不全也要标注哪些 ⚠️/❌
5. **v2 新增**：i18n 项目必须生成对应 `README.<lang>.md`，不能只放国旗链接
6. **v2 新增**：所有图像必须有具体 alt 描述，不能是 "image" / "screenshot"

### 软约束（推荐遵守）

1. 优先 mermaid 而非外链 SVG（避免死链）
2. 优先 shields.io 而非手画 badge
3. 安装命令必须真实可跑（不允许 `pip install` 一笔带过，必须给具体包名）
4. 不要超过 33 国国旗链接（翻译泛滥）
5. **v2 新增**：优先双语策略（`dual`），不要直接 multi 让用户选择
6. LLM 友好优先语义标题与代码块；可选以 `llms.txt` 或（合法的）frontmatter 提供结构化元数据——不强制 README 顶部 frontmatter（D-4）

---

## 失败模式（v2 扩展）

| 场景 | 处理 |
|---|---|
| 用户说"随便写写" | 选 minimal 模板，3 段搞定 |
| 项目刚初始化无素材 | 强问 5-7 个关键问题，不假装知道 |
| 用户已有 README 要求改造 | 先评估打分（v3 归一化口径，未核验项单独列出），给出"哪些铁律违反 / 哪些保留"，再输出新版 |
| **v2 新增**：项目主要用户是海外 | i18n dual/multi 策略：默认英文 README + `README.zh.md`（BCP 47） |
| **v2 新增**：项目是 Web / SaaS 类 | 顶部加 Deploy 按钮（Netlify / Vercel / Cloudflare） |
| **v2 新增**：项目是 GUI 类 | 加 30-60 秒演示视频，无音频带字幕 |
| 跨语言项目（i18n） | 默认语言按 T17 反推（中文项目：README.md 中文 + README.en.md 英文）；命名遵循 T13 BCP 47；不要堆 33 国国旗 |
| 中文项目想走国际 | `README.md` 英文 + `README.zh.md` 中文（匹配 GitHub 搜索） |

---

## 关联资源

- [`METHODOLOGY.md`](./METHODOLOGY.md) — 19 条铁律详细定义（v3.0.0-alpha）
- [`checklist.md`](./checklist.md) — 自检清单 19 条（v3 归一化评分表）
- [`templates/`](./templates/) — 4 套模板
- [examples/](https://github.com/davyzhong/readme-craft/tree/main/examples) — before / after 案例对照（示例 fixture；不随 Skill 包分发，请在仓库内查看）

---

## 版本

- **v3.0.0-alpha.0（当前）**：`rules.yaml` 单一事实源落地，版本与 `rules.yaml` / `package.json` 三处一致（P9）；CLI（validate / generate / check / pack-skill / install-skill）按统一执行方案 M2 逐步交付
- **v2.3.1**：19 铁律 + 13 反模式 + 95 分历史量表 + i18n / a11y / LLM / 默认语言 / 截图自动化 / CI 可复现

---

<div align="center">
<sub>📜 一个好的 Skill 不是替你写 README，而是强迫你按 19 条铁律 + 13 条反模式审视每一段。</sub>
<br>
<sub>🤖 还要让它能被 LLM 读懂、被海外用户看懂、被屏读用户听清、被 CI 守住可复现。</sub>
</div>