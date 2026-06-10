import { beforeEach, describe, expect, it, vi } from "vitest";
import { featuredPlaylistSongId, playlistCollections, playlistNotes, playlistSongs } from "@/data/playlists";

const supabaseEnvState = vi.hoisted(() => ({
  enabled: false,
}));

const supabaseDataState = vi.hoisted(() => ({
  getSupabasePlaylistData: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  hasSupabaseServerEnv: () => supabaseEnvState.enabled,
}));

vi.mock("./repository", () => ({
  getSupabasePlaylistData: supabaseDataState.getSupabasePlaylistData,
}));

import { getPlaylistPageData, getStaticPlaylistPageData } from "./service";

describe("playlist service", () => {
  beforeEach(() => {
    supabaseEnvState.enabled = false;
    supabaseDataState.getSupabasePlaylistData.mockReset();
  });

  it("returns static playlist data when Supabase env is not configured", async () => {
    await expect(getPlaylistPageData()).resolves.toEqual(getStaticPlaylistPageData());
    expect(supabaseDataState.getSupabasePlaylistData).not.toHaveBeenCalled();
  });

  it("returns Supabase playlist data when it is available", async () => {
    supabaseEnvState.enabled = true;
    supabaseDataState.getSupabasePlaylistData.mockResolvedValue({
      collections: playlistCollections,
      notes: playlistNotes,
      songs: playlistSongs,
    });

    const data = await getPlaylistPageData();

    expect(data.songs).toBe(playlistSongs);
    expect(data.collections).toBe(playlistCollections);
    expect(data.notes).toBe(playlistNotes);
    expect(data.featuredSongId).toBe(playlistCollections[0].songIds[0]);
    expect(data.playerSnapshot.currentTime).toBe("0:00");
    expect(data.playerSnapshot.progressPercent).toBe(0);
    expect(data.playerSnapshot.statusLabel).toBe("正在循环 Daily Moods");
  });

  it("falls back to static playlist data when Supabase has no usable data", async () => {
    supabaseEnvState.enabled = true;
    supabaseDataState.getSupabasePlaylistData.mockResolvedValue({
      collections: [],
      notes: [],
      songs: [],
    });

    const data = await getPlaylistPageData();

    expect(data.featuredSongId).toBe(featuredPlaylistSongId);
    expect(data.songs).toBe(playlistSongs);
    expect(data.collections).toBe(playlistCollections);
  });

  it("falls back to static playlist data when Supabase read fails", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    supabaseEnvState.enabled = true;
    supabaseDataState.getSupabasePlaylistData.mockRejectedValue(new Error("network failed"));

    const data = await getPlaylistPageData();

    expect(data.featuredSongId).toBe(featuredPlaylistSongId);
    expect(data.songs).toBe(playlistSongs);
    expect(warnSpy).toHaveBeenCalledWith("network failed");
  });
});
