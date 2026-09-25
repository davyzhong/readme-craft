import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer, request } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { createWebServer } from "../../scripts/web-preview.ts";

function get(server: ReturnType<typeof createServer>, requestPath: string): Promise<{ status: number; body: string }> {
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  return new Promise((resolve, reject) => {
    const req = request(
      { host: "127.0.0.1", port: address.port, path: requestPath, method: "GET" },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk: string) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
      },
    );
    req.on("error", reject);
    req.end();
  });
}

test("preview serves only canonical files under web and rejects malformed escapes", async (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "readme-craft-preview-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const web = path.join(root, "web");
  const source = path.join(web, "src");
  const sibling = path.join(root, "web-private");
  mkdirSync(source, { recursive: true });
  mkdirSync(sibling, { recursive: true });
  writeFileSync(path.join(source, "main.ts"), "export {};\n");
  writeFileSync(path.join(web, "index.html"), "public page");
  writeFileSync(path.join(sibling, "secret.txt"), "private data");
  symlinkSync(sibling, path.join(web, "shortcut"), "dir");

  const server = createWebServer(root);
  t.after(() => server.close());
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  assert.deepEqual(await get(server, "/"), { status: 200, body: "public page" });
  assert.equal((await get(server, "/..%2fweb-private%2fsecret.txt")).status, 404);
  assert.equal((await get(server, "/shortcut/secret.txt")).status, 404);
  assert.equal((await get(server, "/%E0%A4%A")).status, 400);
  assert.equal((await get(server, "/")).status, 200, "bad requests must not stop the preview server");
});
