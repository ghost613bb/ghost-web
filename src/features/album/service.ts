import { albumCollections as fallbackAlbums } from "@/data/album";
import {
  deleteStoredAlbum,
  getStoredAlbumById,
  getStoredAlbumIds,
  listStoredAlbums,
  listVisibleStoredAlbums,
  upsertStoredAlbum,
} from "./repository";
import type { Album, CreateAlbumInput } from "./types";

function normalizeFallbackAlbum(album: (typeof fallbackAlbums)[number]): Album {
  return {
    id: album.id,
    title: album.title,
    description: album.description,
    coverImage: album.coverImage,
    photoCount: album.photoCount,
    visibility: album.visibility,
    status: album.status,
    createdAt: album.createdAt,
    sortOrder: album.sortOrder,
  };
}

export async function getNextCreatedAlbumId(): Promise<string> {
  const storedAlbums = await listStoredAlbums();
  const nextAlbumIndex = storedAlbums.reduce((maxIndex, album) => {
    const matchedSuffix = album.id.match(/^album-created-(\d+)$/)?.[1];
    const numericSuffix = matchedSuffix ? Number(matchedSuffix) : 0;
    return Math.max(maxIndex, Number.isFinite(numericSuffix) ? numericSuffix : 0);
  }, 0) + 1;

  return `album-created-${String(nextAlbumIndex).padStart(3, "0")}`;
}

export async function listAlbums(): Promise<Album[]> {
  const [storedAlbumIds, storedAlbums] = await Promise.all([getStoredAlbumIds(), listVisibleStoredAlbums()]);
  const visibleFallbackAlbums = fallbackAlbums
    .filter((album) => !storedAlbumIds.has(album.id))
    .map(normalizeFallbackAlbum);

  return [...storedAlbums, ...visibleFallbackAlbums];
}

export async function getAlbumById(id: string): Promise<Album | null> {
  const storedAlbum = await getStoredAlbumById(id);

  if (storedAlbum) {
    return storedAlbum.status === "draft" ? null : storedAlbum;
  }

  const fallbackAlbum = fallbackAlbums.find((album) => album.id === id);
  return fallbackAlbum ? normalizeFallbackAlbum(fallbackAlbum) : null;
}

export async function createAlbum(input: CreateAlbumInput): Promise<Album> {
  const storedAlbums = await listVisibleStoredAlbums();
  const nextAlbumIndex = storedAlbums.length + 1;
  const albumId = input.id ?? (await getNextCreatedAlbumId());
  const album: Album = {
    id: albumId,
    title: input.title,
    description: input.description || "先留一个新的相册位置。",
    coverImage: input.coverImage,
    photoCount: 0,
    visibility: "public",
    status: "published",
    createdAt: new Date().toISOString().slice(0, 10),
    sortOrder: nextAlbumIndex,
  };

  await upsertStoredAlbum(album);
  return album;
}

export async function updateAlbum(id: string, input: CreateAlbumInput): Promise<Album> {
  const currentAlbum = await getAlbumById(id);

  if (!currentAlbum) {
    throw new Error("相册不存在");
  }

  const updatedAlbum: Album = {
    ...currentAlbum,
    title: input.title,
    description: input.description || "先留一个新的相册位置。",
    coverImage: input.coverImage ?? currentAlbum.coverImage,
    status: "published",
  };

  await upsertStoredAlbum(updatedAlbum);
  return updatedAlbum;
}

export async function deleteAlbum(id: string): Promise<void> {
  const currentAlbum = await getAlbumById(id);

  if (!currentAlbum) {
    return;
  }

  if (id.startsWith("album-created-")) {
    await deleteStoredAlbum(id);
    return;
  }

  await upsertStoredAlbum({
    ...currentAlbum,
    status: "draft",
  });
}
