// 负责 thoughts 表的业务逻辑
import { thoughts as fallbackThoughts, type Thought } from "@/data/thoughts";
import { listStoredThoughts } from "./repository";

export async function listThoughts(): Promise<Thought[]> {
  const storedThoughts = await listStoredThoughts();

  if (storedThoughts.length > 0) {
    return storedThoughts;
  }

  return fallbackThoughts;
}

export async function getLatestThought(): Promise<Thought | null> {
  return (await listThoughts())[0] ?? null;
}
