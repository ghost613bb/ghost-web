import type { BaseContent } from "@/features/content-modules/types";

export type AlbumCollection = BaseContent & {
  coverTone: string;
  coverEmoji: string;
  photoCount: number;
};

export const albumCollections: AlbumCollection[] = [
  {
    id: "album-001",
    title: "我的相册",
    description: "诗注：小妞写，图片，女孩子的碎片收藏。",
    coverTone: "bg-rose-200",
    coverEmoji: "👧🏻",
    photoCount: 22,
    visibility: "public",
    status: "published",
    createdAt: "2023-07-31",
    sortOrder: 1,
  },
  {
    id: "album-002",
    title: "我的相册",
    description: "诗注：小妞写，图片，女孩子的慢节奏角落。",
    coverTone: "bg-orange-100",
    coverEmoji: "🐷",
    photoCount: 12,
    visibility: "public",
    status: "published",
    createdAt: "2023-07-31",
    sortOrder: 2,
  },
  {
    id: "album-003",
    title: "我的相册",
    description: "诗注：小妞写，图片，女孩子与编发的故事。",
    coverTone: "bg-rose-100",
    coverEmoji: "👧🏼",
    photoCount: 12,
    visibility: "public",
    status: "published",
    createdAt: "2023-07-31",
    sortOrder: 3,
  },
  {
    id: "album-004",
    title: "我的相册",
    description: "荷注：小妞呀，图片，女孩子的可爱存档。",
    coverTone: "bg-red-100",
    coverEmoji: "🐽",
    photoCount: 18,
    visibility: "public",
    status: "published",
    createdAt: "2023-07-31",
    sortOrder: 4,
  },
  {
    id: "album-005",
    title: "我的相册",
    description: "荷注：小妞呀，图片，今天也有好天气。",
    coverTone: "bg-amber-100",
    coverEmoji: "🐶",
    photoCount: 16,
    visibility: "public",
    status: "published",
    createdAt: "2023-07-31",
    sortOrder: 5,
  },
  {
    id: "album-006",
    title: "我的相册",
    description: "荷注：小妞呀，图片，兔兔一样软绵绵。",
    coverTone: "bg-pink-100",
    coverEmoji: "🐰",
    photoCount: 9,
    visibility: "public",
    status: "published",
    createdAt: "2023-07-31",
    sortOrder: 6,
  },
];
