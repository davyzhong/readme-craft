// 本地静态预览（M3-5）：构建 web/dist 后在 localhost 提供 web/ 目录。
// 纯静态托管即可运行本页面；此脚本只用于本地预览，不是服务端运行时。
// createWebServer 同时供 web/tests/smoke.test.ts 复用（冒烟测试自建实例，不走 CLI 入口）。

import { createServer } from "node:http";
import type { Server } from "node:http";
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildWeb } from "./web-build.ts";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

/** 构建 web/dist 并返回一个尚未 listen 的静态服务器（仅服务 web/ 目录，防目录穿越）。 */
export function createWebServer(root: string): Server {
  const webRoot = path.join(root, "web");
  buildWeb(root);
  return createServer((req, res) => {
    let urlPath: string;
    try {
      urlPath = decodeURIComponent((req.url ?? "/").split("?")[0] ?? "/");
    } catch {
      res.writeHead(400).end("bad request");
      return;
    }
    const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
    const file = path.resolve(webRoot, rel);
    if (!isWithin(webRoot, file) || !existsSync(file)) {
      res.writeHead(404).end("not found");
      return;
    }
    let realRoot: string;
    let realFile: string;
    try {
      realRoot = realpathSync(webRoot);
      realFile = realpathSync(file);
    } catch {
      res.writeHead(404).end("not found");
      return;
    }
    if (!isWithin(realRoot, realFile) || !statSync(realFile).isFile()) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "content-type": MIME[path.extname(realFile)] ?? "application/octet-stream" });
    res.end(readFileSync(realFile));
  });
}

function isWithin(parent: string, candidate: string): boolean {
  const relative = path.relative(parent, candidate);
  return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

const invokedAsScript = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedAsScript) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const port = Number(process.env.PORT ?? 4173);
  const server = createWebServer(repoRoot);
  server.listen(port, "127.0.0.1", () => {
    process.stdout.write(`预览地址：http://localhost:${port}/ （Ctrl+C 停止）\n`);
  });
}
