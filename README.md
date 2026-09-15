# AI 信号台

AI 工具导航 + 实时状态信号。Vite + React 18 + TypeScript。

收录 **149 个站点 / 15 个分类**，覆盖状态信号、免费额度、对话模型、AI 编程、图像视频音频、
Agent 开发、学术论文、榜单基准、资讯热点等。

## 开发

```bash
bun install
bun run dev        # http://127.0.0.1:5181
bun run build      # 产物到 dist/
bun run preview    # 预览构建产物，http://127.0.0.1:4181
bun run typecheck  # 仅类型检查
```

## 目录结构

```
src/
├── main.tsx                 # 入口，挂载 <App />
├── App.tsx                  # 组装：顶栏 / 分类 / 分组列表 / 页脚 / 提示条
├── styles.css               # 全站样式（CSS 变量 + 深色模式）
├── types.ts                 # Site / Category 类型与常量
├── data/
│   ├── categories.ts        # 15 个分类
│   └── sites.ts             # 149 个站点
├── hooks/
│   └── useNavState.ts       # 筛选状态：搜索 / 分类 / 收藏 / URL 双向同步
└── components/
    ├── Header.tsx           # 吸顶顶栏（含搜索，`/` 聚焦、Esc 清空）
    ├── CategoryBar.tsx      # 分类 chips（含「★ 收藏」）+ 溢出边缘渐隐
    ├── SiteCard.tsx         # 站点卡片（收藏 / 复制）
    ├── SiteGrid.tsx         # 卡片网格
    └── Avatar.tsx           # 字母头像（名称哈希取色，零外部请求）
```

## 功能

| 能力 | 说明 |
|---|---|
| **URL 状态双向同步** | 筛选条件写入 hash（`#/c=free&q=免费`），可直接分享；浏览器前进/后退、手动改地址栏都会回灌界面 |
| **收藏** | 卡片右上角 ☆，存 localStorage，分类栏有「★ 收藏」入口 |
| **搜索** | `/` 聚焦、`Esc` 清空，匹配名称 / 说明 / 链接 / 分类 |
| **可访问性** | 分类 `role="tablist"` / `aria-selected`，收藏 `aria-pressed`，头像 `aria-hidden` |
| **深色模式** | 跟随系统 `prefers-color-scheme` |
| **零外部依赖** | 不引 CDN、不引字体、不拉 favicon；`base: "./"` 保证丢到任意子路径都能跑 |

## 收录标准

承 [free-for.dev](https://github.com/ripienaar/free-for.dev)：

真免费档而非试用 · 额度写清 · 价格公开 · 至少可用一年 · 不收套壳与无新价值的复制品。

这条标准挂在页面页脚，也是与市面上「拼数量」的 AI 导航站的主要区别。

## 部署

静态产物，可托管在任意静态服务（GitHub Pages / Cloudflare Pages / Vercel / Netlify）。

### 本机 git push 被拦截的绕行方式

本机实测（2026-09-15）：git **读操作可用**（`git ls-remote` / `git fetch` 正常），
但 **`git push` 被拦** —— `git-remote-https` 在 push 时被瞬间掐断，报
`remote helper 'https' aborted session`，且发生在发起网络请求之前（`GIT_TRACE=1` 无任何 HTTP 痕迹）。
SSH 通道（`github.com:22` / `ssh.github.com:443`）TCP 可连，但本机未配置密钥。

因此提交可改用 **GitHub REST API**：

```bash
# 新增文件
gh api -X PUT repos/OWNER/REPO/contents/dist/index.html \
  -f message="deploy: xxx" -f content="$(base64 -i dist/index.html)" -f branch=main

# 更新已有文件必须带 sha，否则 409
gh api -X PUT repos/OWNER/REPO/contents/dist/index.html \
  -f message="deploy: xxx" -f content="$(base64 -i dist/index.html)" -f branch=main \
  -f sha="$(gh api repos/OWNER/REPO/contents/dist/index.html --jq .sha)"
```

> 配好 SSH key 后可恢复正常 `git push`。

### 绑定自有域名

```bash
OWNER=caitoulin REPO=<仓库名> ./bind-domain.sh <你的域名>
```

脚本会：写 `CNAME` → 设置 Pages 自定义域名 → 开启强制 HTTPS → 轮询域名校验 → 打印 DNS 记录。
只读查看当前绑定：`./bind-domain.sh <域名> --check`

**候选域名**（RDAP 实查，2026-09-15）

- 可用：`aisignal.cc`、`aisignal.io`、`aixinhao.cc`、`ai-nav.cc`、`newainav.com`、`hotainav.com`
- 已注册：`aisignal.com`、`aisignal.app`、`airadar.com`、`navai.cc`、`ainav.cc`

**免费子域名**（承 free-for.dev）：DigitalPlat、DNSHE（支持自定义 NS）、pp.ua、isroot.in

## 数据维护

站点在 `src/data/sites.ts`，分类在 `src/data/categories.ts`。

```ts
// sites.ts
{ name: "Langfuse", url: "https://langfuse.com", desc: "LLM 可观测性，5 万条观测/月永久免费，开源", cat: "free", hot: true }

// categories.ts
{ id: "free", label: "AI 免费额度", hint: "真免费档（非试用）· 额度写清 · 至少可用一年", color: "#16a34a" }
```

新增分类：在 `categories.ts` 加一行即可，分类栏与分组渲染自动跟进。

## 待办

- [ ] 为站点补「访问条件」标注（国内可直连 / 需科学上网）—— 需浏览器级复验，
      **不能**用 curl 结果判定（403 多为反爬而非不可达）
- [ ] 信号区自动化（GitHub Actions 定时抓取额度重置与榜单变化）
- [ ] 确定部署仓库与流水线（本机 git push 受限，见上）
