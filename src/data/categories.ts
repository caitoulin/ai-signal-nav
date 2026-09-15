import type { Category } from "../types";

export const CATEGORIES: Category[] = [
  { id: "signal", label: "状态与信号", hint: "实时追踪：额度重置 / 模型发布 / 服务状态", color: "#0d9488" },
  { id: "free", label: "AI 免费额度", hint: "真免费档（非试用）· 额度写清 · 至少可用一年", color: "#16a34a" },
  { id: "chat", label: "对话与模型", hint: "通用大模型与对话产品", color: "#2563eb" },
  { id: "code", label: "AI 编程", hint: "编码助手、IDE 与代码生成", color: "#7c3aed" },
  { id: "image", label: "图像生成", hint: "文生图、改图、设计稿", color: "#db2777" },
  { id: "video", label: "视频生成", hint: "文生视频、数字人、动效", color: "#ea580c" },
  { id: "audio", label: "音频与音乐", hint: "语音合成、音乐生成、转录", color: "#0891b2" },
  { id: "agent", label: "Agent 与开发", hint: "智能体框架、编排、运行沙箱", color: "#4f46e5" },
  { id: "research", label: "检索与研究", hint: "深度检索、文献问答、报告", color: "#059669" },
  { id: "paper", label: "学术与论文", hint: "预印本、论文库、引用网络", color: "#65a30d" },
  { id: "rank", label: "榜单与基准", hint: "模型排行、评测基准、价格对比", color: "#ca8a04" },
  { id: "news", label: "资讯与热点", hint: "行业媒体、日报、博客", color: "#dc2626" },
  { id: "tool", label: "工具与资源", hint: "模型托管、本地部署、MCP、提示词", color: "#475569" },
  { id: "local", label: "国内与中文", hint: "国内可直接访问的产品与社区", color: "#e11d48" },
  { id: "nav", label: "同类导航", hint: "其他 AI 导航与聚合站", color: "#64748b" },
];
