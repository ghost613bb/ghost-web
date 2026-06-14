// 负责 thoughts 表的业务逻辑
import { thoughts as fallbackThoughts, type Thought } from "@/data/thoughts";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/server";
import { deleteStoredThought, getStoredThoughtById, getStoredThoughtIds, listVisibleStoredThoughts, upsertStoredThought } from "./repository";
import { deleteSupabaseThought, getSupabaseThoughtById, getSupabaseThoughtIds, listVisibleSupabaseThoughts, upsertSupabaseThought } from "./supabaseRepository";

export type ThoughtDataSource = "local" | "mixed" | "supabase";

export type ThoughtPageData = {
  dataSource: ThoughtDataSource;
  thoughts: Thought[];
};

type ThoughtStorage = {
  deleteThought: (id: string) => Promise<void>;
  getThoughtById: (id: string) => Promise<Thought | null>;
  getThoughtIds: () => Promise<Set<string>>;
  listVisibleThoughts: () => Promise<Thought[]>;
  upsertThought: (thought: Thought) => Promise<void>;
};

const sqliteStorage: ThoughtStorage = {
  deleteThought: deleteStoredThought,
  getThoughtById: getStoredThoughtById,
  getThoughtIds: getStoredThoughtIds,
  listVisibleThoughts: listVisibleStoredThoughts,
  upsertThought: upsertStoredThought,
};

const supabaseStorage: ThoughtStorage = {
  deleteThought: deleteSupabaseThought,
  getThoughtById: getSupabaseThoughtById,
  getThoughtIds: getSupabaseThoughtIds,
  listVisibleThoughts: listVisibleSupabaseThoughts,
  upsertThought: upsertSupabaseThought,
};

function getThoughtStorage() {
  return hasSupabaseServiceRoleEnv() ? supabaseStorage : sqliteStorage;
}

export async function getThoughtPageData(): Promise<ThoughtPageData> {
  const storage = getThoughtStorage();
  const [storedThoughtIds, storedThoughts] = await Promise.all([storage.getThoughtIds(), storage.listVisibleThoughts()]);
  const visibleFallbackThoughts = fallbackThoughts.filter((thought) => !storedThoughtIds.has(thought.id));
  const thoughts = [...storedThoughts, ...visibleFallbackThoughts];
  const dataSource = hasSupabaseServiceRoleEnv() ? (visibleFallbackThoughts.length > 0 ? "mixed" : "supabase") : "local";

  return { dataSource, thoughts };
}

export async function listThoughts(): Promise<Thought[]> {
  return (await getThoughtPageData()).thoughts;
}

export async function getLatestThought(): Promise<Thought | null> {
  return (await listThoughts())[0] ?? null;
}

export async function getThoughtBySlug(slug: string): Promise<Thought | null> {
  return (await listThoughts()).find((thought) => thought.slug === slug) ?? null;
}

export async function createThought(thought: Thought): Promise<Thought> {
  const storage = getThoughtStorage();

  await storage.upsertThought(thought);
  return (await storage.getThoughtById(thought.id)) ?? thought;
}

export async function deleteThought(id: string): Promise<boolean> {
  const storage = getThoughtStorage();
  const [storedThought, fallbackThought] = await Promise.all([storage.getThoughtById(id), Promise.resolve(fallbackThoughts.find((thought) => thought.id === id) ?? null)]);

  if (!storedThought && !fallbackThought) {
    return false;
  }

  if (!fallbackThought) {
    await storage.deleteThought(id);
    return true;
  }

  await storage.upsertThought({
    ...(storedThought ?? fallbackThought),
    deletedAt: new Date().toISOString(),
    status: "draft",
  });
  return true;
}
