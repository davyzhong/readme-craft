# VHS 终端录制示例（T18）

CLI 项目的「演示视频」不需要录屏软件——把终端操作写成 tape 文件，VHS 渲染成 GIF，README 里的演示就可复现、可 diff。

## 约定

- **固定终端尺寸** `1200×720` + 固定字号：跨机器产出一致。
- **固定输入速度** `TypingSpeed 75ms`：回放节奏稳定。
- **显式输出路径** `Output demo.gif`：进版本控制，README 直接引用。
- **命令真实可跑**：tape 里的命令必须是 README Quickstart 的同款命令，不演不存在的功能。

## 用法

```bash
vhs demo.tape        # 渲染 demo.gif
```

## 边界

- 无 VHS 环境时，本目录仅作静态配置示例；readme-craft 的常规验证只静态校验 tape 文件，不实渲染。
- 有 VHS 环境时可实渲染验证，属使用方项目的可选项。
