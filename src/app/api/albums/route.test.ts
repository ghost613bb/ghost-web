import { access, rm } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { albumCollections } from "@/data/album";
import { resetStoredAlbums } from "@/features/album/repository";
import { deleteAlbum } from "@/features/album/service";
import { GET, POST } from "./route";

const albumUploadDir = path.join(process.cwd(), ".tmp/vitest/album-route-uploads");

describe("/api/albums", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T10:00:00.000Z"));
    vi.stubEnv("PLAYLIST_IMPORT_ADMIN_TOKEN", "test-token");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
    process.env.ALBUM_UPLOAD_DIR = albumUploadDir;
    await resetStoredAlbums();
    await rm(albumUploadDir, { force: true, recursive: true });
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    delete process.env.ALBUM_UPLOAD_DIR;
    await rm(albumUploadDir, { force: true, recursive: true });
  });

  it("returns fallback album data when storage is empty", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.albums).toHaveLength(albumCollections.length);
    expect(data.albums[0]).toMatchObject({
      id: albumCollections[0]?.id,
      title: albumCollections[0]?.title,
    });
  });

  it("creates a stored album from multipart form data and saves the cover file", async () => {
    const formData = new FormData();
    formData.set("title", "数据库相册");
    formData.set("description", "把封面链路接到持久化。");
    formData.set("coverFileName", "summer-cover.png");
    formData.append("coverFile", new Blob(["cover-binary"], { type: "image/png" }), "summer-cover.png");

    const response = await POST(
      new Request("http://localhost/api/albums", {
        method: "POST",
        headers: {
          "x-playlist-import-token": "test-token",
        },
        body: formData,
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      album: {
        id: "album-created-001",
        title: "数据库相册",
        description: "把封面链路接到持久化。",
        coverImage: "/uploads/albums/album-created-001-summer-cover.png",
        photoCount: 0,
        visibility: "public",
        status: "published",
        createdAt: "2026-05-26",
        sortOrder: 1,
      },
    });

    const storedCoverPath = path.join(albumUploadDir, "album-created-001-summer-cover.png");

    await expect(access(storedCoverPath)).resolves.toBeUndefined();

    const nextResponse = await GET();
    const nextData = await nextResponse.json();

    expect(nextData.albums[0]).toEqual({
      id: "album-created-001",
      title: "数据库相册",
      description: "把封面链路接到持久化。",
      coverImage: "/uploads/albums/album-created-001-summer-cover.png",
      photoCount: 0,
      visibility: "public",
      status: "published",
      createdAt: "2026-05-26",
      sortOrder: 1,
    });
  });

  it("creates a new album id after deleting another stored album", async () => {
    const firstFormData = new FormData();
    firstFormData.set("title", "第一个相册");

    const secondFormData = new FormData();
    secondFormData.set("title", "第二个相册");

    const firstResponse = await POST(
      new Request("http://localhost/api/albums", {
        method: "POST",
        headers: {
          "x-playlist-import-token": "test-token",
        },
        body: firstFormData,
      }),
    );
    const secondResponse = await POST(
      new Request("http://localhost/api/albums", {
        method: "POST",
        headers: {
          "x-playlist-import-token": "test-token",
        },
        body: secondFormData,
      }),
    );

    const firstAlbum = (await firstResponse.json()).album;
    const secondAlbum = (await secondResponse.json()).album;

    await deleteAlbum(firstAlbum.id);

    const recreatedFirstResponse = await POST(
      new Request("http://localhost/api/albums", {
        method: "POST",
        headers: {
          "x-playlist-import-token": "test-token",
        },
        body: firstFormData,
      }),
    );
    const recreatedFirstAlbum = (await recreatedFirstResponse.json()).album;

    expect(firstAlbum.id).toBe("album-created-001");
    expect(secondAlbum.id).toBe("album-created-002");
    expect(recreatedFirstAlbum.id).toBe("album-created-003");
  });

  it("rejects multipart form data when the album title is empty", async () => {
    const formData = new FormData();
    formData.set("title", "   ");
    formData.set("coverFileName", "summer-cover.png");
    formData.append("coverFile", new Blob(["cover-binary"], { type: "image/png" }), "summer-cover.png");

    const response = await POST(
      new Request("http://localhost/api/albums", {
        method: "POST",
        headers: {
          "x-playlist-import-token": "test-token",
        },
        body: formData,
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "请先填写相册名称",
    });
  });

  it("rejects album creation without admin permission", async () => {
    const formData = new FormData();
    formData.set("title", "未授权相册");

    const response = await POST(
      new Request("http://localhost/api/albums", {
        method: "POST",
        body: formData,
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "无权限新增相册" });
  });
});
