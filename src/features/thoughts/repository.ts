// 负责 thoughts 表的数据库读写操作
import { asc, eq } from "drizzle-orm";
import type { Thought } from "@/data/thoughts";
import { db } from "@/lib/db/client";
import { thoughts as thoughtsTable } from "@/lib/db/schema";

type StoredThoughtRow = {
  id: string;
  title: string;
  slug: string;
  body: string;
  tags: string;
  visibility: Thought["visibility"];
  status: Thought["status"];
  createdAt: string | null;
  sortOrder: number | null;
  paperBackgroundImageUrl: string | null;
  paperBackgroundOpacity: number | null;
};

function toThought(row: StoredThoughtRow): Thought {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    body: row.body,
    tags: JSON.parse(row.tags) as string[],
    visibility: row.visibility,
    status: row.status,
    createdAt: row.createdAt ?? undefined,
    sortOrder: row.sortOrder ?? undefined,
    paperBackgroundImageUrl: row.paperBackgroundImageUrl ?? undefined,
    paperBackgroundOpacity: row.paperBackgroundOpacity ?? undefined,
  };
}

export async function listStoredThoughts(): Promise<Thought[]> {
  const rows = await db.select().from(thoughtsTable).orderBy(asc(thoughtsTable.sortOrder));
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
  await db
    .insert(thoughtsTable)
    .values({
      id: thought.id,
      title: thought.title,
      slug: thought.slug,
      body: thought.body,
      tags: JSON.stringify(thought.tags ?? []),
      visibility: thought.visibility,
      status: thought.status,
      createdAt: thought.createdAt ?? null,
      sortOrder: thought.sortOrder ?? null,
      paperBackgroundImageUrl: thought.paperBackgroundImageUrl ?? null,
      paperBackgroundOpacity: thought.paperBackgroundOpacity ?? null,
    })
    .onConflictDoUpdate({
      target: thoughtsTable.id,
      set: {
        title: thought.title,
        slug: thought.slug,
        body: thought.body,
        tags: JSON.stringify(thought.tags ?? []),
        visibility: thought.visibility,
        status: thought.status,
        createdAt: thought.createdAt ?? null,
        sortOrder: thought.sortOrder ?? null,
        paperBackgroundImageUrl: thought.paperBackgroundImageUrl ?? null,
        paperBackgroundOpacity: thought.paperBackgroundOpacity ?? null,
      },
    });
}

export async function deleteStoredThought(id: string) {
  await db.delete(thoughtsTable).where(eq(thoughtsTable.id, id));
}

export async function resetStoredThoughts() {
  await db.delete(thoughtsTable);
}
