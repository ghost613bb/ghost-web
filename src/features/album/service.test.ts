import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

import { resetStoredAlbums, upsertStoredAlbum, upsertStoredAlbumPhoto } from "./repository";
import { createAlbumPhoto, getAlbumById, getAlbumDetailPageData, getAlbumPageData, getAlbumPhotoDetailPageData, getAlbumWorkspaceData, listAlbums } from "./service";

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

describe("album service", () => {
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
    await upsertStoredAlbum(storedAlbum);

    const result = await createAlbumPhoto(storedAlbum.id, {
      note: "小时和分钟应跟随本地时间",
      imageUrl: "/uploads/albums/local-time.png",
    });

    expect(result.photo.uploadedAt).toBe("2026-05-28 / 10:05");
  });

  it("lists stored albums without local fallback data", async () => {
    await upsertStoredAlbum({
      ...storedAlbum,
      title: "编辑后的相册标题",
      description: "把数据库相册展示出来。",
      coverImage: "/uploads/albums/edited-cover.png",
      photoCount: 3,
    });

    const albums = await listAlbums();

    expect(albums).toEqual([
      expect.objectContaining({
        id: storedAlbum.id,
        title: "编辑后的相册标题",
        description: "把数据库相册展示出来。",
        coverImage: "/uploads/albums/edited-cover.png",
        photoCount: 3,
      }),
    ]);
  });

  it("returns null when an album is missing", async () => {
    await expect(getAlbumById("missing-album")).resolves.toBeNull();
  });

  it("throws a clear error when album storage is not configured", async () => {
    supabaseEnvState.enabled = false;

    await expect(
      createAlbumPhoto(storedAlbum.id, {
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
    await upsertStoredAlbum(storedAlbum);

    const data = await getAlbumPhotoDetailPageData(storedAlbum.id, "missing-photo");

    expect(data).toEqual({
      album: expect.objectContaining({ id: storedAlbum.id }),
      dataSource: "available",
      nextPhotoId: null,
      photo: null,
      previousPhotoId: null,
    });
  });

  it("returns unavailable photo detail page data when album storage env is missing", async () => {
    supabaseEnvState.enabled = false;

    await expect(getAlbumPhotoDetailPageData(storedAlbum.id, "photo-001")).resolves.toEqual({
      album: null,
      dataSource: "unavailable",
      nextPhotoId: null,
      photo: null,
      previousPhotoId: null,
      statusReason: "missing-env",
    });
  });

  it("returns an empty workspace when there are no stored albums", async () => {
    const data = await getAlbumWorkspaceData();

    expect(data).toEqual(
      expect.objectContaining({
        activeAlbum: null,
        activePhoto: null,
        albums: [],
        dataSource: "available",
        photos: [],
      }),
    );
  });

  it("returns workspace data for a stored selected photo", async () => {
    await upsertStoredAlbum(storedAlbum);
    const firstPhoto = await createAlbumPhoto(storedAlbum.id, {
      note: "第一张照片。",
      imageUrl: "/uploads/albums/first-photo.png",
    });
    const secondPhoto = await createAlbumPhoto(storedAlbum.id, {
      note: "第二张照片。",
      imageUrl: "/uploads/albums/second-photo.png",
    });
    const thirdPhoto = await createAlbumPhoto(storedAlbum.id, {
      note: "第三张照片。",
      imageUrl: "/uploads/albums/third-photo.png",
    });

    const data = await getAlbumWorkspaceData(storedAlbum.id, secondPhoto.photo.id);

    expect(data).toEqual(
      expect.objectContaining({
        activeAlbum: expect.objectContaining({ id: storedAlbum.id }),
        activePhoto: expect.objectContaining({ id: secondPhoto.photo.id }),
        dataSource: "available",
        previousPhotoId: firstPhoto.photo.id,
        nextPhotoId: thirdPhoto.photo.id,
      }),
    );
  });

  it("defaults to the first stored album when no album is selected", async () => {
    await upsertStoredAlbum(storedAlbum);
    await upsertStoredAlbum({
      ...storedAlbum,
      id: "album-002",
      title: "第二本相册",
      sortOrder: 2,
    });
    await upsertStoredAlbumPhoto(
      {
        id: "album-001-photo-001",
        albumId: storedAlbum.id,
        uploadedAt: "2026-05-28 / 10:00",
        note: "默认命中的第一张照片。",
        imageUrl: "/uploads/albums/album-001-photo-001.png",
        imagePosition: "center center",
      },
      1,
    );

    const data = await getAlbumWorkspaceData();

    expect(data).toEqual(
      expect.objectContaining({
        activeAlbum: expect.objectContaining({ id: storedAlbum.id }),
        activePhoto: null,
        dataSource: "available",
        photos: [expect.objectContaining({ albumId: storedAlbum.id, id: "album-001-photo-001" })],
      }),
    );
  });

  it("returns a null active photo when the selected photo is missing", async () => {
    await upsertStoredAlbum(storedAlbum);
    await upsertStoredAlbumPhoto(
      {
        id: "album-001-photo-001",
        albumId: storedAlbum.id,
        uploadedAt: "2026-05-28 / 10:00",
        note: "唯一一张照片。",
        imageUrl: "/uploads/albums/album-001-photo-001.png",
        imagePosition: "center center",
      },
      1,
    );

    const data = await getAlbumWorkspaceData(storedAlbum.id, "missing-photo");

    expect(data).toEqual(
      expect.objectContaining({
        activeAlbum: expect.objectContaining({ id: storedAlbum.id }),
        activePhoto: null,
        previousPhotoId: null,
        nextPhotoId: null,
      }),
    );
  });
});
