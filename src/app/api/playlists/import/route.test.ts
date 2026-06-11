import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/features/playlists/metadata", () => ({
  parsePlaylistAudioMetadata: vi.fn(async () => ({
    artist: "小雪",
    cover: {
      buffer: Buffer.from("cover"),
      extension: "jpg",
      mimeType: "image/jpeg",
    },
    title: "doll",
  })),
}));

vi.mock("@/features/playlists/review", () => ({
  generatePlaylistShortReview: vi.fn(async () => ({ review: "风吹过枷锁" })),
}));

vi.mock("@/features/playlists/repository", () => ({
  ensureSupabasePlaylistCollection: vi.fn(async () => undefined),
  getNextSupabasePlaylistSongSortOrder: vi.fn(async () => 8),
  insertSupabasePlaylistCollectionSongs: vi.fn(async () => undefined),
  insertSupabasePlaylistSongs: vi.fn(async () => undefined),
  requireSupabasePlaylistWriteEnv: vi.fn(() => undefined),
  uploadSupabasePlaylistAsset: vi.fn(async ({ path }: { path: string }) => `https://cdn.example.com/${path}`),
}));

function buildRequest(formData: FormData, token = "test-token") {
  return {
    formData: async () => formData,
    headers: new Headers({ "x-playlist-import-token": token }),
  } as Request;
}

describe("/api/playlists/import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PLAYLIST_IMPORT_ADMIN_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects requests without the import token", async () => {
    const formData = new FormData();
    formData.set("collectionId", "daily-moods");

    const response = await POST(buildRequest(formData, ""));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "无权限导入歌单" });
  });

  it("rejects requests with a wrong import token", async () => {
    const formData = new FormData();
    formData.set("collectionId", "daily-moods");

    const response = await POST(buildRequest(formData, "wrong-token"));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "无权限导入歌单" });
  });

  it("rejects empty import requests", async () => {
    const formData = new FormData();
    formData.set("collectionId", "daily-moods");

    const response = await POST(buildRequest(formData));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "请先选择 MP3 文件" });
  });

  it("rejects NCM files with a clear message", async () => {
    const formData = new FormData();
    formData.set("collectionId", "daily-moods");
    formData.append("audioFiles", new File(["ncm"], "song.ncm", { type: "application/octet-stream" }), "song.ncm");

    const response = await POST(buildRequest(formData));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("暂不支持直接导入 NCM");
  });

  it("imports MP3 and matching LRC files", async () => {
    const repository = await import("@/features/playlists/repository");
    const formData = new FormData();
    formData.set("collectionId", "daily-moods");
    formData.append("audioFiles", new File(["mp3"], "doll.mp3", { type: "audio/mpeg" }), "doll.mp3");
    formData.append("lyricFiles", new File(["[00:15.66]凛冽的风捶打在肩"], "doll.lrc", { type: "text/plain" }), "doll.lrc");

    const response = await POST(buildRequest(formData));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.songs[0]).toMatchObject({
      artist: "小雪",
      lyricsCount: 1,
      shortReview: "风吹过枷锁",
      title: "doll",
    });
    expect(repository.insertSupabasePlaylistSongs).toHaveBeenCalledWith([
      expect.objectContaining({
        lyrics: [{ time: 15.66, text: "凛冽的风捶打在肩" }],
        shortReview: "风吹过枷锁",
      }),
    ]);
    expect(repository.insertSupabasePlaylistCollectionSongs).toHaveBeenCalledWith("daily-moods", [expect.stringMatching(/^song-/)]);
  });
});
