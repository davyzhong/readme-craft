// 项目类型判定：`--type` > `.readme-craft.yaml` > 自动探测。
// 自动探测无法唯一判断时返回 ambiguous=true，由 check 将条件规则标为 unverified，不猜总分。

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { ProjectType } from "./types.ts";
import { PROJECT_TYPES } from "./types.ts";

export class ProjectTypeError extends Error {
  override readonly name = "ProjectTypeError";
}

export interface ProjectTypeResolution {
  types: ProjectType[];
  source: "cli" | "config" | "detect";
  /** 自动探测无任何信号时为 true */
  ambiguous: boolean;
}

function assertLegal(types: string[], origin: string): ProjectType[] {
  for (const t of types) {
    if (!(PROJECT_TYPES as readonly string[]).includes(t)) {
      throw new ProjectTypeError(
        `${origin} 声明了非法项目类型 "${t}"；合法值：${PROJECT_TYPES.join(", ")}`,
      );
    }
  }
  return types as ProjectType[];
}

function detect(root: string): ProjectType[] {
  const found = new Set<ProjectType>();
  const has = (f: string) => existsSync(path.join(root, f));

  const pkgPath = path.join(root, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
        bin?: unknown;
        main?: string;
        exports?: unknown;
        scripts?: Record<string, string>;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      if (pkg.bin) found.add("cli");
      if (!pkg.bin && (pkg.main || pkg.exports)) found.add("library");
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if ("electron" in deps || "@tauri-apps/api" in deps) found.add("desktop");
      if (pkg.scripts?.start && has("Dockerfile")) found.add("service");
    } catch {
      // package.json 解析失败不阻断其他信号
    }
  }

  if (has("Package.swift") || readdirSync(root).some((f) => f.endsWith(".xcodeproj"))) {
    found.add("desktop");
  }
  if (has("index.html")) found.add("web-app");
  if (has("Dockerfile") || has("docker-compose.yml")) found.add("service");

  if (has("pyproject.toml")) {
    const text = readFileSync(path.join(root, "pyproject.toml"), "utf8");
    found.add(text.includes("[project.scripts]") ? "cli" : "library");
  }
  if (has("Cargo.toml")) {
    found.add(has(path.join("src", "main.rs")) ? "cli" : "library");
  }

  if (found.size === 0) {
    // 无 manifest：多个 markdown 文件视为知识库，否则无法判断
    const mdCount = readdirSync(root).filter((f) => f.endsWith(".md")).length;
    if (mdCount >= 2) found.add("knowledge-base");
  }

  return [...found];
}

export function resolveProjectTypes(
  root: string,
  opts: { types?: string[] },
): ProjectTypeResolution {
  if (opts.types && opts.types.length > 0) {
    return { types: assertLegal(opts.types, "--type"), source: "cli", ambiguous: false };
  }

  const configPath = path.join(root, ".readme-craft.yaml");
  if (existsSync(configPath)) {
    const config = YAML.parse(readFileSync(configPath, "utf8")) as { projectTypes?: unknown };
    if (!Array.isArray(config?.projectTypes) || config.projectTypes.length === 0) {
      throw new ProjectTypeError(".readme-craft.yaml 缺少非空的 projectTypes 列表");
    }
    return {
      types: assertLegal(config.projectTypes as string[], ".readme-craft.yaml"),
      source: "config",
      ambiguous: false,
    };
  }

  const types = detect(root);
  return { types, source: "detect", ambiguous: types.length === 0 };
}
