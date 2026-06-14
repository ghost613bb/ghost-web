// 负责 thoughts 表的业务逻辑
import { thoughts as fallbackThoughts, type Thought } from "@/data/thoughts";
import { deleteStoredThought, getStoredThoughtById, getStoredThoughtIds, listVisibleStoredThoughts, upsertStoredThought } from "./repository";

export async function listThoughts(): Promise<Thought[]> {
  const [storedThoughtIds, storedThoughts] = await Promise.all([getStoredThoughtIds(), listVisibleStoredThoughts()]);
  const visibleFallbackThoughts = fallbackThoughts.filter((thought) => !storedThoughtIds.has(thought.id));

  return [...storedThoughts, ...visibleFallbackThoughts];
}

export async function getLatestThought(): Promise<Thought | null> {
  return (await listThoughts())[0] ?? null;
}

export async function getThoughtBySlug(slug: string): Promise<Thought | null> {
  return (await listThoughts()).find((thought) => thought.slug === slug) ?? null;
}

export async function createThought(thought: Thought): Promise<Thought> {
  await upsertStoredThought(thought);
  return (await getStoredThoughtById(thought.id)) ?? thought;
}

export async function deleteThought(id: string): Promise<boolean> {
  const [storedThought, fallbackThought] = await Promise.all([getStoredThoughtById(id), Promise.resolve(fallbackThoughts.find((thought) => thought.id === id) ?? null)]);

  if (!storedThought && !fallbackThought) {
    return false;
  }

  if (!fallbackThought) {
    await deleteStoredThought(id);
    return true;
  }

  await upsertStoredThought({
    ...(storedThought ?? fallbackThought),
    deletedAt: new Date().toISOString(),
    status: "draft",
  });
  return true;
}
