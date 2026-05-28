import { access, rm, stat } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetStoredAlbums } from "@/features/album/repository";
import { POST } from "./photos/route";
import { DELETE, PATCH } from "./route";

const albumUploadDir = path.join(process.cwd(), ".tmp/vitest/album-detail-route-uploads");

describe("/api/albums/[albumId]", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-28T10:00:00.000Z"));
    process.env.ALBUM_UPLOAD_DIR = albumUploadDir;
    await resetStoredAlbums();
    await rm(albumUploadDir, { force: true, recursive: true });
  });

  afterEach(async () => {
    vi.useRealTimers();
    delete process.env.ALBUM_UPLOAD_DIR;
    await rm(albumUploadDir, { force: true, recursive: true });
  });

  it("updates fallback album fields and cover through patch multipart form data", async () => {
    const formData = new FormData();
    formData.set("title", "编辑后的相册");
    formData.set("description", "更新后的备注");
    formData.set("coverFileName", "updated-cover.png");
    formData.append("coverFile", new Blob(["updated-cover"], { type: "image/png" }), "updated-cover.png");

    const response = await PATCH(
      new Request("http://localhost/api/albums/album-001", {
        method: "PATCH",
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
      coverImage: "/uploads/albums/album-001-updated-cover.png",
    });
  });

  it("uploads a photo for an album and saves the image file", async () => {
    const formData = new FormData();
    formData.set("title", "雨天小猫");
    formData.set("note", "窗边打盹的照片");
    formData.set("photoFileName", "cat-window.png");
    formData.append("photoFile", new Blob(["photo-binary"], { type: "image/png" }), "cat-window.png");

    const response = await POST(
      new Request("http://localhost/api/albums/album-001/photos", {
        method: "POST",
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
      photoCount: 23,
    });
    expect(data.photos.at(-1)).toMatchObject({
      albumId: "album-001",
      title: "雨天小猫",
      note: "窗边打盹的照片",
      imageUrl: "/uploads/albums/album-001-photo-008-cat-window.png",
    });

    const storedPhotoPath = path.join(albumUploadDir, "album-001-photo-008-cat-window.png");
    await expect(access(storedPhotoPath)).resolves.toBeUndefined();
    await expect(stat(storedPhotoPath)).resolves.toMatchObject({ size: 9 });
  });

  it("hides a fallback album through delete", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/albums/album-001", {
        method: "DELETE",
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
});
