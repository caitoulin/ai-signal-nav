import { useCallback, useRef, useState } from "react";
import { CATEGORIES } from "./data/categories";
import { SITES } from "./data/sites";
import { FAVORITES } from "./types";
import { useNavState } from "./hooks/useNavState";
import { Header } from "./components/Header";
import { CategoryBar } from "./components/CategoryBar";
import { SiteGrid } from "./components/SiteGrid";

export default function App() {
  const nav = useNavState();
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1400);
  }, []);

  const onCopy = useCallback(
    (url: string, name: string) => {
      navigator.clipboard
        .writeText(url)
        .then(() => showToast(`已复制 ${name} 的链接`))
        .catch(() => showToast("复制失败，请手动选择"));
    },
    [showToast],
  );

  const activeCat = CATEGORIES.find((c) => c.id === nav.cat);
  const heading =
    nav.cat === FAVORITES ? "我的收藏" : nav.query.trim() ? "搜索结果" : activeCat?.label;

  return (
    <>
      <Header query={nav.query} setQuery={nav.setQuery}>
        <CategoryBar
          cat={nav.cat}
          setCat={nav.setCat}
          counts={nav.counts}
          total={SITES.length}
        />
      </Header>

      <main className="wrap">
        <div className="lead">
          <h1>AI 工具导航与实时信号</h1>
          <p>
            共 {SITES.length} 个站点，{CATEGORIES.length} 个分类　·　信号区追踪额度重置与模型发布，
            免费额度区只收真免费档（含具体额度）
          </p>
        </div>

        {nav.isGrouped ? (
          nav.grouped.map((g) => {
            const meta = CATEGORIES.find((c) => c.id === g.id);
            if (!meta) return null;
            return (
              <section key={g.id}>
                <div className={`sect${g.id === "signal" ? " signal" : ""}`}>
                  <h2>{meta.label}</h2>
                  <span>
                    {meta.hint}　·　{g.sites.length} 个
                  </span>
                </div>
                <SiteGrid
                  sites={g.sites}
                  favs={nav.favs}
                  onToggleFav={nav.toggleFav}
                  onCopy={onCopy}
                />
              </section>
            );
          })
        ) : nav.visible.length === 0 ? (
          <div className="empty">
            {nav.cat === FAVORITES
              ? "还没有收藏　·　点卡片右上角的 ☆ 收藏常用站点"
              : "没有匹配的站点　·　试试「重置」「视频」「免费」"}
          </div>
        ) : (
          <section>
            <div className="sect">
              <h2>{heading}</h2>
              <span>{nav.visible.length} 个</span>
            </div>
            <SiteGrid
              sites={nav.visible}
              favs={nav.favs}
              onToggleFav={nav.toggleFav}
              onCopy={onCopy}
            />
          </section>
        )}
      </main>

      <footer className="wrap">
        <span>
          收录 <b>{SITES.length}</b> 个站点 · 全部链接经连通性核验
        </span>
        <span>
          <b>收录标准</b>（承 free-for.dev）：真免费档而非试用 · 额度写清 · 价格公开 ·
          至少可用一年 · 不收套壳与无新价值的复制品
        </span>
        <span>纯静态站点，无追踪 · 收藏保存在本地 · 按 / 聚焦搜索</span>
      </footer>

      <div className={`toast${toast ? " on" : ""}`} role="status">
        {toast}
      </div>
    </>
  );
}
