import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, lstatSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { buildSkillPayload, packSkill, installSkill, SkillConflictError } from "../scripts/lib/skill.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(repoRoot, "scripts", "readme-craft.ts");
const pkgVersion = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8")).version as string;

const EXPECTED_FILES = [
  "METHODOLOGY.md",
  "SKILL.md",
  "checklist.md",
  "templates/cn-academic.md",
  "templates/minimal.md",
  "templates/rich.md",
  "templates/standard.md",
  "manifest.json",
];

function tmp(prefix: string): string {
  return mkdtempSync(path.join(tmpdir(), prefix));
}

test("payload 白名单完整且顺序确定", () => {
  const { files } = buildSkillPayload(repoRoot);
  assert.deepEqual(files.map((f) => f.rel), EXPECTED_FILES.filter((f) => f !== "manifest.json"));
});

test("软链资源物化为普通文件", () => {
  // 仓库 skill/METHODOLOGY.md 是软链；物化输出必须是普通文件
  const out = tmp("readme-craft-pack-");
  packSkill(repoRoot, out);
  const stat = lstatSync(path.join(out, "METHODOLOGY.md"));
  assert.ok(stat.isFile() && !stat.isSymbolicLink(), "METHODOLOGY.md 必须物化为普通文件");
});

test("manifest 版本与 package.json 一致，hash 与内容匹配", async () => {
  const out = tmp("readme-craft-pack-");
  packSkill(repoRoot, out);
  const manifest = JSON.parse(readFileSync(path.join(out, "manifest.json"), "utf8"));
  assert.equal(manifest.name, "craft-readme");
  assert.equal(manifest.version, pkgVersion);
  const { createHash } = await import("node:crypto");
  for (const [rel, meta] of Object.entries(manifest.files) as [string, { sha256: string; bytes: number }][]) {
    const content = readFileSync(path.join(out, rel));
    assert.equal(createHash("sha256").update(content).digest("hex"), meta.sha256, `${rel} hash 不匹配`);
    assert.equal(content.length, meta.bytes, `${rel} 字节数不匹配`);
  }
});

test("同版本重建零 diff", () => {
  const a = tmp("readme-craft-pack-a-");
  const b = tmp("readme-craft-pack-b-");
  packSkill(repoRoot, a);
  packSkill(repoRoot, b);
  for (const rel of EXPECTED_FILES) {
    assert.deepEqual(readFileSync(path.join(a, rel)), readFileSync(path.join(b, rel)), `${rel} 重建不一致`);
  }
});

test("install 到不存在或空目录则安装", () => {
  const target = path.join(tmp("readme-craft-inst-"), "craft-readme");
  const res = installSkill(repoRoot, target);
  assert.equal(res.status, "installed");
  for (const rel of EXPECTED_FILES) {
    assert.ok(existsSync(path.join(target, rel)), `${rel} 未安装`);
  }
});

test("install 相同内容为 no-op", () => {
  const target = path.join(tmp("readme-craft-inst-"), "craft-readme");
  installSkill(repoRoot, target);
  const res = installSkill(repoRoot, target);
  assert.equal(res.status, "noop");
});

test("install 内容不同默认拒绝且不写目标", () => {
  const target = path.join(tmp("readme-craft-inst-"), "craft-readme");
  installSkill(repoRoot, target);
  writeFileSync(path.join(target, "SKILL.md"), "本地改动\n");
  assert.throws(() => installSkill(repoRoot, target), SkillConflictError);
  assert.equal(readFileSync(path.join(target, "SKILL.md"), "utf8"), "本地改动\n", "冲突时不得改写目标");
});

test("install --replace 显式替换不同内容", () => {
  const target = path.join(tmp("readme-craft-inst-"), "craft-readme");
  installSkill(repoRoot, target);
  writeFileSync(path.join(target, "SKILL.md"), "本地改动\n");
  const res = installSkill(repoRoot, target, { replace: true });
  assert.equal(res.status, "replaced");
  const payload = buildSkillPayload(repoRoot);
  const skill = payload.files.find((f) => f.rel === "SKILL.md");
  assert.ok(skill);
  assert.deepEqual(readFileSync(path.join(target, "SKILL.md")), skill.content);
});

// ---------- CLI ----------

test("CLI pack-skill 成功并生成完整包", () => {
  const res = spawnSync(process.execPath, [cliPath, "pack-skill"], { encoding: "utf8", cwd: repoRoot });
  assert.equal(res.status, 0, res.stderr);
  for (const rel of EXPECTED_FILES) {
    assert.ok(existsSync(path.join(repoRoot, "dist", "craft-readme", rel)), `dist 缺 ${rel}`);
  }
});

test("CLI install-skill 缺 --target 退出 2", () => {
  const res = spawnSync(process.execPath, [cliPath, "install-skill"], { encoding: "utf8" });
  assert.equal(res.status, 2);
});

test("CLI install-skill 冲突无 --replace 退出 1", () => {
  const target = path.join(tmp("readme-craft-cli-"), "craft-readme");
  mkdirSync(target, { recursive: true });
  writeFileSync(path.join(target, "SKILL.md"), "别的内容\n");
  const res = spawnSync(process.execPath, [cliPath, "install-skill", "--target", target], { encoding: "utf8", cwd: repoRoot });
  assert.equal(res.status, 1, res.stderr);
  assert.equal(readFileSync(path.join(target, "SKILL.md"), "utf8"), "别的内容\n");
});

// ---------- M2-R2 真替换与输出边界 ----------

test("install --replace 删除目标多余文件，替换后与标准包逐字节一致", () => {
  const target = path.join(tmp("readme-craft-inst-"), "craft-readme");
  installSkill(repoRoot, target);
  writeFileSync(path.join(target, "OLD-LEGACY.md"), "旧版本残留\n");
  mkdirSync(path.join(target, "obsolete"), { recursive: true });
  writeFileSync(path.join(target, "obsolete", "stale.md"), "过期\n");
  const res = installSkill(repoRoot, target, { replace: true });
  assert.equal(res.status, "replaced");
  assert.ok(!existsSync(path.join(target, "OLD-LEGACY.md")), "多余文件未被删除");
  assert.ok(!existsSync(path.join(target, "obsolete")), "多余目录未被删除");
  // 替换后再次安装必须是 no-op（即目标与标准包完全一致）
  assert.equal(installSkill(repoRoot, target).status, "noop");
});

test("packSkill 拒绝清空非本工具生成的非空目录", () => {
  const out = tmp("readme-craft-unsafe-");
  writeFileSync(path.join(out, "precious.txt"), "别删我\n");
  assert.throws(() => packSkill(repoRoot, out), /拒绝清空/);
  assert.ok(existsSync(path.join(out, "precious.txt")), "安全边界失效，目录被清空");
});

test("packSkill 可重复写入自己生成的输出目录", () => {
  const out = tmp("readme-craft-repack-");
  packSkill(repoRoot, out);
  packSkill(repoRoot, out); // 第二次不应抛错
  assert.ok(existsSync(path.join(out, "manifest.json")));
});
