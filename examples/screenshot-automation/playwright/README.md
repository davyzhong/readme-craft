# Playwright 截图自动化示例（T18）

把 `screenshot.mjs` 复制到你的项目，改 `TARGETS` 为你的真实页面，即可让 README 截图可重复产出。

## 约定（与 readme-craft T18 对齐）

- **固定视口** `1440×900`：跨机器截图尺寸一致，diff 可读。
- **显式 URL**：`node screenshot.mjs http://localhost:3000`，不写死、不猜测。
- **语义文件名**：`home-dashboard.png` 而不是 `screenshot-1.png`，review 时知道自己在看什么。
- **失败非零退出**：任何一步失败 `process.exitCode = 1`，CI 能拦住「截图没更新」。

## 接入你的 CI（目标项目自己的 workflow）

```yaml
- run: node screenshot.mjs http://localhost:3000
- run: git diff --exit-code docs/screenshots/   # 截图过期则失败
```

## 边界

- 本示例**不进入 readme-craft 本仓 CI**，readme-craft 的常规验证**不下载浏览器**。
- 浏览器安装（`npx playwright install chromium`）发生在使用方项目，由使用方自行锁定版本。
