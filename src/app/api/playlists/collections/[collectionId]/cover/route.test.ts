import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/features/playlists/repository", () => ({
  requireSupabasePlaylistWriteEnv: vi.fn(() => undefined),
  updateSupabasePlaylistCollection: vi.fn(async (collection) => ({
    accentClass: collection.accentClass,
    coverImageSrc: collection.coverImageSrc,
    description: collection.description,
    emoji: collection.emoji,
    id: collection.id,
    songIds: [],
    title: collection.title,
  })),
  uploadSupabasePlaylistAsset: vi.fn(async ({ path }: { path: string }) => `https://cdn.example.com/${path}`),
}));

function buildContext(collectionId = "daily-moods") {
  return { params: Promise.resolve({ collectionId }) };
}

function buildRequest(formData: FormData, token = "test-token") {
  return {
    formData: async () => formData,
    headers: new Headers({ "x-playlist-import-token": token }),
    method: "POST",
  } as Request;
}

describe("/api/playlists/collections/[collectionId]/cover", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PLAYLIST_IMPORT_ADMIN_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects unsupported cover image types", async () => {
    const formData = new FormData();
    formData.set("title", "Daily Moods");
    formData.set("description", "today");
    formData.set("emoji", "🌸");
    formData.set("accentClass", "bg-[#fde2e7]");
    formData.set("coverFile", new File(["gif"], "cover.gif", { type: "image/gif" }));

    const response = await POST(buildRequest(formData), buildContext());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "歌单封面仅支持 JPG、PNG 或 WebP" });
  });

  it("uploads and saves a collection cover", async () => {
    const repository = await import("@/features/playlists/repository");
    const formData = new FormData();
    formData.set("title", "Daily Moods");
    formData.set("description", "today");
    formData.set("emoji", "🌸");
    formData.set("accentClass", "bg-[#fde2e7]");
    formData.set("coverFile", new File(["png"], "cover.png", { type: "image/png" }));

    const response = await POST(buildRequest(formData), buildContext("daily-moods"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.collection).toMatchObject({
      coverImageSrc: "https://cdn.example.com/collection-covers/daily-moods.png",
      id: "daily-moods",
      title: "Daily Moods",
    });
    expect(repository.uploadSupabasePlaylistAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: "image/png",
        path: "collection-covers/daily-moods.png",
      }),
    );
    expect(repository.updateSupabasePlaylistCollection).toHaveBeenCalledWith({
      accentClass: "bg-[#fde2e7]",
      coverImageSrc: "https://cdn.example.com/collection-covers/daily-moods.png",
      description: "today",
      emoji: "🌸",
      id: "daily-moods",
      title: "Daily Moods",
    });
  });
});
