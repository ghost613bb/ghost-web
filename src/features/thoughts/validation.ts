// 专门解析和校验创建 thought 的请求体
import type { Thought } from "@/features/thoughts/types";
import { thoughtBodyToPlainText } from "./text";

const thoughtVisibilities = ["public", "private", "interview_hidden", "masked"] as const;
const thoughtStatuses = ["draft", "published"] as const;

function isThoughtVisibility(value: unknown): value is Thought["visibility"] {
  return typeof value === "string" && thoughtVisibilities.includes(value as Thought["visibility"]);
}

function isThoughtStatus(value: unknown): value is Thought["status"] {
  return typeof value === "string" && thoughtStatuses.includes(value as Thought["status"]);
}

function normalizeOptionalString(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error("thought 参数不合法");
  }

  return value;
}

function normalizeOptionalDateString(value: unknown) {
  return normalizeOptionalString(value);
}

function normalizeAssetUrl(value: unknown) {
  const url = normalizeOptionalString(value);

  if (!url) {
    return undefined;
  }

  if (url.startsWith("blob:") || (!url.startsWith("/") && !url.startsWith("data:image/"))) {
    throw new Error("thought 参数不合法");
  }

  return url;
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

function normalizeBoolean(value: unknown) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "boolean") {
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

  if (!isThoughtVisibility(thought.visibility)) {
    throw new Error("thought 参数不合法");
  }

  if (!isThoughtStatus(thought.status)) {
    throw new Error("thought 参数不合法");
  }

  if (thought.sortOrder !== undefined && thought.sortOrder !== null && typeof thought.sortOrder !== "number") {
    throw new Error("thought 参数不合法");
  }

  const bodyText = normalizeOptionalString(thought.bodyText) ?? thoughtBodyToPlainText(thought.body);
  const coverImageUrl = normalizeAssetUrl(thought.coverImageUrl);
  const paperBackgroundImageUrl = normalizeAssetUrl(thought.paperBackgroundImageUrl);
  const paperBackgroundOpacity = normalizePaperBackgroundOpacity(thought.paperBackgroundOpacity, Boolean(paperBackgroundImageUrl));

  return {
    id: thought.id,
    title: thought.title,
    slug: thought.slug,
    body: thought.body,
    bodyText,
    coverImageUrl,
    createdAt: normalizeOptionalDateString(thought.createdAt),
    deletedAt: normalizeOptionalDateString(thought.deletedAt),
    excerpt: normalizeOptionalString(thought.excerpt),
    visibility: thought.visibility,
    status: thought.status,
    pinned: normalizeBoolean(thought.pinned),
    publishedAt: normalizeOptionalDateString(thought.publishedAt),
    sortOrder: thought.sortOrder,
    updatedAt: normalizeOptionalDateString(thought.updatedAt),
    paperBackgroundImageUrl,
    paperBackgroundOpacity,
  };
}
