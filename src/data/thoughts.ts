import type { BaseContent } from "@/features/content-modules/types";

export type Thought = Omit<BaseContent, "description" | "tags"> & {
  slug: string;
  body: string;
  bodyText?: string;
  coverImageUrl?: string;
  deletedAt?: string;
  excerpt?: string;
  paperBackgroundImageUrl?: string;
  paperBackgroundOpacity?: number;
  pinned?: boolean;
  publishedAt?: string;
};

export const thoughts: Thought[] = [
  {
    id: "thought-001",
    title: "先把网站做成一个会发光的小镇",
    slug: "glowing-town",
    body: "个人网站的第一步，是先让访客知道这里和模板站不一样。后台、数据库和复杂权限都很重要，但第一眼的记忆点会决定我有没有动力继续把它养大。",
    visibility: "public",
    status: "published",
    createdAt: "2026-05-13",
    sortOrder: 1,
  },
  {
    id: "thought-002",
    title: "面试模式存在的原因",
    slug: "interview-mode",
    body: "有些内容不是不能公开，而是不适合在所有场景公开。面试模式不是把自己藏起来，而是给不同访问场景一个更舒服的边界。",
    visibility: "interview_hidden",
    status: "published",
    createdAt: "2026-05-12",
    sortOrder: 2,
  },
];
