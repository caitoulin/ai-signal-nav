export interface Category {
  id: string;
  label: string;
  hint: string;
  color: string;
}

export interface Site {
  /** 名称 */
  name: string;
  /** 链接 */
  url: string;
  /** 一句话说明 */
  desc: string;
  /** 分类 id，对应 CATEGORIES[].id */
  cat: string;
  /** 是否为当前热门 */
  hot: boolean;
}

/** 「收藏」伪分类 id（不是真实分类） */
export const FAVORITES = "__fav__";

/** 字母头像底色候选，按名称哈希取用 */
export const AVATAR_HUES = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#0891b2",
  "#059669",
  "#ca8a04",
  "#dc2626",
  "#4f46e5",
  "#0d9488",
];
