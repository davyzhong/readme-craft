#!/usr/bin/env node
// readme-craft CLI 入口（v3.0-alpha）。
// 子命令契约见 docs/superpowers/plans/2026-09-22-optimization-master-plan.md §3.4。
// 退出码：0 成功；1 规则或一致性失败；2 参数 / Schema / 运行环境错误。

import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SUBCOMMANDS = ["validate", "generate", "check", "pack-skill", "install-skill"] as const;

const USAGE = `readme-craft — README 方法论工具链（rules.yaml 单一事实源）

用法：
  pnpm readme-craft validate
  pnpm readme-craft generate [--check]
  pnpm readme-craft check <project-path> [--type <type>] [--review <path>] [--format text|json] [--output <path>] [--strict]
  pnpm readme-craft pack-skill
  pnpm readme-craft install-skill --target <path>

子命令：
  validate       校验仓库自身：rules.yaml 结构、版本/数量一致、内部链接与锚点、占位符、生成区块新鲜度
  generate       从 rules.yaml 生成带边界标记的文档区块；--check 只校验不写入
  check          对目标项目 README 执行确定性规则检查并输出报告
  pack-skill     构建确定性 Skill 平铺包（dist/craft-readme/）
  install-skill  将 Skill 包安装到显式 --target 路径（不同内容默认拒绝，需 --replace）
`;

async function main(argv: string[]): Promise<number> {
  const [first] = argv;

  if (first === "--help" || first === "-h") {
    process.stdout.write(USAGE);
    return 0;
  }

  if (first === undefined) {
    process.stderr.write(USAGE);
    return 2;
  }

  if (!(SUBCOMMANDS as readonly string[]).includes(first)) {
    process.stderr.write(`未知子命令：${first}\n\n${USAGE}`);
    return 2;
  }

  if (first === "generate") {
    return runGenerate(argv.slice(1));
  }

  if (first === "validate") {
    return runValidate(argv.slice(1));
  }

  if (first === "check") {
    return runCheck(argv.slice(1));
  }

  if (first === "pack-skill") {
    return runPackSkill(argv.slice(1));
  }

  return runInstallSkill(argv.slice(1));
}

async function runPackSkill(argv: string[]): Promise<number> {
  if (argv.length > 0) {
    process.stderr.write(`pack-skill 不支持参数：${argv.join(" ")}\n`);
    return 2;
  }
  const { packSkill } = await import("./lib/skill.ts");
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const { outDir, written } = packSkill(repoRoot);
  process.stdout.write(`Skill 包已生成：${path.relative(repoRoot, outDir)}（${written.length} 个文件）\n`);
  return 0;
}

async function runInstallSkill(argv: string[]): Promise<number> {
  let target: string | undefined;
  let replace = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] ?? "";
    if (a === "--target") {
      target = argv[++i];
      if (!target) return usageError("--target 缺少路径");
    } else if (a === "--replace") {
      replace = true;
    } else {
      return usageError(`install-skill 不支持参数：${a}`);
    }
  }
  if (!target) return usageError("install-skill 需要显式 --target <path>，永不推断安装位置");

  const { installSkill, SkillConflictError } = await import("./lib/skill.ts");
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  try {
    const { status } = installSkill(repoRoot, path.resolve(target), { replace });
    if (status === "noop") process.stdout.write("目标已是最新，无需变更（no-op）。\n");
    else if (status === "installed") process.stdout.write(`已安装到 ${target}\n`);
    else process.stdout.write(`已用当前版本替换目标内容：${target}\n`);
    return 0;
  } catch (err) {
    if (err instanceof SkillConflictError) {
      process.stderr.write(`${err.message}\n默认不覆盖不同内容；确认要替换时显式加 --replace。\n`);
      return 1;
    }
    if (err instanceof Error) {
      process.stderr.write(`${err.message}\n`);
      return 2;
    }
    throw err;
  }
}

async function runGenerate(argv: string[]): Promise<number> {
  const check = argv.includes("--check");
  const unknown = argv.filter((a) => a !== "--check");
  if (unknown.length > 0) {
    process.stderr.write(`generate 不支持参数：${unknown.join(" ")}\n`);
    return 2;
  }
  try {
    const { generateAll } = await import("./lib/generate.ts");
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const result = generateAll(repoRoot, { check });
    const stale = [...new Set(result.stale)];
    if (stale.length > 0) {
      if (check) {
        process.stderr.write(`生成区块已过期：${stale.join("、")}\n请运行 pnpm readme-craft generate\n`);
        return 1;
      }
      process.stdout.write(`已更新生成区块：${stale.join("、")}\n`);
    } else {
      process.stdout.write("生成区块全部新鲜，无需更新。\n");
    }
    return 0;
  } catch (err) {
    if (err instanceof Error && err.name === "GenerateError") {
      process.stderr.write(`${err.message}\n`);
      return 1;
    }
    if (err instanceof Error && (err.name === "SchemaError" || err.name === "SemanticError")) {
      process.stderr.write(`${err.message}\n`);
      return err.name === "SchemaError" ? 2 : 1;
    }
    throw err;
  }
}

async function runValidate(argv: string[]): Promise<number> {
  if (argv.length > 0) {
    process.stderr.write(`validate 不支持参数：${argv.join(" ")}\n`);
    return 2;
  }
  try {
    const { validateRepo } = await import("./lib/validate.ts");
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const { issues } = validateRepo(repoRoot);
    if (issues.length > 0) {
      for (const i of issues) {
        process.stderr.write(`[${i.check}] ${i.file ?? ""} ${i.message}\n`);
      }
      process.stderr.write(`共 ${issues.length} 个一致性问题。\n`);
      return 1;
    }
    process.stdout.write("validate 通过：版本一致、口径无漂移、链接与锚点有效、无未声明占位符、生成区块新鲜。\n");
    return 0;
  } catch (err) {
    if (err instanceof Error && (err.name === "SchemaError" || err.name === "SemanticError")) {
      process.stderr.write(`${err.message}\n`);
      return err.name === "SchemaError" ? 2 : 1;
    }
    throw err;
  }
}

async function runCheck(argv: string[]): Promise<number> {
  const types: string[] = [];
  let reviewPath: string | undefined;
  let format: "text" | "json" = "text";
  let output: string | undefined;
  let strict = false;
  let target: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] ?? "";
    if (a === "--type") {
      const v = argv[++i];
      if (!v) return usageError("--type 缺少值");
      types.push(v);
    } else if (a === "--review") {
      reviewPath = argv[++i];
      if (!reviewPath) return usageError("--review 缺少路径");
    } else if (a === "--format") {
      const v = argv[++i];
      if (v !== "text" && v !== "json") return usageError("--format 只支持 text|json");
      format = v;
    } else if (a === "--output") {
      output = argv[++i];
      if (!output) return usageError("--output 缺少路径");
    } else if (a === "--strict") {
      strict = true;
    } else if (a.startsWith("--")) {
      return usageError(`check 不支持参数：${a}`);
    } else if (!target) {
      target = a;
    } else {
      return usageError(`多余的参数：${a}`);
    }
  }

  if (!target) return usageError("check 需要目标项目路径");
  const projectRoot = path.resolve(target);
  if (!existsSync(projectRoot)) return usageError(`路径不存在：${projectRoot}`);

  try {
    const { checkProject, emitReport, exitCodeOf } = await import("./lib/check.ts");
    const report = checkProject(projectRoot, {
      types,
      ...(reviewPath ? { reviewPath } : {}),
      format,
      ...(output ? { output } : {}),
      strict,
    });
    process.stdout.write(emitReport(report, format, output));
    return exitCodeOf(report, strict);
  } catch (err) {
    if (err instanceof Error && (err.name === "ProjectTypeError" || err.name === "SchemaError")) {
      process.stderr.write(`${err.message}\n`);
      return 2;
    }
    if (err instanceof Error && err.name === "SemanticError") {
      process.stderr.write(`${err.message}\n`);
      return 1;
    }
    throw err;
  }
}

function usageError(message: string): number {
  process.stderr.write(`${message}\n`);
  return 2;
}

const code = await main(process.argv.slice(2));
process.exit(code);
