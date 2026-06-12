import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, PATCH } from "./route";

vi.mock("@/features/playlists/repository", () => ({
  deleteSupabasePlaylistNote: vi.fn(async () => undefined),
  requireSupabasePlaylistWriteEnv: vi.fn(() => undefined),
  updateSupabasePlaylistNote: vi.fn(async (note) => ({
    author: note.author,
    avatar: note.avatar,
    content: note.content,
    id: note.noteId,
    songId: note.songId,
    time: "10:05 AM",
  })),
}));

function buildRequest(payload?: unknown, token = "test-token") {
  return {
    headers: new Headers({ "x-playlist-import-token": token }),
    json: async () => payload,
    method: payload === undefined ? "DELETE" : "PATCH",
  } as Request;
}

function buildContext(songId = "song-001", noteId = "note-001") {
  return { params: { noteId, songId } };
}

describe("/api/playlists/songs/[songId]/notes/[noteId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PLAYLIST_IMPORT_ADMIN_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects note updates without admin auth", async () => {
    const response = await PATCH(buildRequest({ content: "hello" }, ""), buildContext());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "无权限编辑歌曲评论" });
  });

  it("updates a note", async () => {
    const repository = await import("@/features/playlists/repository");
    const response = await PATCH(buildRequest({ author: "Tester", avatar: "🎧", content: "更新后的评论" }), buildContext("song-007", "note-007"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.note).toMatchObject({
      author: "Tester",
      avatar: "🎧",
      content: "更新后的评论",
      id: "note-007",
      songId: "song-007",
    });
    expect(repository.updateSupabasePlaylistNote).toHaveBeenCalledWith({
      author: "Tester",
      avatar: "🎧",
      content: "更新后的评论",
      noteId: "note-007",
      songId: "song-007",
    });
  });

  it("rejects empty note content", async () => {
    const response = await PATCH(buildRequest({ content: "   " }), buildContext());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "请输入评论内容" });
  });

  it("deletes a note", async () => {
    const repository = await import("@/features/playlists/repository");
    const response = await DELETE(buildRequest(), buildContext("song-007", "note-007"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true });
    expect(repository.deleteSupabasePlaylistNote).toHaveBeenCalledWith({ noteId: "note-007", songId: "song-007" });
  });
});
