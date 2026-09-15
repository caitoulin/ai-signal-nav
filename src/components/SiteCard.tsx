import type { Site } from "../types";
import { Avatar } from "./Avatar";

function badge(site: Site) {
  if (site.cat === "signal") return <span className="tagline sig">信号</span>;
  if (site.hot) return <span className="tagline hot">热门</span>;
  if (site.cat === "nav") return <span className="tagline nav">参考</span>;
  if (site.cat === "free") return <span className="tagline free">免费</span>;
  return null;
}

interface Props {
  site: Site;
  faved: boolean;
  onToggleFav: (url: string) => void;
  onCopy: (url: string, name: string) => void;
}

export function SiteCard({ site, faved, onToggleFav, onCopy }: Props) {
  return (
    <div className={`card${site.cat === "signal" ? " is-signal" : ""}`}>
      <a
        className="card-main"
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Avatar name={site.name} />
        <span className="meta">
          <span className="nm">
            <b>{site.name}</b>
            {badge(site)}
          </span>
          <span className="du">
            {site.desc}
            <br />
            {site.url.replace(/^https?:\/\//, "").split("/")[0]}
          </span>
        </span>
      </a>

      <button
        type="button"
        className={`icon-btn fav${faved ? " on" : ""}`}
        onClick={() => onToggleFav(site.url)}
        aria-pressed={faved}
        title={faved ? "取消收藏" : "收藏"}
      >
        {faved ? "★" : "☆"}
      </button>

      <button
        type="button"
        className="icon-btn cp"
        onClick={() => onCopy(site.url, site.name)}
        title="复制链接"
      >
        复制
      </button>
    </div>
  );
}
