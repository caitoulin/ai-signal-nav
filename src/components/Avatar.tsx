import { AVATAR_HUES } from "../types";

/**
 * 字母头像：用名称哈希稳定取色，零外部依赖（不请求 favicon）。
 */
export function Avatar({ name }: { name: string }) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  const bg = AVATAR_HUES[hash % AVATAR_HUES.length];

  const first = name[0] ?? "?";
  const text = /[a-zA-Z]/.test(first) ? first.toUpperCase() : first;

  return (
    <span className="av" style={{ background: bg }} aria-hidden="true">
      {text}
    </span>
  );
}
