import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/features/playlists/repository", () => ({
  getNextSupabasePlaylistCollectionSortOrder: vi.fn(async () => 5),
  insertSupabasePlaylistCollection: vi.fn(async (collection) => ({
    accentClass: collection.accentClass,
    coverImageSrc: collection.coverImageSrc,
    description: collection.description,
    emoji: collection.emoji,
    id: collection.id,
    songIds: [],
    title: collection.title,
  })),
  requireSupabasePlaylistWriteEnv: vi.fn(() => undefined),
  uploadSupabasePlaylistAsset: vi.fn(async ({ path }: { path: string }) => `https://cdn.example.com/${path}`),
}));

function buildRequest(payload: unknown, token = "test-token") {
  return {
    headers: new Headers({ "x-playlist-import-token": token }),
    json: async () => payload,
  } as Request;
}

function buildFormRequest(formData: FormData, token = "test-token") {
  return new Request("http://localhost/api/playlists/collections", {
    body: formData,
    headers: new Headers({ "x-playlist-import-token": token }),
    method: "POST",
  });
}

describe("/api/playlists/collections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PLAYLIST_IMPORT_ADMIN_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects requests without the import token", async () => {
    const response = await POST(buildRequest({ title: "新歌单" }, ""));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "无权限新增歌单" });
  });

  it("rejects requests with a wrong import token", async () => {
    const response = await POST(buildRequest({ title: "新歌单" }, "wrong-token"));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "无权限新增歌单" });
  });

  it("rejects empty titles", async () => {
    const response = await POST(buildRequest({ title: "   " }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "请输入歌单名称" });
  });

  it("rejects invalid accent classes", async () => {
    const response = await POST(buildRequest({ accentClass: "bg-red-500", title: "新歌单" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "请选择有效的歌单主题色" });
  });

  it("creates a playlist collection", async () => {
    const repository = await import("@/features/playlists/repository");
    const response = await POST(
      buildRequest({
        accentClass: "bg-[#e5f0ff]",
        description: "晚上听的歌。",
        emoji: "🌙",
        title: "Late Night Loop",
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.collection).toMatchObject({
      accentClass: "bg-[#e5f0ff]",
      description: "晚上听的歌。",
      emoji: "🌙",
      songIds: [],
      title: "Late Night Loop",
    });
    expect(data.collection.id).toMatch(/^collection-late-night-loop-/);
    expect(repository.getNextSupabasePlaylistCollectionSortOrder).toHaveBeenCalled();
    expect(repository.insertSupabasePlaylistCollection).toHaveBeenCalledWith(
      expect.objectContaining({
        accentClass: "bg-[#e5f0ff]",
        description: "晚上听的歌。",
        emoji: "🌙",
        sortOrder: 5,
        title: "Late Night Loop",
      }),
    );
  });

  it("creates a playlist collection with cover upload", async () => {
    const repository = await import("@/features/playlists/repository");
    const formData = new FormData();
    formData.set("title", "Late Night Loop");
    formData.set("description", "晚上听的歌。");
    formData.set("emoji", "🌙");
    formData.set("accentClass", "bg-[#e5f0ff]");
    formData.set("coverFile", new File(["png"], "cover.png", { type: "image/png" }));

    const response = await POST(buildFormRequest(formData));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.collection).toMatchObject({
      accentClass: "bg-[#e5f0ff]",
      coverImageSrc: expect.stringMatching(/^https:\/\/cdn\.example\.com\/collections\/collection-late-night-loop-.*\/cover\.png$/),
      description: "晚上听的歌。",
      emoji: "🌙",
      songIds: [],
      title: "Late Night Loop",
    });
    expect(repository.uploadSupabasePlaylistAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: "image/png",
        path: expect.stringMatching(/^collections\/collection-late-night-loop-.*\/cover\.png$/),
      }),
    );
    expect(repository.insertSupabasePlaylistCollection).toHaveBeenCalledWith(
      expect.objectContaining({
        coverImageSrc: expect.stringMatching(/^https:\/\/cdn\.example\.com\/collections\/collection-late-night-loop-.*\/cover\.png$/),
      }),
    );
  });

  it("rejects unsupported cover image types on create", async () => {
    const formData = new FormData();
    formData.set("title", "Late Night Loop");
    formData.set("description", "晚上听的歌。");
    formData.set("emoji", "🌙");
    formData.set("accentClass", "bg-[#e5f0ff]");
    formData.set("coverFile", new File(["gif"], "cover.gif", { type: "image/gif" }));

    const response = await POST(buildFormRequest(formData));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "歌单封面仅支持 JPG、PNG 或 WebP" });
  });
});
