// 专门解析和校验创建 thought 的请求体
import type { Thought } from "@/data/thoughts";

const thoughtVisibilities = ["public", "private", "interview_hidden", "masked"] as const;
const thoughtStatuses = ["draft", "published"] as const;

function isThoughtVisibility(value: unknown): value is Thought["visibility"] {
  return typeof value === "string" && thoughtVisibilities.includes(value as Thought["visibility"]);
}

function isThoughtStatus(value: unknown): value is Thought["status"] {
  return typeof value === "string" && thoughtStatuses.includes(value as Thought["status"]);
}

function normalizePaperBackgroundImageUrl(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || value.startsWith("blob:") || (!value.startsWith("/") && !value.startsWith("data:image/"))) {
    throw new Error("thought 参数不合法");
  }

  return value;
}

function normalizePaperBackgroundOpacity(value: unknown, hasBackground: boolean) {
  if (!hasBackground) {
    return undefined;
  }

  if (value === undefined || value === null) {
    return 52;
  }

  if (typeof value !== "number" || value < 0 || value > 100) {
    throw new Error("thought 参数不合法");
  }

  return value;
}

export function parseCreateThought(body: unknown): Thought {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new Error("请求体必须是对象");
  }

  const thought = body as Partial<Thought>;

  if (typeof thought.id !== "string" || thought.id.length === 0) {
    throw new Error("thought 参数不合法");
  }

  if (typeof thought.title !== "string" || thought.title.length === 0) {
    throw new Error("thought 参数不合法");
  }

  if (typeof thought.slug !== "string" || thought.slug.length === 0) {
    throw new Error("thought 参数不合法");
  }

  if (typeof thought.body !== "string" || thought.body.length === 0) {
    throw new Error("thought 参数不合法");
  }

  if (!Array.isArray(thought.tags) || !thought.tags.every((tag) => typeof tag === "string")) {
    throw new Error("thought 参数不合法");
  }

  if (!isThoughtVisibility(thought.visibility)) {
    throw new Error("thought 参数不合法");
  }

  if (!isThoughtStatus(thought.status)) {
    throw new Error("thought 参数不合法");
  }

  if (thought.createdAt !== undefined && thought.createdAt !== null && typeof thought.createdAt !== "string") {
    throw new Error("thought 参数不合法");
  }

  if (thought.sortOrder !== undefined && thought.sortOrder !== null && typeof thought.sortOrder !== "number") {
    throw new Error("thought 参数不合法");
  }

  const paperBackgroundImageUrl = normalizePaperBackgroundImageUrl(thought.paperBackgroundImageUrl);
  const paperBackgroundOpacity = normalizePaperBackgroundOpacity(thought.paperBackgroundOpacity, Boolean(paperBackgroundImageUrl));

  return {
    id: thought.id,
    title: thought.title,
    slug: thought.slug,
    body: thought.body,
    tags: thought.tags,
    visibility: thought.visibility,
    status: thought.status,
    createdAt: thought.createdAt,
    sortOrder: thought.sortOrder,
    paperBackgroundImageUrl,
    paperBackgroundOpacity,
  };
}
