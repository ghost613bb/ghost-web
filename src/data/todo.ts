import type { BaseContent } from "@/features/content-modules/types";

export type LifeTodo = BaseContent & {
  category: string;
  state: "planned" | "completed";
  completedAt?: string;
  reflection?: string;
};

export const lifeTodos: LifeTodo[] = [
  {
    id: "todo-001",
    title: "做一个真正像自己的个人网站",
    description: "不是简历模板，而是能长期记录的数字花园。",
    category: "创造",
    state: "planned",
    tags: ["网站", "作品"],
    visibility: "public",
    status: "published",
    sortOrder: 1,
  },
  {
    id: "todo-002",
    title: "系统学习 Next.js",
    description: "把前端、全栈和部署链路串起来。",
    category: "技能",
    state: "planned",
    tags: ["Next.js", "学习"],
    visibility: "public",
    status: "published",
    sortOrder: 2,
  },
];
