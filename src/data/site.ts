import type { SiteMode } from "@/features/content-modules/types";

export const siteConfig = {
  name: "Ghost Garden",
  ownerName: "主包",
  title: "个人数字花园",
  description: "一个放下作品、日常、照片、歌单和人生清单的小宇宙。",
  oneLineIntro: "在这里收集生活碎片、学习笔记和一点古灵精怪的审美。",
  siteMode: "normal" satisfies SiteMode,
  restrictedMessage: "这部分内容暂时收起来啦。如果你想了解更多，可以给我留言备注来意。",
  links: [
    { label: "留言", href: "/message" },
    { label: "关于我", href: "/about" },
  ],
};
