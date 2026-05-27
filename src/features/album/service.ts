import { albumCollections as fallbackAlbums } from "@/data/album";
import { getStoredAlbumById, listStoredAlbums, upsertStoredAlbum } from "./repository";
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

export async function listAlbums(): Promise<Album[]> {
  const storedAlbums = await listStoredAlbums();

  if (storedAlbums.length > 0) {
    return [...storedAlbums, ...fallbackAlbums.map(normalizeFallbackAlbum)];
  }

  return fallbackAlbums.map(normalizeFallbackAlbum);
}

export async function getAlbumById(id: string): Promise<Album | null> {
  const storedAlbum = await getStoredAlbumById(id);

  if (storedAlbum) {
    return storedAlbum;
  }

  const fallbackAlbum = fallbackAlbums.find((album) => album.id === id);
  return fallbackAlbum ? normalizeFallbackAlbum(fallbackAlbum) : null;
}

export async function createAlbum(input: CreateAlbumInput): Promise<Album> {
  const storedAlbums = await listStoredAlbums();
  const nextAlbumIndex = storedAlbums.length + 1;
  const albumId = input.id ?? `album-created-${String(nextAlbumIndex).padStart(3, "0")}`;
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
