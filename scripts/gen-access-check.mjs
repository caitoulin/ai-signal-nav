/**
 * 生成国内可达性体检页：读取 src/data/sites.ts，产出独立 HTML。
 *
 * 用法：bun run gen:access
 *
 * 原理：用 Image() 探测各站点图标/首页，能区分「网络层不可达」与「可达」。
 * 浏览器（用户所在网络）即测量仪——比任何海外检测服务都准。
 */
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync("src/data/sites.ts", "utf8");
const re = /\{\s*name:\s*"([^"]+)",\s*url:\s*"([^"]+)",\s*desc:\s*"([^"]+)",\s*cat:\s*"([^"]+)"/g;

const sites = [];
for (const m of src.matchAll(re)) {
  sites.push({ name: m[1], url: m[2], cat: m[4] });
}

// favicon 作为探针：能取到 ≈ 域名在网络层可达；失败 ≈ 域名不可达或强拦截
// 部分站点无 favicon 会误报，因此同时提供「首页探针」二次确认按钮
const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>连通性粗测 · AI 信号台</title>
<style>
  :root{--bg:#f7f8fa;--card:#fff;--ink:#151a21;--ink2:#5a6673;--line:#e5e8ec;
        --ok:#16a34a;--bad:#dc2626;--wait:#ca8a04;--brand:#2563eb}
  body{margin:0;background:var(--bg);color:var(--ink);
       font:14px/1.6 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif}
  .wrap{max-width:900px;margin:0 auto;padding:24px 16px 60px}
  h1{font-size:20px;margin:0 0 6px}
  p.lead{color:var(--ink2);margin:0 0 18px}
  .bar{position:sticky;top:0;background:var(--bg);padding:12px 0;border-bottom:1px solid var(--line);
       display:flex;gap:10px;align-items:center;flex-wrap:wrap;z-index:5}
  button{border:1px solid var(--line);background:var(--card);border-radius:8px;padding:7px 14px;
         font:inherit;cursor:pointer}
  button:hover{border-color:var(--brand);color:var(--brand)}
  button.primary{background:var(--brand);border-color:var(--brand);color:#fff}
  .stat{color:var(--ink2);font-size:13px}
  table{width:100%;border-collapse:collapse;margin-top:14px;font-size:13px}
  th,td{text-align:left;padding:7px 10px;border-bottom:1px solid var(--line)}
  th{color:var(--ink2);font-weight:500;position:sticky;top:57px;background:var(--bg)}
  .s-ok{color:var(--ok);font-weight:600}
  .s-bad{color:var(--bad);font-weight:600}
  .s-wait{color:var(--wait)}
  code{background:#eef1f4;padding:1px 5px;border-radius:4px;font-size:12px}
  textarea{width:100%;height:130px;margin-top:12px;font:12px/1.5 ui-monospace,monospace;
           border:1px solid var(--line);border-radius:8px;padding:10px;background:var(--card);color:var(--ink)}
  .hint{color:var(--ink2);font-size:12.5px;margin-top:8px}
  tr.bad-row{background:#fff5f5}
</style>
</head>
<body>
<div class="wrap">
  <h1>连通性粗测（不是可用性判定）</h1>
  <p class="lead">
    共 <b>${sites.length}</b> 个站点。本页在你<b>当前的网络</b>下探测，测的是<b>网络层能不能通</b>。
    完成后点「复制结果」把文本发我。
  </p>
  <p class="lead" style="background:#fff8e6;border:1px solid #f0d9a0;border-radius:8px;padding:10px 12px">
    <b>这个测试测不出什么：</b>站点返回「地区不支持」的拦截页、或返回错误码，都会被算作「通」。
    所以 <span class="s-ok">通</span> 只代表网络可达，<b>不代表能用</b>；
    只有 <span class="s-bad">疑似被拦</span> 是可靠信号。
  </p>

  <div class="bar">
    <button class="primary" id="run">开始体检</button>
    <button id="copy" disabled>复制结果</button>
    <span class="stat" id="stat">待开始</span>
  </div>

  <table>
    <thead><tr><th style="width:44%">站点</th><th style="width:26%">域名</th><th>结果</th></tr></thead>
    <tbody id="rows"></tbody>
  </table>

  <p class="hint">
    说明：探测方式是加载各站点的图标（favicon）。<code>不可达</code> 大概率是网络层被拦或超时；
    少数站点因未设图标会误报为不可达——可对可疑项手动打开确认。
  </p>

  <textarea id="out" readonly placeholder="体检完成后，结果会出现在这里"></textarea>
</div>

<script>
const SITES = ${JSON.stringify(sites)};
const rows = document.getElementById("rows");
const stat = document.getElementById("stat");
const out = document.getElementById("out");
const copyBtn = document.getElementById("copy");
let results = {};

function hostOf(u){ return u.replace(/^https?:\\/\\//,"").split("/")[0]; }

// 探针一：fetch(no-cors) —— 能到达网络层就 resolve，硬失败才是 reject
async function probeFetch(url, timeoutMs = 8000){
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), timeoutMs);
    await fetch(url, { mode: "no-cors", signal: ctrl.signal, redirect: "follow" });
    clearTimeout(to);
    return "ok";
  } catch (e) {
    return e.name === "AbortError" ? "timeout" : "blocked";
  }
}

// 探针二：本站 /favicon.ico —— 不依赖任何第三方（Google favicon 在国内被墙）
function probeIcon(url, timeoutMs = 8000){
  return new Promise(resolve => {
    const img = new Image();
    let done = false;
    const t = setTimeout(() => { if(!done){ done = true; img.src=""; resolve("timeout"); } }, timeoutMs);
    img.onload  = () => { if(!done){ done = true; clearTimeout(t); resolve("ok"); } };
    img.onerror = () => { if(!done){ done = true; clearTimeout(t); resolve("bad"); } };
    img.src = url.replace(/\\/+$/,"") + "/favicon.ico";
  });
}

// 两者都失败才算「疑似不可达」；只要有一个通过就算可达 —— 减少误报
async function probeBoth(url){
  const a = await probeFetch(url);
  if (a === "ok") return "ok";
  const b = await probeIcon(url);
  if (b === "ok") return "ok";
  return a === "timeout" || b === "timeout" ? "timeout" : "blocked";
}

rows.innerHTML = SITES.map((s,i) => \`<tr id="r\${i}">
  <td>\${s.name}</td><td><code>\${hostOf(s.url)}</code></td><td class="cell">待测</td></tr>\`).join("");

document.getElementById("run").onclick = async () => {
  const btn = document.getElementById("run");
  btn.disabled = true;
  results = {};
  let ok=0, bad=0, to=0;

  for (let i=0; i<SITES.length; i++){
    const s = SITES[i];
    const cell = document.querySelector(\`#r\${i} .cell\`);
    cell.textContent = "…"; cell.className = "cell s-wait";

    let r = await probeBoth(s.url);

    results[s.name] = { url: s.url, cat: s.cat, r };
    if (r === "ok"){ ok++; cell.textContent="通"; cell.className="cell s-ok"; }
    else if (r === "blocked"){ bad++; cell.textContent="疑似被拦"; cell.className="cell s-bad";
      document.getElementById("r"+i).classList.add("bad-row"); }
    else { to++; cell.textContent="超时"; cell.className="cell s-wait";
      document.getElementById("r"+i).classList.add("bad-row"); }

    stat.textContent = \`进度 \${i+1}/\${SITES.length}　通 \${ok}　疑似被拦 \${bad}　超时 \${to}\`;
  }

  btn.disabled = false;
  copyBtn.disabled = false;
  const badList = Object.entries(results).filter(([,v]) => v.r!=="ok")
    .map(([k,v]) => \`\${k}\\t\${v.url}\\t\${v.r==="timeout"?"超时":"疑似被拦"}\`).join("\\n");
  out.value =
    \`连通性粗测结果（只判硬失败，不代表可用性）\\n生成时间：\${new Date().toLocaleString()}\\n\` +
    \`总计 \${SITES.length}　通 \${ok}　疑似被拦 \${bad}　超时 \${to}\\n\\n\` +
    \`【疑似被拦 / 超时清单】\\n\${badList || "（无）"}\\n\`;
};

copyBtn.onclick = () => {
  out.select();
  navigator.clipboard.writeText(out.value).then(
    () => { copyBtn.textContent = "已复制 ✓"; setTimeout(()=>copyBtn.textContent="复制结果", 1500); },
    () => { copyBtn.textContent = "请手动复制"; }
  );
};
</script>
</body>
</html>
`;

writeFileSync("access-check.html", html, "utf8");
console.log(`已生成 access-check.html — 含 ${sites.length} 个站点`);
