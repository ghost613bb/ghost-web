import type { BaseContent } from "@/features/content-modules/types";

export type AlbumPhoto = BaseContent & {
  location?: string;
  story: string;
  color: string;
};

export const albumPhotos: AlbumPhoto[] = [
  {
    id: "photo-001",
    title: "窗边的绿",
    description: "某个下午光刚好落在叶子上。",
    story: "这类照片适合放在网站里提醒自己：生活不是只有效率。",
    location: "日常",
    color: "from-emerald-300 to-cyan-400",
    tags: ["生活", "植物"],
    visibility: "public",
    status: "published",
    sortOrder: 1,
  },
  {
    id: "photo-002",
    title: "夜色里的霓虹",
    description: "像首页小镇会用到的颜色参考。",
    story: "多巴胺不一定要吵，也可以是黑夜里小面积的亮色。",
    location: "城市",
    color: "from-fuchsia-400 to-violet-500",
    tags: ["灵感", "霓虹"],
    visibility: "public",
    status: "published",
    sortOrder: 2,
  },
];
