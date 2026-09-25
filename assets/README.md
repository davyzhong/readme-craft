# assets/ · README 资源目录

> 当前目录包含 `banner.svg`（手绘 SVG，README 首屏 hero）。Playwright / VHS 截图自动化示例已在 `examples/screenshot-automation/` 提供；示例生成物不作为本项目的产品截图。

## 当前文件

| 文件 | 类型 | 状态 | 用途 |
|---|---|---|---|
| `banner.svg` | SVG（手绘） | ✅ 当前 | README 首屏 hero（唯一当前视觉入口） |

## 资源策略

- **首屏 banner**：`banner.svg`（手绘架构图），可作为永久 fallback
- **截图自动化示例**：Playwright 适合 Web/GUI，VHS 适合终端录制；运行前置条件与用法见示例目录。
- **README 渲染图**：本仓没有自动发布 GitHub 渲染截图的工作流；如增加此能力，需单独规划并验证。

## 贡献指引

想贡献截图资源？提 PR 时把图片放到对应路径，commit message 写 `docs(assets): <更新说明>`。
图片规范：
- PNG 优先于 JPG（透明背景支持）
- width=270 用于三列网格
- width=800-1200 用于 banner / 全宽展示
- 必须有具体内容描述 alt（非 "screenshot"）
- 截图必须来自自动化脚本产物（T18），不接受手工截图
