# Template: Minimal v3（≤ 80 行）

<!-- @placeholders project_name=required tagline=required summary_sentence=required differentiator_sentence=required ci_badge_url=required version_badge_url=optional downloads_badge_url=optional install_command_macos=required install_command_linux=required sample_output=required -->

> **适用**：CLI 工具 / 个人小工具 / 实验性项目 / 单脚本项目
> **核心铁律**：T1 + T2 + T3 + T5 + T12（必含）+ T13 + T15（v2 起必含）
> **范例参考**：[tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)（38 行即巅峰）
> **占位符**：双花括号显式占位符（形如 project_name 的 snake_case 名），必填项缺失时不得发布；可选项不用则整段删除

---

```markdown
---
name: {{project_name}}
description: {{tagline}}
license: MIT
---

<div align="center">

# 🔧 {{project_name}}

**{{tagline}}**

[![CI]({{ci_badge_url}})](.)
[![Version]({{version_badge_url}})](.)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Downloads]({{downloads_badge_url}})](.)
<!-- badge 数据须真实：CI 指向真实 workflow；version/downloads 用真实源，没有就删除该 badge -->

</div>

---

## 是什么

{{summary_sentence}}
{{differentiator_sentence}}

## 安装

```bash
# macOS
{{install_command_macos}}

# Linux
{{install_command_linux}}
```

## 快速上手

```bash
{{project_name}} init
{{project_name}} run
```

输出：

```text
{{sample_output}}
```

## 命令参考

| 命令 | 说明 |
|---|---|
| `{{project_name}} init` | 初始化配置 |
| `{{project_name}} run` | 运行主任务 |
| `{{project_name}} --help` | 查看帮助 |

## License

MIT — 详见 [LICENSE](LICENSE)
```

---

## 评分目标（v3 归一化口径）

| 项 | 目标 |
|---|---|
| 总行数 | ≤ 80 |
| 图片数 | ≥ 1（可以是 logo） |
| **必含** | T1 + T2 + T3 + T4 + T5 + T12 + T13 + T15 + T16 |
| **推荐** | T14（包容性语言） |
| **评分口径** | 归一化百分制 + 适用项数 + 未核验项数；不承诺具体分数，agent-reviewed 项未核验时不输出总分 |

---

## 可选增强片段

### YAML Frontmatter（T15 · 可选，不强制）

README 顶部加：

```markdown
---
name: {{project_name}}
description: {{tagline}}
license: MIT
---
```

### i18n 策略（T13）

如果海外用户占比 > 10%，加：

```markdown
**Languages**: [English](./README.md) · [中文](./README.zh.md)
```

### 包容性语言检查（T14）

示例代码里人名用 `Alex Rivera` / `Mei Lin` / `Priya Patel` 而非 `John Smith`。

### 无障碍注释（T16）

所有图像 alt 必须具体：`![Terminal showing successful install](install.png)` 而非 `![screenshot](img.png)`。

---

## 实战建议

1. **不要为了丰富而丰富** — tailwind 38 行就是经典
2. **只保留 T5 的真实输出截图** — 其他视觉元素可省
3. **不写 Roadmap / Sponsors** — 项目早期不需要
4. **用 emoji 替代 icon** — 减少图片资源负担
5. 可选：以 `llms.txt` 或（合法的）frontmatter 提供结构化元数据——不强制顶部 frontmatter（D-4）

---

## 反模式提醒

- ❌ 把"完成了 P0 P1 P2"当 Features
- ❌ 没有安装步骤
- ❌ Quickstart 写伪代码
- ❌ 用截图代替 Quickstart（截图不可复制）
- ❌ **v2 新增**：海外用户占比 > 10% 但 README 只英文（A9 反模式）

---

<div align="center">
<sub>📜 Minimal 的最高境界：让读者 30 秒装完走。</sub>
<br>
<sub>🤖 v2 新增：让 LLM 也能 30 秒读懂。</sub>
</div>
