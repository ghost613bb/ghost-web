import type { Thought } from "@/data/thoughts";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { thoughtBodyToPlainText } from "./text";

type SupabaseThoughtRow = {
  body: string;
  body_text: string | null;
  cover_image_url: string | null;
  created_at: string | null;
  deleted_at: string | null;
  excerpt: string | null;
  id: string;
  paper_background_image_url: string | null;
  paper_background_opacity: number | null;
  pinned: boolean | null;
  published_at: string | null;
  slug: string;
  sort_order: number | null;
  status: Thought["status"];
  tags: unknown;
  title: string;
  updated_at: string | null;
  visibility: Thought["visibility"];
};

const thoughtColumns =
  "id,title,slug,body,body_text,excerpt,tags,cover_image_url,visibility,status,pinned,sort_order,published_at,created_at,updated_at,deleted_at,paper_background_image_url,paper_background_opacity";

function parseSupabaseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is string => typeof tag === "string");
  }

  if (typeof tags === "string") {
    try {
      const parsedTags = JSON.parse(tags) as unknown;
      return Array.isArray(parsedTags) ? parsedTags.filter((tag): tag is string => typeof tag === "string") : [];
    } catch {
      return [];
    }
  }

  return [];
}

function toThought(row: SupabaseThoughtRow): Thought {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    body: row.body,
    bodyText: row.body_text || thoughtBodyToPlainText(row.body),
    coverImageUrl: row.cover_image_url ?? undefined,
    createdAt: row.created_at ?? undefined,
    deletedAt: row.deleted_at ?? undefined,
    excerpt: row.excerpt ?? undefined,
    tags: parseSupabaseTags(row.tags),
    visibility: row.visibility,
    status: row.status,
    pinned: row.pinned ?? false,
    publishedAt: row.published_at ?? undefined,
    sortOrder: row.sort_order ?? undefined,
    updatedAt: row.updated_at ?? undefined,
    paperBackgroundImageUrl: row.paper_background_image_url ?? undefined,
    paperBackgroundOpacity: row.paper_background_opacity ?? undefined,
  };
}

function toSupabaseThoughtRow(thought: Thought) {
  const now = new Date().toISOString();
  const createdAt = thought.createdAt ?? now;
  const updatedAt = thought.updatedAt ?? now;

  return {
    id: thought.id,
    title: thought.title,
    slug: thought.slug,
    body: thought.body,
    body_text: thought.bodyText ?? thoughtBodyToPlainText(thought.body),
    excerpt: thought.excerpt ?? null,
    tags: thought.tags ?? [],
    cover_image_url: thought.coverImageUrl ?? null,
    visibility: thought.visibility,
    status: thought.status,
    pinned: thought.pinned ?? false,
    sort_order: thought.sortOrder ?? null,
    published_at: thought.publishedAt ?? (thought.status === "published" ? createdAt : null),
    created_at: createdAt,
    updated_at: updatedAt,
    deleted_at: thought.deletedAt ?? null,
    paper_background_image_url: thought.paperBackgroundImageUrl ?? null,
    paper_background_opacity: thought.paperBackgroundOpacity ?? null,
  };
}

function throwSupabaseError(context: string, error: { message: string } | null) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

export async function listSupabaseThoughts(): Promise<Thought[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("thoughts").select(thoughtColumns).is("deleted_at", null).order("sort_order", { ascending: true });

  throwSupabaseError("读取 Supabase 碎碎念失败", error);

  return ((data ?? []) as SupabaseThoughtRow[]).map((row) => toThought(row));
}

export async function listVisibleSupabaseThoughts(): Promise<Thought[]> {
  return (await listSupabaseThoughts()).filter((thought) => thought.status !== "draft");
}

export async function getSupabaseThoughtById(id: string): Promise<Thought | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("thoughts").select(thoughtColumns).eq("id", id).maybeSingle();

  throwSupabaseError("读取 Supabase 碎碎念失败", error);

  return data ? toThought(data as SupabaseThoughtRow) : null;
}

export async function getSupabaseThoughtIds(): Promise<Set<string>> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("thoughts").select("id");

  throwSupabaseError("读取 Supabase 碎碎念 ID 失败", error);

  return new Set(((data ?? []) as { id: string }[]).map((row) => row.id));
}

export async function upsertSupabaseThought(thought: Thought) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from("thoughts").upsert(toSupabaseThoughtRow(thought), { onConflict: "id" });

  throwSupabaseError("写入 Supabase 碎碎念失败", error);
}

export async function deleteSupabaseThought(id: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from("thoughts").delete().eq("id", id);

  throwSupabaseError("删除 Supabase 碎碎念失败", error);
}
