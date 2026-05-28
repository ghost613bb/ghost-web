import { beforeEach, describe, expect, it } from "vitest";
import { albumCollections } from "@/data/album";
import { resetStoredAlbums, upsertStoredAlbum } from "./repository";
import { getAlbumById, listAlbums } from "./service";

describe("album service", () => {
  const fallbackAlbum = albumCollections[0]!;

  beforeEach(async () => {
    await resetStoredAlbums();
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
});
