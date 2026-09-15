import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES } from "../data/categories";
import { SITES } from "../data/sites";
import { FAVORITES, type Site } from "../types";

const LS_KEY = "ai-signal-nav:favs";

function readFavs(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set<string>();
  }
}

/** 从 URL hash 读初始筛选，便于分享 / 刷新保持状态 */
function readHash(): { cat: string; q: string } {
  const h = window.location.hash.replace(/^#\/?/, "");
  const p = new URLSearchParams(h);
  return { cat: p.get("c") ?? "all", q: p.get("q") ?? "" };
}

export interface NavState {
  query: string;
  setQuery: (v: string) => void;
  cat: string;
  setCat: (v: string) => void;
  favs: Set<string>;
  toggleFav: (url: string) => void;
  isFav: (url: string) => boolean;
  /** 当前筛选后的站点 */
  visible: Site[];
  /** 各分类条目数（含全部与收藏） */
  counts: Record<string, number>;
  /** 是否处于「全部且无搜索」状态——是则按分类分组展示 */
  isGrouped: boolean;
  /** 分组后的展示结构 */
  grouped: { id: string; sites: Site[] }[];
}

export function useNavState(): NavState {
  const initial = useMemo(readHash, []);
  const [query, setQuery] = useState(initial.q);
  const [cat, setCat] = useState(initial.cat);
  const [favs, setFavs] = useState<Set<string>>(readFavs);

  // 筛选状态写回 hash
  useEffect(() => {
    const p = new URLSearchParams();
    if (cat !== "all") p.set("c", cat);
    if (query) p.set("q", query);
    const next = p.toString();
    const url = next ? `#/${next}` : "#/";
    if (window.location.hash !== url) {
      window.history.replaceState(null, "", url);
    }
  }, [cat, query]);

  // hash 反向同步：浏览器前进/后退、手动改地址栏都能生效
  useEffect(() => {
    function onHashChange() {
      const { cat: nextCat, q: nextQuery } = readHash();
      setCat((prev) => (prev === nextCat ? prev : nextCat));
      setQuery((prev) => (prev === nextQuery ? prev : nextQuery));
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // 收藏持久化
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify([...favs]));
    } catch {
      /* 隐私模式下写入失败，忽略 */
    }
  }, [favs]);

  const toggleFav = useCallback((url: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }, []);

  const isFav = useCallback((url: string) => favs.has(url), [favs]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: SITES.length, [FAVORITES]: favs.size };
    for (const s of SITES) m[s.cat] = (m[s.cat] ?? 0) + 1;
    return m;
  }, [favs]);

  const visible = useMemo(() => {
    const kw = query.trim().toLowerCase();
    let list = SITES;
    if (cat === FAVORITES) list = list.filter((s) => favs.has(s.url));
    else if (cat !== "all") list = list.filter((s) => s.cat === cat);
    if (kw) {
      list = list.filter((s) =>
        `${s.name}${s.desc}${s.url}${s.cat}`.toLowerCase().includes(kw),
      );
    }
    return list;
  }, [cat, query, favs]);

  const isGrouped = cat === "all" && query.trim() === "";

  const grouped = useMemo(
    () =>
      isGrouped
        ? CATEGORIES.map((c) => ({
            id: c.id,
            sites: visible.filter((s) => s.cat === c.id),
          })).filter((g) => g.sites.length > 0)
        : [],
    [isGrouped, visible],
  );

  return {
    query,
    setQuery,
    cat,
    setCat,
    favs,
    toggleFav,
    isFav,
    visible,
    counts,
    isGrouped,
    grouped,
  };
}
