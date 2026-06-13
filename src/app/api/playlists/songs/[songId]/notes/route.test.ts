import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/features/playlists/repository", () => ({
  ensureSupabasePlaylistSong: vi.fn(async () => undefined),
  insertSupabasePlaylistNote: vi.fn(async (note) => ({
    author: note.author,
    avatar: note.avatar,
    content: note.content,
    id: note.id,
    songId: note.songId,
    time: "10:05 AM",
  })),
  requireSupabasePlaylistWriteEnv: vi.fn(() => undefined),
}));

function buildRequest(payload: unknown, token = "test-token") {
  return {
    headers: new Headers({ "x-playlist-import-token": token }),
    json: async () => payload,
  } as Request;
}

function buildContext(songId = "song-001") {
  return { params: { songId } };
}

describe("/api/playlists/songs/[songId]/notes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PLAYLIST_IMPORT_ADMIN_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects requests without the import token", async () => {
    const response = await POST(buildRequest({ content: "hello" }, ""), buildContext());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "无权限新增歌曲评论" });
  });

  it("rejects requests with a wrong import token", async () => {
    const response = await POST(buildRequest({ content: "hello" }, "wrong-token"), buildContext());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "无权限新增歌曲评论" });
  });

  it("rejects empty comments", async () => {
    const response = await POST(buildRequest({ content: "   " }), buildContext());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "请输入评论内容" });
  });

  it("rejects overly long comments", async () => {
    const response = await POST(buildRequest({ content: "好".repeat(281) }), buildContext());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "评论内容不能超过 280 个字符" });
  });

  it("creates a note for the route song id", async () => {
    const repository = await import("@/features/playlists/repository");
    const response = await POST(
      buildRequest({
        author: "Ranima",
        avatar: "🐰",
        content: "适合今晚循环。",
      }),
      buildContext("song-007"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.note).toMatchObject({
      author: "Ranima",
      avatar: "🎧",
      content: "适合今晚循环。",
      songId: "song-007",
    });
    expect(repository.ensureSupabasePlaylistSong).toHaveBeenCalledWith("song-007");
    expect(repository.insertSupabasePlaylistNote).toHaveBeenCalledWith(
      expect.objectContaining({
        author: "Ranima",
        avatar: "🎧",
        content: "适合今晚循环。",
        songId: "song-007",
      }),
    );
  });
});
