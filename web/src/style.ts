// Web 评分页样式（M3-5）：以字符串导出，由 main.ts 注入 <style>。
// 保持无外部字体/资源依赖，符合「不发出任何网络请求」的隐私承诺。

export const STYLE = `
:root {
  color-scheme: light dark;
  --fg: #1f2430;
  --bg: #f7f7fb;
  --card: #ffffff;
  --border: #d8dbe6;
  --accent: #4f46e5;
}
@media (prefers-color-scheme: dark) {
  :root {
    --fg: #e6e8f0;
    --bg: #14161f;
    --card: #1d2030;
    --border: #343950;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
  background: var(--bg);
  color: var(--fg);
  line-height: 1.6;
}
main { max-width: 960px; margin: 0 auto; padding: 24px 16px 48px; }
h1 { font-size: 1.5rem; margin-bottom: 4px; }
.privacy {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.92rem;
}
.input-panel { display: grid; gap: 10px; margin: 18px 0; }
fieldset {
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  background: var(--card);
}
fieldset label { white-space: nowrap; }
textarea {
  width: 100%;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85rem;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  color: var(--fg);
  resize: vertical;
}
button {
  justify-self: start;
  padding: 8px 22px;
  font-size: 0.95rem;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
}
button:hover { opacity: 0.9; }
table {
  width: 100%;
  border-collapse: collapse;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  font-size: 0.88rem;
}
th, td { padding: 8px 10px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; }
th { background: rgba(127, 127, 160, 0.12); }
tr.status-fail td:first-child { border-left: 3px solid #dc2626; }
tr.status-partial td:first-child { border-left: 3px solid #d97706; }
tr.status-pass td:first-child { border-left: 3px solid #16a34a; }
tr.status-unverified td:first-child { border-left: 3px solid #64748b; }
tr.status-na td:first-child { border-left: 3px solid var(--border); }
.summary { font-weight: 600; margin-top: 12px; }
.error { color: #dc2626; font-weight: 600; }
footer { margin-top: 28px; font-size: 0.85rem; opacity: 0.85; }
code { background: rgba(127, 127, 160, 0.18); padding: 1px 5px; border-radius: 4px; }
`;
