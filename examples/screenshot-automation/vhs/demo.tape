# VHS 终端录制示例（T18）：CLI 项目的 README 演示 GIF。
# 契约：固定终端尺寸、固定输入速度、显式输出路径；命令可复现。
# 用法：vhs demo.tape（需本机已装 VHS；无 VHS 时本文件仅作静态配置示例）

Output demo.gif

Set Width 1200
Set Height 720
Set FontSize 16
Set TypingSpeed 75ms
Set Theme "Catppuccin Mocha"

# 演示命令按真实 CLI 替换
Type "mycli init my-app"
Enter
Sleep 1s

Type "cd my-app && mycli run"
Enter
Sleep 2s

Type "mycli stats"
Enter
Sleep 3s
