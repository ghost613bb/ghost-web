import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, PATCH } from "./route";

vi.mock("@/features/playlists/repository", () => ({
  deleteSupabasePlaylistCollection: vi.fn(async () => undefined),
  requireSupabasePlaylistWriteEnv: vi.fn(() => undefined),
  updateSupabasePlaylistCollection: vi.fn(async (collection) => ({
    accentClass: collection.accentClass,
    description: collection.description,
    emoji: collection.emoji,
    id: collection.id,
    songIds: [],
    title: collection.title,
  })),
}));

function buildRequest(payload?: unknown, token = "test-token") {
  return {
    headers: new Headers({ "x-playlist-import-token": token }),
    json: async () => payload,
    method: payload === undefined ? "DELETE" : "PATCH",
  } as Request;
}

function buildContext(collectionId = "daily-moods") {
  return { params: Promise.resolve({ collectionId }) };
}

describe("/api/playlists/collections/[collectionId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PLAYLIST_IMPORT_ADMIN_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects collection updates without admin auth", async () => {
    const response = await PATCH(buildRequest({ title: "新名字" }, ""), buildContext());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "无权限编辑歌单" });
  });

  it("updates a playlist collection", async () => {
    const repository = await import("@/features/playlists/repository");
    const response = await PATCH(
      buildRequest({
        accentClass: "bg-[#e5f0ff]",
        description: "晚上听的歌。",
        emoji: "🌙",
        title: "Late Night Loop",
      }),
      buildContext("daily-moods"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.collection).toMatchObject({
      accentClass: "bg-[#e5f0ff]",
      description: "晚上听的歌。",
      emoji: "🌙",
      id: "daily-moods",
      title: "Late Night Loop",
    });
    expect(repository.updateSupabasePlaylistCollection).toHaveBeenCalledWith({
      accentClass: "bg-[#e5f0ff]",
      description: "晚上听的歌。",
      emoji: "🌙",
      id: "daily-moods",
      title: "Late Night Loop",
    });
  });

  it("rejects empty collection titles", async () => {
    const response = await PATCH(buildRequest({ title: "   " }), buildContext());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "请输入歌单名称" });
  });

  it("rejects invalid accent classes", async () => {
    const response = await PATCH(buildRequest({ accentClass: "bg-red-500", title: "新歌单" }), buildContext());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "请选择有效的歌单主题色" });
  });

  it("deletes a playlist collection", async () => {
    const repository = await import("@/features/playlists/repository");
    const response = await DELETE(buildRequest(), buildContext("daily-moods"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true });
    expect(repository.deleteSupabasePlaylistCollection).toHaveBeenCalledWith("daily-moods");
  });
});
