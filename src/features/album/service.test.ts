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

import { resetStoredAlbums, upsertStoredAlbum } from "./repository";
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
    });

    const albums = await listAlbums();

    expect(albums).toEqual([
      expect.objectContaining({
        id: storedAlbum.id,
        title: "编辑后的相册标题",
        description: "把数据库相册展示出来。",
        coverImage: "/uploads/albums/edited-cover.png",
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
    const created = await createAlbumPhoto(storedAlbum.id, {
      note: "数据库里的照片。",
      imageUrl: "/uploads/albums/first-photo.png",
    });

    const data = await getAlbumWorkspaceData(storedAlbum.id, created.photo.id);

    expect(data).toEqual(
      expect.objectContaining({
        activeAlbum: expect.objectContaining({ id: storedAlbum.id }),
        activePhoto: expect.objectContaining({ id: created.photo.id }),
        dataSource: "available",
      }),
    );
  });
});
