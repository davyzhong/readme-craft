// Skill 打包与安装：按 M1-R1 白名单把仓库资源确定性物化为平铺包。
// 不重写 Markdown；manifest 只含版本与 sha256/bytes，不含时间戳，保证同版本重建零 diff。
// install 永不推断目标：不存在/为空则安装，相同 no-op，不同默认拒绝，仅显式 replace 才覆盖。

import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

/** 白名单：包内相对路径 → 仓库内来源（软链取实际内容）。 */
const WHITELIST: Record<string, string> = {
  "SKILL.md": "skill/SKILL.md",
  "METHODOLOGY.md": "METHODOLOGY.md",
  "checklist.md": "checklist.md",
  "templates/cn-academic.md": "templates/cn-academic.md",
  "templates/minimal.md": "templates/minimal.md",
  "templates/rich.md": "templates/rich.md",
  "templates/standard.md": "templates/standard.md",
};

export interface SkillFile {
  rel: string;
  content: Buffer;
  sha256: string;
}

export interface SkillPayload {
  name: string;
  version: string;
  files: SkillFile[];
}

export class SkillConflictError extends Error {
  readonly diff: string[];
  constructor(diff: string[]) {
    super(`目标目录内容与当前版本不同：${diff.join("、")}`);
    this.name = "SkillConflictError";
    this.diff = diff;
  }
}

function sha256(content: Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

export function buildSkillPayload(root: string): SkillPayload {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as { version?: string };
  if (!pkg.version) throw new Error("package.json 缺少 version");
  const files: SkillFile[] = [];
  for (const rel of Object.keys(WHITELIST).sort()) {
    const src = path.join(root, WHITELIST[rel]!);
    if (!existsSync(src)) throw new Error(`白名单资源缺失：${WHITELIST[rel]}`);
    const content = readFileSync(src); // 软链自动解引用，物化为普通文件内容
    files.push({ rel, content, sha256: sha256(content) });
  }
  return { name: "craft-readme", version: pkg.version, files };
}

export function manifestOf(payload: SkillPayload): Buffer {
  const files: Record<string, { sha256: string; bytes: number }> = {};
  for (const f of payload.files) {
    files[f.rel] = { sha256: f.sha256, bytes: f.content.length };
  }
  const manifest = { name: payload.name, version: payload.version, files };
  return Buffer.from(JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

/** 生成平铺包到 outDir（默认 dist/craft-readme），先清空再写入，保证确定性。 */
export function packSkill(root: string, outDir?: string): { outDir: string; written: string[] } {
  const out = outDir ?? path.join(root, "dist", "craft-readme");
  // 安全边界：只清空空目录或本工具此前生成的包（含 manifest.json），绝不清空未知目录
  if (existsSync(out) && readdirSync(out).length > 0 && !existsSync(path.join(out, "manifest.json"))) {
    throw new Error(`输出目录已存在且不是此前生成的 Skill 包，拒绝清空：${out}`);
  }
  const payload = buildSkillPayload(root);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const written: string[] = [];
  for (const f of payload.files) {
    const dest = path.join(out, f.rel);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, f.content);
    written.push(f.rel);
  }
  writeFileSync(path.join(out, "manifest.json"), manifestOf(payload));
  written.push("manifest.json");
  // 自校验：写出的每个文件 hash 必须与 manifest 一致
  for (const f of payload.files) {
    const writtenContent = readFileSync(path.join(out, f.rel));
    if (sha256(writtenContent) !== f.sha256) throw new Error(`打包自校验失败：${f.rel}`);
  }
  return { outDir: out, written };
}

function listFiles(dir: string, base = dir): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir).sort()) {
    const full = path.join(dir, entry);
    const stat = lstatSync(full);
    if (stat.isSymbolicLink()) throw new Error(`目标目录包含符号链接，拒绝跟随：${full}`);
    if (stat.isDirectory()) out.push(...listFiles(full, base));
    else out.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return out;
}

export type InstallStatus = "installed" | "noop" | "replaced";

/** 把当前版本包装到显式 target。冲突默认抛 SkillConflictError，replace=true 才覆盖。 */
export function installSkill(root: string, target: string, opts: { replace?: boolean } = {}): { status: InstallStatus } {
  if (!target) throw new Error("install-skill 需要显式 --target");
  const payload = buildSkillPayload(root);
  const expected = new Map(payload.files.map((f) => [f.rel, f.content] as const));
  expected.set("manifest.json", manifestOf(payload));

  const targetExists = existsSync(target);
  if (targetExists && lstatSync(target).isSymbolicLink()) {
    throw new Error(`目标目录是符号链接，拒绝跟随：${target}`);
  }
  const isEmptyTarget = !targetExists || listFiles(target).length === 0;
  if (!isEmptyTarget) {
    const actual = listFiles(target);
    const diff: string[] = [];
    for (const rel of actual) {
      const want = expected.get(rel);
      if (!want) diff.push(`${rel}（多余文件）`);
      else if (!readFileSync(path.join(target, rel)).equals(want)) diff.push(`${rel}（内容不同）`);
    }
    for (const rel of expected.keys()) {
      if (!actual.includes(rel)) diff.push(`${rel}（缺失）`);
    }
    if (diff.length === 0) return { status: "noop" };
    if (!opts.replace) throw new SkillConflictError(diff);
    // 真替换：删除目标中不在白名单的多余文件与由此空置的目录，使结果与标准包逐字节一致
    for (const rel of actual) {
      if (!expected.has(rel)) rmSync(path.join(target, rel));
    }
    for (const entry of readdirSync(target)) {
      const full = path.join(target, entry);
      if (statSync(full).isDirectory() && readdirSync(full).length === 0) rmSync(full, { recursive: true });
    }
  }

  for (const [rel, content] of expected) {
    const dest = path.join(target, rel);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, content);
  }
  return { status: isEmptyTarget ? "installed" : "replaced" };
}
