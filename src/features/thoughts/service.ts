// 负责 thoughts 表的业务逻辑
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/server";
import { deleteSupabaseThought, getSupabaseThoughtById, getSupabaseThoughtIds, listVisibleSupabaseThoughts, upsertSupabaseThought } from "./supabaseRepository";
import type { Thought } from "./types";

export type ThoughtDataSource = "empty" | "supabase" | "unavailable";

export type ThoughtStatusReason = "empty" | "missing-env" | "read-error";

export type ThoughtPageData = {
  dataSource: ThoughtDataSource;
  statusReason?: ThoughtStatusReason;
  thoughts: Thought[];
};

function assertThoughtStorageConfigured() {
  if (!hasSupabaseServiceRoleEnv()) {
    throw new Error("碎碎念数据源未配置");
  }
}

export async function getThoughtPageData(): Promise<ThoughtPageData> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { dataSource: "unavailable", statusReason: "missing-env", thoughts: [] };
  }

  try {
    const thoughts = await listVisibleSupabaseThoughts();

    if (thoughts.length === 0) {
      return { dataSource: "empty", statusReason: "empty", thoughts };
    }

    return { dataSource: "supabase", thoughts };
  } catch (error) {
    console.warn(error instanceof Error ? error.message : "读取 Supabase 碎碎念失败");
    return { dataSource: "unavailable", statusReason: "read-error", thoughts: [] };
  }
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
  assertThoughtStorageConfigured();
  const existingThought = await getSupabaseThoughtById(thought.id);

  await upsertSupabaseThought(existingThought ? { ...thought, createdAt: existingThought.createdAt } : thought);
  return (await getSupabaseThoughtById(thought.id)) ?? thought;
}

export async function deleteThought(id: string): Promise<boolean> {
  assertThoughtStorageConfigured();
  const existingThought = await getSupabaseThoughtById(id);

  if (!existingThought) {
    return false;
  }

  await deleteSupabaseThought(id);
  return true;
}

export async function getThoughtIds(): Promise<Set<string>> {
  assertThoughtStorageConfigured();
  return getSupabaseThoughtIds();
}
