import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "../data/categories";
import { FAVORITES } from "../types";

interface Props {
  cat: string;
  setCat: (v: string) => void;
  counts: Record<string, number>;
  total: number;
}

export function CategoryBar({ cat, setCat, counts, total }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const [fadeLeft, setFadeLeft] = useState(false);
  const [fadeRight, setFadeRight] = useState(false);

  // 横向溢出时给出边缘渐隐提示，滚到两端自动收起，避免内容被无声截断
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    function update() {
      if (!el) return;
      const overflow = el.scrollWidth > el.clientWidth + 1;
      if (!overflow) {
        setFadeLeft(false);
        setFadeRight(false);
        return;
      }
      setFadeLeft(el.scrollLeft > 1);
      setFadeRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    }

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const chips = [
    { id: "all", label: "全部", n: total, accent: false },
    ...CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      n: counts[c.id] ?? 0,
      accent: c.id === "signal",
    })),
    { id: FAVORITES, label: "★ 收藏", n: counts[FAVORITES] ?? 0, accent: false },
  ];

  const classes = [
    "catwrap",
    fadeLeft ? "fade-left" : "",
    fadeRight ? "fade-right" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className="cats" role="tablist" aria-label="分类筛选" ref={scroller}>
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={cat === c.id}
            className={`chip${c.accent ? " hot" : ""}${cat === c.id ? " on" : ""}`}
            onClick={() => setCat(c.id)}
          >
            {c.label} {c.n}
          </button>
        ))}
      </div>
    </div>
  );
}
