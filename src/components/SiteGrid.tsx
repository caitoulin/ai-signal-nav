import type { Site } from "../types";
import { SiteCard } from "./SiteCard";

interface Props {
  sites: Site[];
  favs: Set<string>;
  onToggleFav: (url: string) => void;
  onCopy: (url: string, name: string) => void;
}

export function SiteGrid({ sites, favs, onToggleFav, onCopy }: Props) {
  return (
    <div className="grid">
      {sites.map((s) => (
        <SiteCard
          key={s.url}
          site={s}
          faved={favs.has(s.url)}
          onToggleFav={onToggleFav}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
}
