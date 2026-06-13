import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH } from "./route";

vi.mock("@/features/playlists/repository", () => ({
  ensureSupabasePlaylistCollection: vi.fn(async () => undefined),
  getSupabasePlaylistCollectionSongIds: vi.fn(async (collectionId: string) => (collectionId === "daily-moods" ? ["song-3"] : ["song-4", "song-2", "song-1"])),
  moveSupabasePlaylistCollectionSongs: vi.fn(async () => ({
    insertedSongIds: ["song-1"],
    movedSongIds: ["song-1", "song-2"],
    skippedSongIds: ["song-2"],
    sourceSongIds: ["song-3"],
    targetSongIds: ["song-4", "song-2", "song-1"],
  })),
  removeSupabasePlaylistCollectionSongs: vi.fn(async () => ["song-1", "song-2"]),
  requireSupabasePlaylistWriteEnv: vi.fn(() => undefined),
}));

function buildRequest(payload: unknown, token = "test-token") {
  return {
    headers: new Headers({ "x-playlist-import-token": token }),
    json: async () => payload,
    method: "PATCH",
  } as Request;
}

function buildContext(collectionId = "daily-moods") {
  return { params: Promise.resolve({ collectionId }) };
}

describe("/api/playlists/collections/[collectionId]/songs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PLAYLIST_IMPORT_ADMIN_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects song management without admin auth", async () => {
    const response = await PATCH(buildRequest({ action: "remove", songIds: ["song-1"] }, ""), buildContext());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "无权限管理歌单歌曲" });
  });

  it("rejects invalid actions", async () => {
    const response = await PATCH(buildRequest({ action: "archive", songIds: ["song-1"] }), buildContext());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "请选择有效的批量操作" });
  });

  it("rejects empty song selections", async () => {
    const response = await PATCH(buildRequest({ action: "remove", songIds: [" "] }), buildContext());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "请选择要管理的歌曲" });
  });

  it("removes songs from a playlist collection", async () => {
    const repository = await import("@/features/playlists/repository");
    const response = await PATCH(buildRequest({ action: "remove", songIds: [" song-1 ", "song-1", "song-2"] }), buildContext("daily-moods"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      action: "remove",
      collectionId: "daily-moods",
      ok: true,
      removedSongIds: ["song-1", "song-2"],
      sourceSongIds: ["song-3"],
    });
    expect(repository.ensureSupabasePlaylistCollection).toHaveBeenCalledWith("daily-moods");
    expect(repository.removeSupabasePlaylistCollectionSongs).toHaveBeenCalledWith("daily-moods", ["song-1", "song-2"]);
    expect(repository.getSupabasePlaylistCollectionSongIds).toHaveBeenCalledWith("daily-moods");
  });

  it("rejects moves without a target collection", async () => {
    const response = await PATCH(buildRequest({ action: "move", songIds: ["song-1"] }), buildContext());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "请选择目标歌单" });
  });

  it("rejects moves into the current collection", async () => {
    const response = await PATCH(buildRequest({ action: "move", songIds: ["song-1"], targetCollectionId: "daily-moods" }), buildContext("daily-moods"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "请选择另一个目标歌单" });
  });

  it("moves songs into another playlist collection", async () => {
    const repository = await import("@/features/playlists/repository");
    const response = await PATCH(buildRequest({ action: "move", songIds: [" song-1 ", "song-2"], targetCollectionId: "coding-spark" }), buildContext("daily-moods"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      action: "move",
      insertedSongIds: ["song-1"],
      movedSongIds: ["song-1", "song-2"],
      ok: true,
      skippedSongIds: ["song-2"],
      sourceCollectionId: "daily-moods",
      sourceSongIds: ["song-3"],
      targetCollectionId: "coding-spark",
      targetSongIds: ["song-4", "song-2", "song-1"],
    });
    expect(repository.ensureSupabasePlaylistCollection).toHaveBeenCalledWith("daily-moods");
    expect(repository.ensureSupabasePlaylistCollection).toHaveBeenCalledWith("coding-spark");
    expect(repository.moveSupabasePlaylistCollectionSongs).toHaveBeenCalledWith({
      songIds: ["song-1", "song-2"],
      sourceCollectionId: "daily-moods",
      targetCollectionId: "coding-spark",
    });
  });
});
