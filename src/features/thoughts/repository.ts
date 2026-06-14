// 负责 thoughts 表的数据库读写操作
import { asc, eq, isNull } from "drizzle-orm";
import type { Thought } from "@/data/thoughts";
import { db } from "@/lib/db/client";
import { thoughts as thoughtsTable } from "@/lib/db/schema";
import { thoughtBodyToPlainText } from "./text";

type StoredThoughtRow = {
  body: string;
  bodyText: string;
  coverImageUrl: string | null;
  createdAt: string;
  deletedAt: string | null;
  excerpt: string | null;
  id: string;
  paperBackgroundImageUrl: string | null;
  paperBackgroundOpacity: number | null;
  pinned: boolean;
  publishedAt: string | null;
  slug: string;
  sortOrder: number | null;
  status: Thought["status"];
  tags: string;
  title: string;
  updatedAt: string;
  visibility: Thought["visibility"];
};

function parseStoredTags(tags: string): string[] {
  try {
    const parsedTags = JSON.parse(tags) as unknown;
    return Array.isArray(parsedTags) ? parsedTags.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

function toThought(row: StoredThoughtRow): Thought {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    body: row.body,
    bodyText: row.bodyText || thoughtBodyToPlainText(row.body),
    coverImageUrl: row.coverImageUrl ?? undefined,
    createdAt: row.createdAt || undefined,
    deletedAt: row.deletedAt ?? undefined,
    excerpt: row.excerpt ?? undefined,
    tags: parseStoredTags(row.tags),
    visibility: row.visibility,
    status: row.status,
    pinned: row.pinned,
    publishedAt: row.publishedAt ?? undefined,
    sortOrder: row.sortOrder ?? undefined,
    updatedAt: row.updatedAt || undefined,
    paperBackgroundImageUrl: row.paperBackgroundImageUrl ?? undefined,
    paperBackgroundOpacity: row.paperBackgroundOpacity ?? undefined,
  };
}

function normalizeThoughtForStorage(thought: Thought) {
  const now = new Date().toISOString();
  const bodyText = thought.bodyText ?? thoughtBodyToPlainText(thought.body);
  const createdAt = thought.createdAt ?? now;
  const updatedAt = thought.updatedAt ?? now;
  const publishedAt = thought.publishedAt ?? (thought.status === "published" ? createdAt : null);

  return {
    id: thought.id,
    title: thought.title,
    slug: thought.slug,
    body: thought.body,
    bodyText,
    excerpt: thought.excerpt ?? null,
    tags: JSON.stringify(thought.tags ?? []),
    coverImageUrl: thought.coverImageUrl ?? null,
    visibility: thought.visibility,
    status: thought.status,
    pinned: thought.pinned ?? false,
    sortOrder: thought.sortOrder ?? null,
    publishedAt,
    createdAt,
    updatedAt,
    deletedAt: thought.deletedAt ?? null,
    paperBackgroundImageUrl: thought.paperBackgroundImageUrl ?? null,
    paperBackgroundOpacity: thought.paperBackgroundOpacity ?? null,
  };
}

export async function listStoredThoughts(): Promise<Thought[]> {
  const rows = await db.select().from(thoughtsTable).where(isNull(thoughtsTable.deletedAt)).orderBy(asc(thoughtsTable.sortOrder));
  return rows.map((row) => toThought(row));
}

export async function listVisibleStoredThoughts(): Promise<Thought[]> {
  return (await listStoredThoughts()).filter((thought) => thought.status !== "draft");
}

export async function getStoredThoughtById(id: string): Promise<Thought | null> {
  const rows = await db.select().from(thoughtsTable).where(eq(thoughtsTable.id, id)).limit(1);
  return rows[0] ? toThought(rows[0]) : null;
}

export async function getStoredThoughtIds(): Promise<Set<string>> {
  const rows = await db.select({ id: thoughtsTable.id }).from(thoughtsTable);
  return new Set(rows.map((row) => row.id));
}

export async function upsertStoredThought(thought: Thought) {
  const row = normalizeThoughtForStorage(thought);

  await db.insert(thoughtsTable).values(row).onConflictDoUpdate({
    target: thoughtsTable.id,
    set: {
      title: row.title,
      slug: row.slug,
      body: row.body,
      bodyText: row.bodyText,
      excerpt: row.excerpt,
      tags: row.tags,
      coverImageUrl: row.coverImageUrl,
      visibility: row.visibility,
      status: row.status,
      pinned: row.pinned,
      sortOrder: row.sortOrder,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      paperBackgroundImageUrl: row.paperBackgroundImageUrl,
      paperBackgroundOpacity: row.paperBackgroundOpacity,
    },
  });
}

export async function deleteStoredThought(id: string) {
  await db.delete(thoughtsTable).where(eq(thoughtsTable.id, id));
}

export async function resetStoredThoughts() {
  await db.delete(thoughtsTable);
}
