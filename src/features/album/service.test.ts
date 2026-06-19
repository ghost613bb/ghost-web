import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { albumCollections } from "@/data/album";

const supabaseEnvState = vi.hoisted(() => ({
  enabled: true,
}));

vi.mock("@/lib/supabase/server", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase/server")>("@/lib/supabase/server");

  return {
    ...actual,
    hasSupabaseServiceRoleEnv: () => supabaseEnvState.enabled,
  };
});

import { resetStoredAlbums, upsertStoredAlbum } from "./repository";
import { createAlbumComment, createAlbumPhoto, getAlbumById, getAlbumDetailPageData, getAlbumPageData, getAlbumPhotoDetailPageData, getAlbumWorkspaceData, listAlbumComments, listAlbums } from "./service";

describe("album service", () => {
  const fallbackAlbum = albumCollections[0]!;

  beforeEach(async () => {
    vi.useRealTimers();
    process.env.TZ = "America/Los_Angeles";
    supabaseEnvState.enabled = true;
    await resetStoredAlbums();
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env.TZ = "America/Los_Angeles";
  });

  it("uses local clock hours and minutes for uploaded photo time", async () => {
    vi.setSystemTime(new Date(2026, 4, 28, 10, 5));

    const result = await createAlbumPhoto(fallbackAlbum.id, {
      title: "本地时间照片",
      note: "小时和分钟应跟随本地时间",
      imageUrl: "/uploads/albums/local-time.png",
    });

    expect(result.photo.uploadedAt).toBe("2026-05-28 / 10:05");
  });

  it("uses a stored album to override fallback album content without duplicating the card", async () => {
    await upsertStoredAlbum({
      id: fallbackAlbum.id,
      title: "编辑后的相册标题",
      description: "把静态相册覆盖成新的内容。",
      coverImage: "/uploads/albums/edited-cover.png",
      photoCount: fallbackAlbum.photoCount,
      visibility: fallbackAlbum.visibility,
      status: "published",
      createdAt: fallbackAlbum.createdAt,
      sortOrder: fallbackAlbum.sortOrder,
    });

    const albums = await listAlbums();
    const matchedAlbums = albums.filter((album) => album.id === fallbackAlbum.id);

    expect(matchedAlbums).toHaveLength(1);
    expect(matchedAlbums[0]).toMatchObject({
      id: fallbackAlbum.id,
      title: "编辑后的相册标题",
      description: "把静态相册覆盖成新的内容。",
      coverImage: "/uploads/albums/edited-cover.png",
    });
  });

  it("treats a stored draft shadow as a deleted fallback album", async () => {
    await upsertStoredAlbum({
      id: fallbackAlbum.id,
      title: fallbackAlbum.title,
      description: fallbackAlbum.description,
      coverImage: fallbackAlbum.coverImage,
      photoCount: fallbackAlbum.photoCount,
      visibility: fallbackAlbum.visibility,
      status: "draft",
      createdAt: fallbackAlbum.createdAt,
      sortOrder: fallbackAlbum.sortOrder,
    });

    const albums = await listAlbums();

    expect(albums.some((album) => album.id === fallbackAlbum.id)).toBe(false);
    await expect(getAlbumById(fallbackAlbum.id)).resolves.toBeNull();
  });

  it("throws a clear error when album storage is not configured", async () => {
    supabaseEnvState.enabled = false;

    await expect(
      createAlbumPhoto(fallbackAlbum.id, {
        title: "未配置数据源的照片",
        imageUrl: "/uploads/albums/unavailable.png",
      }),
    ).rejects.toThrow("相册数据源未配置");
  });

  it("returns unavailable album page data when album storage env is missing", async () => {
    supabaseEnvState.enabled = false;

    await expect(getAlbumPageData()).resolves.toEqual({
      albums: [],
      dataSource: "unavailable",
      statusReason: "missing-env",
    });
  });

  it("returns available detail page data when an album is missing", async () => {
    await expect(getAlbumDetailPageData("missing-album")).resolves.toEqual({
      album: null,
      dataSource: "available",
      photos: [],
    });
  });

  it("returns available photo detail page data when a photo is missing", async () => {
    const data = await getAlbumPhotoDetailPageData(fallbackAlbum.id, "missing-photo");

    expect(data).toEqual({
      album: expect.objectContaining({ id: fallbackAlbum.id }),
      dataSource: "available",
      nextPhotoId: null,
      photo: null,
      previousPhotoId: null,
    });
  });

  it("returns unavailable photo detail page data when album storage env is missing", async () => {
    supabaseEnvState.enabled = false;

    await expect(getAlbumPhotoDetailPageData(fallbackAlbum.id, "photo-001")).resolves.toEqual({
      album: null,
      dataSource: "unavailable",
      nextPhotoId: null,
      photo: null,
      previousPhotoId: null,
      statusReason: "missing-env",
    });
  });

  it("returns workspace data with the first album selected by default", async () => {
    const data = await getAlbumWorkspaceData();

    expect(data).toEqual(
      expect.objectContaining({
        activeAlbum: expect.objectContaining({ id: fallbackAlbum.id }),
        activePhoto: null,
        albumComments: expect.any(Array),
        albums: expect.any(Array),
        dataSource: "available",
        photos: expect.any(Array),
      }),
    );
  });

  it("returns workspace data for a selected photo", async () => {
    const data = await getAlbumWorkspaceData(fallbackAlbum.id, "photo-001");

    expect(data).toEqual(
      expect.objectContaining({
        activeAlbum: expect.objectContaining({ id: fallbackAlbum.id }),
        activePhoto: expect.objectContaining({ id: "photo-001" }),
        albumComments: expect.any(Array),
        dataSource: "available",
      }),
    );
  });

  it("creates and lists album comments for a fallback album", async () => {
    const createdComment = await createAlbumComment(fallbackAlbum.id, {
      author: "Ranima",
      content: "想把今天的阳光贴进来。",
    });
    const comments = await listAlbumComments(fallbackAlbum.id);
    const data = await getAlbumWorkspaceData(fallbackAlbum.id);

    expect(createdComment).toMatchObject({
      albumId: fallbackAlbum.id,
      author: "Ranima",
      avatar: "/images/image.png",
      content: "想把今天的阳光贴进来。",
    });
    expect(comments).toHaveLength(1);
    expect(data.albumComments).toEqual([
      expect.objectContaining({
        id: createdComment.id,
        content: "想把今天的阳光贴进来。",
      }),
    ]);
  });
});
