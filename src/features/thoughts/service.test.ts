import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Thought } from "./types";

const supabaseEnvState = vi.hoisted(() => ({
  enabled: false,
}));

const supabaseRepositoryState = vi.hoisted(() => ({
  deleteSupabaseThought: vi.fn(),
  getSupabaseThoughtById: vi.fn(),
  getSupabaseThoughtIds: vi.fn(),
  listVisibleSupabaseThoughts: vi.fn(),
  upsertSupabaseThought: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  hasSupabaseServiceRoleEnv: () => supabaseEnvState.enabled,
}));

vi.mock("./supabaseRepository", () => supabaseRepositoryState);

import { createThought, deleteThought, getLatestThought, getThoughtBySlug, getThoughtPageData, listThoughts } from "./service";

const supabaseThought: Thought = {
  id: "thought-supabase",
  title: "Supabase 里的碎碎念",
  slug: "thought-supabase",
  body: "这条内容来自 Supabase。",
  bodyText: "这条内容来自 Supabase。",
  visibility: "public",
  status: "published",
  createdAt: "2026-06-14",
  publishedAt: "2026-06-14",
  pinned: false,
  sortOrder: 1,
};

describe("thoughts service", () => {
  beforeEach(() => {
    supabaseEnvState.enabled = false;
    Object.values(supabaseRepositoryState).forEach((mock) => mock.mockReset());
  });

  it("returns an unavailable empty state when Supabase storage is not configured", async () => {
    await expect(listThoughts()).resolves.toEqual([]);
    await expect(getThoughtPageData()).resolves.toEqual({ dataSource: "unavailable", statusReason: "missing-env", thoughts: [] });
    expect(supabaseRepositoryState.listVisibleSupabaseThoughts).not.toHaveBeenCalled();
  });

  it("returns an empty state when Supabase has no visible thoughts", async () => {
    supabaseEnvState.enabled = true;
    supabaseRepositoryState.listVisibleSupabaseThoughts.mockResolvedValue([]);

    await expect(getLatestThought()).resolves.toBeNull();
    await expect(getThoughtPageData()).resolves.toEqual({ dataSource: "empty", statusReason: "empty", thoughts: [] });
  });

  it("returns Supabase thoughts when storage is configured", async () => {
    supabaseEnvState.enabled = true;
    supabaseRepositoryState.listVisibleSupabaseThoughts.mockResolvedValue([supabaseThought]);

    const result = await getThoughtPageData();

    expect(result).toEqual({ dataSource: "supabase", thoughts: [supabaseThought] });
    await expect(getThoughtBySlug("thought-supabase")).resolves.toEqual(supabaseThought);
    await expect(getLatestThought()).resolves.toEqual(supabaseThought);
  });

  it("returns an unavailable empty state when Supabase read fails", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    supabaseEnvState.enabled = true;
    supabaseRepositoryState.listVisibleSupabaseThoughts.mockRejectedValue(new Error("supabase down"));

    await expect(getThoughtPageData()).resolves.toEqual({ dataSource: "unavailable", statusReason: "read-error", thoughts: [] });
    expect(warnSpy).toHaveBeenCalledWith("supabase down");

    warnSpy.mockRestore();
  });

  it("throws a clear error when creating without Supabase storage", async () => {
    await expect(createThought(supabaseThought)).rejects.toThrow("碎碎念数据源未配置");
    expect(supabaseRepositoryState.upsertSupabaseThought).not.toHaveBeenCalled();
  });

  it("creates and reads back thoughts through Supabase storage", async () => {
    supabaseEnvState.enabled = true;
    supabaseRepositoryState.getSupabaseThoughtById.mockResolvedValueOnce(null).mockResolvedValueOnce(supabaseThought);

    await expect(createThought(supabaseThought)).resolves.toEqual(supabaseThought);
    expect(supabaseRepositoryState.upsertSupabaseThought).toHaveBeenCalledWith(supabaseThought);
  });

  it("preserves the original createdAt when updating an existing thought", async () => {
    const existingThought = { ...supabaseThought, createdAt: "2026-06-01" };
    const nextThought = { ...supabaseThought, title: "更新后的碎碎念", createdAt: "2026-06-14" };
    supabaseEnvState.enabled = true;
    supabaseRepositoryState.getSupabaseThoughtById.mockResolvedValueOnce(existingThought).mockResolvedValueOnce({ ...nextThought, createdAt: existingThought.createdAt });

    await expect(createThought(nextThought)).resolves.toEqual(expect.objectContaining({ createdAt: "2026-06-01" }));
    expect(supabaseRepositoryState.upsertSupabaseThought).toHaveBeenCalledWith({ ...nextThought, createdAt: "2026-06-01" });
  });

  it("deletes an existing Supabase thought", async () => {
    supabaseEnvState.enabled = true;
    supabaseRepositoryState.getSupabaseThoughtById.mockResolvedValue(supabaseThought);

    await expect(deleteThought("thought-supabase")).resolves.toBe(true);
    expect(supabaseRepositoryState.deleteSupabaseThought).toHaveBeenCalledWith("thought-supabase");
  });

  it("returns false when deleting a missing thought", async () => {
    supabaseEnvState.enabled = true;
    supabaseRepositoryState.getSupabaseThoughtById.mockResolvedValue(null);

    await expect(deleteThought("missing-thought")).resolves.toBe(false);
    expect(supabaseRepositoryState.deleteSupabaseThought).not.toHaveBeenCalled();
  });
});
