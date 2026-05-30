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
  };
}

export async function listStoredThoughts(): Promise<Thought[]> {
  const rows = await db.select().from(thoughtsTable).orderBy(asc(thoughtsTable.sortOrder));
  return rows.map((row) => toThought(row));
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
      },
    });
}

export async function resetStoredThoughts() {
  await db.delete(thoughtsTable).where(eq(thoughtsTable.id, thoughtsTable.id));
}
