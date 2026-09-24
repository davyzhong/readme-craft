# examples/screenshot-automation/ · 截图自动化示例（T18）

README 引用的截图必须由脚本产生、禁止手工维护（铁律 T18）。本目录提供两种可直接复制到目标项目的方案：

| 方案 | 目录 | 适用 | 前置条件 |
|---|---|---|---|
| **Playwright** | [`playwright/`](playwright/) | Web 应用 / 本地 HTML 页面（固定视口、语义文件名、失败非零退出） | Node + Playwright（Chromium） |
| **VHS** | [`vhs/`](vhs/) | 终端命令演示（固定终端尺寸与输入速度，产出 GIF/MP4） | 安装 [VHS](https://github.com/charmbracelet/vhs) |

两个方案均为「复制进目标项目」的示例，不参与本仓常规 CI，也不在验证时下载浏览器。

配套：CI 的 README 链接检查 job 见 [`../ci-recipes/link-check.job.yml`](../ci-recipes/link-check.job.yml)；完整方法论见 T18（`METHODOLOGY.md` §2）。

← 返回 [项目 README](../../README.md)
