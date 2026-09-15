import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  query: string;
  setQuery: (v: string) => void;
  /** 分类栏等需要与顶栏一同吸顶的内容 */
  children?: ReactNode;
}

export function Header({ query, setQuery, children }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;

      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && el === inputRef.current) {
        setQuery("");
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setQuery]);

  return (
    <header>
      <div className="wrap">
        <div className="hbar">
          <div className="logo">
            <i />
            <span>
              AI 信号台<small>　导航 + 状态</small>
            </span>
          </div>
          <div className="search">
            <span className="ico">⌕</span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              placeholder="搜索站点、用途或关键词…"
              aria-label="搜索站点"
              autoComplete="off"
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>/</kbd>
          </div>
        </div>
        {children}
      </div>
    </header>
  );
}
