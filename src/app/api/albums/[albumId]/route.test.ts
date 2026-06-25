import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetStoredAlbums, upsertStoredAlbum } from "@/features/album/repository";
import { DELETE, PATCH } from "./route";
import { POST } from "./photos/route";

vi.mock("@/features/storage/service", () => ({
  uploadStorageObject: vi.fn(async ({ objectPath, scope }: { objectPath: string; scope: string }) => ({
    objectPath,
    provider: "supabase",
    scope,
    url: `https://cdn.example.com/${objectPath}`,
  })),
}));

const storedAlbum = {
  id: "album-001",
  title: "我的相册",
  description: "已经迁移到数据库里的相册。",
  photoCount: 0,
  visibility: "public" as const,
  status: "published" as const,
  createdAt: "2023-07-31",
  sortOrder: 1,
};

describe("/api/albums/[albumId]", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-28T10:00:00.000Z"));
    vi.stubEnv("PLAYLIST_IMPORT_ADMIN_TOKEN", "test-token");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
    await resetStoredAlbums();
    await upsertStoredAlbum(storedAlbum);
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("updates a stored album through patch multipart form data", async () => {
    const storageService = await import("@/features/storage/service");
    const formData = new FormData();
    formData.set("title", "编辑后的相册");
    formData.set("description", "更新后的备注");
    formData.set("coverFileName", "updated-cover.png");
    formData.append("coverFile", new Blob(["updated-cover"], { type: "image/png" }), "updated-cover.png");

    const response = await PATCH(
      new Request("http://localhost/api/albums/album-001", {
        method: "PATCH",
        headers: {
          "x-playlist-import-token": "test-token",
        },
        body: formData,
      }),
      {
        params: Promise.resolve({
          albumId: "album-001",
        }),
      },
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.album).toMatchObject({
      id: "album-001",
      title: "编辑后的相册",
      description: "更新后的备注",
      coverImage: "https://cdn.example.com/covers/album-001-updated-cover.png",
    });
    expect(storageService.uploadStorageObject).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: "image/png",
        objectPath: "covers/album-001-updated-cover.png",
        scope: "albums",
      }),
    );
  });

  it("uploads a photo for a stored album and returns a remote image URL", async () => {
    const storageService = await import("@/features/storage/service");
    const formData = new FormData();
    formData.set("note", "窗边打盹的照片");
    formData.set("photoFileName", "cat-window.png");
    formData.append("photoFile", new Blob(["photo-binary"], { type: "image/png" }), "cat-window.png");

    const response = await POST(
      new Request("http://localhost/api/albums/album-001/photos", {
        method: "POST",
        headers: {
          "x-playlist-import-token": "test-token",
        },
        body: formData,
      }),
      {
        params: Promise.resolve({
          albumId: "album-001",
        }),
      },
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.album).toMatchObject({
      id: "album-001",
      photoCount: 1,
    });
    const createdPhoto = data.photos.at(-1);
    expect(createdPhoto).toMatchObject({
      albumId: "album-001",
      note: "窗边打盹的照片",
    });
    expect(createdPhoto.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(createdPhoto.imageUrl).toBe(`https://cdn.example.com/photos/${createdPhoto.id}-cat-window.png`);
    expect(storageService.uploadStorageObject).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: "image/png",
        objectPath: `photos/${createdPhoto.id}-cat-window.png`,
        scope: "albums",
      }),
    );
  });

  it("updates a stored photo through patch json", async () => {
    const formData = new FormData();
    formData.set("note", "窗边打盹的照片");
    formData.append("photoFile", new Blob(["photo-binary"], { type: "image/png" }), "cat-window.png");

    const createResponse = await POST(
      new Request("http://localhost/api/albums/album-001/photos", {
        method: "POST",
        headers: {
          "x-playlist-import-token": "test-token",
        },
        body: formData,
      }),
      {
        params: Promise.resolve({
          albumId: "album-001",
        }),
      },
    );
    const createdPhoto = (await createResponse.json()).photo;

    const { PATCH: PATCH_PHOTO } = await import("./photos/[photoId]/route");
    const response = await PATCH_PHOTO(
      new Request(`http://localhost/api/albums/album-001/photos/${createdPhoto.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-playlist-import-token": "test-token",
        },
        body: JSON.stringify({
          note: "更新后的备注",
        }),
      }),
      {
        params: Promise.resolve({
          albumId: "album-001",
          photoId: createdPhoto.id,
        }),
      },
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.photo).toMatchObject({
      id: createdPhoto.id,
      note: "更新后的备注",
      imageUrl: createdPhoto.imageUrl,
    });
  });

  it("deletes a stored photo through delete and returns the updated list", async () => {
    const formData = new FormData();
    formData.append("photoFile", new Blob(["photo-binary"], { type: "image/png" }), "cat-window.png");

    const createResponse = await POST(
      new Request("http://localhost/api/albums/album-001/photos", {
        method: "POST",
        headers: {
          "x-playlist-import-token": "test-token",
        },
        body: formData,
      }),
      {
        params: Promise.resolve({
          albumId: "album-001",
        }),
      },
    );
    const createdPhoto = (await createResponse.json()).photo;

    const { DELETE: DELETE_PHOTO } = await import("./photos/[photoId]/route");
    const response = await DELETE_PHOTO(
      new Request(`http://localhost/api/albums/album-001/photos/${createdPhoto.id}`, {
        method: "DELETE",
        headers: {
          "x-playlist-import-token": "test-token",
        },
      }),
      {
        params: Promise.resolve({
          albumId: "album-001",
          photoId: createdPhoto.id,
        }),
      },
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.album).toMatchObject({
      id: "album-001",
      photoCount: 0,
    });
    expect(data.photos).toHaveLength(0);
    expect(data.photos.some((photo: { id: string }) => photo.id === createdPhoto.id)).toBe(false);
  });

  it("deletes a stored album through delete", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/albums/album-001", {
        method: "DELETE",
        headers: {
          "x-playlist-import-token": "test-token",
        },
      }),
      {
        params: Promise.resolve({
          albumId: "album-001",
        }),
      },
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });

    const nextResponse = await PATCH(
      new Request("http://localhost/api/albums/album-001", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-playlist-import-token": "test-token",
        },
        body: JSON.stringify({
          title: "重新编辑",
          description: "尝试更新已删除相册",
        }),
      }),
      {
        params: Promise.resolve({
          albumId: "album-001",
        }),
      },
    );

    expect(nextResponse.status).toBe(404);
  });

  it("rejects album detail writes without admin permission", async () => {
    const patchResponse = await PATCH(
      new Request("http://localhost/api/albums/album-001", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "未授权编辑",
          description: "不该成功",
        }),
      }),
      {
        params: Promise.resolve({
          albumId: "album-001",
        }),
      },
    );
    const deleteResponse = await DELETE(
      new Request("http://localhost/api/albums/album-001", {
        method: "DELETE",
      }),
      {
        params: Promise.resolve({
          albumId: "album-001",
        }),
      },
    );

    expect(patchResponse.status).toBe(401);
    await expect(patchResponse.json()).resolves.toEqual({ error: "无权限编辑相册" });
    expect(deleteResponse.status).toBe(401);
    await expect(deleteResponse.json()).resolves.toEqual({ error: "无权限删除相册" });
  });
});
