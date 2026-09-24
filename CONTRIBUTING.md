# 贡献指南（CONTRIBUTING）

感谢关注 readme-craft。贡献前请先读 [METHODOLOGY.md](METHODOLOGY.md) 与 [CLAUDE.md](CLAUDE.md)（项目规范）。

## 证据规则

1. 不伪造安装命令、性能数据、用户引用、客户 Logo、截图或支持平台。
2. 示例无法追溯到真实项目证据时，必须明确标注「示例」或「虚构 fixture」。
3. 方法论规则必须声明适用范围；不适用项使用 `N/A`，不强行扣分。
4. 版本号、铁律数、反模式数、量表分值必须全仓一致；v3.0 起以 `rules.yaml` 为唯一事实源，生成区块不得手工编辑。

## 开发环境

- Node 契约：本地 `>=24.15.0`（更高主版本可跑，运行时契约测试只断言下限）；**CI 复现由 `.node-version`（24.15.0）+ workflow `node-version-file` 精确锁定**，两者职责不同，勿混淆。
- 推荐用 [mise](https://mise.jdx.dev/) 按目录自动切换：`brew install mise` 后在 `~/.zshrc` 加 `eval "$(mise activate zsh)"`，再执行一次 `mise settings add idiomatic_version_file_enable_tools node`（让 mise 识别 `.node-version`）。进入本仓即自动使用 24.15.0。
- pnpm 由 `package.json` 的 `packageManager` 字段固定（10.17.1），安装走 `pnpm install --frozen-lockfile`。

## 提交前验证

版本口径检查（仅允许命中明确标注为历史的段落；v3.0 起由 `pnpm validate` 取代）：

```bash
grep -rn "16 条铁律\|17 条铁律\|18 条铁律\|80 分\|85 分\|90 分" \
  README.md METHODOLOGY.md checklist.md skill/SKILL.md examples/ templates/ assets/
```

相对链接检查（忽略代码块内示例；唯一豁免：`examples/after/` 是引用虚构项目资产的演示 fixture。
`skill/` 是完整包视图——`METHODOLOGY.md`、`checklist.md`、`templates` 为指向根部的受控软链，
`SKILL.md` 的包内 `./` 链接在仓库内即可解析，不再豁免）：

```bash
ruby -e '
  Dir.glob("**/*.md").each do |f|
    next if File.symlink?(f)             # skill/ 软链是根文件的包视图副本，扫根文件即可
    next if f.start_with?("docs/superpowers/")
    next if f.start_with?("examples/after/") # 演示 fixture，链接指向虚构项目资产
    text = File.read(f).gsub(/```.*?```/m, "")
    text.scan(/\[[^\]]*\]\((\.\.?\/[^)#\s]+)/).flatten.each do |l|
      target = File.expand_path(l, File.dirname(f))
      puts "BROKEN #{f}: #{l}" unless File.exist?(target)
    end
  end
'
```

预期：口径检查无当前产品命中；链接检查无 `BROKEN` 输出。

## 提交与推送

- Conventional Commits（`feat` / `fix` / `docs` / `chore` / `build` / `ci`）。
- commit 后立即 push（项目默认动作，无需询问）。
- rebase、`reset --hard`、force push、删除/移动既有文件、公开发布（tag / Release / Action 发布 / Web 部署）、CI 配置变更，必须先经 owner 批准。

## 报告问题

提 Issue 时请附：复现步骤、期望与实际行为、相关文件与行号。安全问题走 [SECURITY.md](SECURITY.md) 的私密渠道，不要开公开 Issue。
