import type { BaseContent } from "@/features/content-modules/types";

export type PlaylistSong = BaseContent & {
  artist: string;
  feeling: string;
  link?: string;
};

export const playlistSongs: PlaylistSong[] = [
  {
    id: "song-001",
    title: "晚风循环曲",
    artist: "Unknown",
    description: "适合边走路边把脑袋放空。",
    feeling: "听的时候会觉得今天还可以再温柔一点。",
    tags: ["治愈", "散步"],
    visibility: "public",
    status: "published",
    sortOrder: 1,
  },
  {
    id: "song-002",
    title: "电子充电器",
    artist: "Unknown",
    description: "需要把状态拉起来时播放。",
    feeling: "像给自己插上电源，适合写代码前听。",
    tags: ["电子", "提神"],
    visibility: "public",
    status: "published",
    sortOrder: 2,
  },
];
