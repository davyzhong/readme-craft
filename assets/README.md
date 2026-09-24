# assets/ · README 资源目录

> 当前目录只包含 `banner.svg`（手绘 SVG，README 首屏 hero）。演示截图（改造前后对照、
> 模板渲染效果等）将在 v3.0 的截图自动化示例（Playwright / VHS）落地后补齐。

## 当前文件

| 文件 | 类型 | 状态 | 用途 |
|---|---|---|---|
| `banner.svg` | SVG（手绘） | ✅ 当前 | README 首屏 hero（唯一当前视觉入口） |

## 资源策略

- **首屏 banner**：`banner.svg`（手绘架构图），可作为永久 fallback
- **示例截图**：v3.0 用 vhs/terminalizer 录 CLI 终端、用 Playwright 截 GUI 界面（可复制示例将放在 `examples/screenshot-automation/`）
- **README 渲染图**：v3.0 用 Playwright 自动化截 GitHub README 渲染效果

## 贡献指引

想贡献截图资源？提 PR 时把图片放到对应路径，commit message 写 `docs(assets): <更新说明>`。
图片规范：
- PNG 优先于 JPG（透明背景支持）
- width=270 用于三列网格
- width=800-1200 用于 banner / 全宽展示
- 必须有具体内容描述 alt（非 "screenshot"）
- 截图必须来自自动化脚本产物（T18），不接受手工截图
