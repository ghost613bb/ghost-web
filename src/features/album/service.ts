import { albumCollections as fallbackAlbums } from "@/data/album";
import {
  getAlbumPhotoById as getFallbackAlbumPhotoById,
  getAlbumPhotosByAlbumId as getFallbackAlbumPhotosByAlbumId,
  type AlbumPhoto,
} from "@/data/albumPhotos";
import {
  deleteStoredAlbum,
  getStoredAlbumById,
  getStoredAlbumIds,
  getStoredAlbumPhotoById,
  listStoredAlbumPhotosByAlbumId,
  listStoredAlbums,
  listVisibleStoredAlbums,
  upsertStoredAlbum,
  upsertStoredAlbumPhoto,
} from "./repository";
import type { Album, CreateAlbumInput, CreateAlbumPhotoInput } from "./types";

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

function formatUploadedAt(date: Date) {
  return `${date.toISOString().slice(0, 10)} / ${date.toISOString().slice(11, 16)}`;
}

function buildStoredAlbumPhotoId(albumId: string, index: number) {
  return `${albumId}-photo-${String(index).padStart(3, "0")}`;
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

export async function listAlbumPhotos(albumId: string): Promise<AlbumPhoto[]> {
  const [storedPhotos, fallbackPhotos] = await Promise.all([
    listStoredAlbumPhotosByAlbumId(albumId),
    Promise.resolve(getFallbackAlbumPhotosByAlbumId(albumId)),
  ]);

  return [...fallbackPhotos, ...storedPhotos];
}

export async function getAlbumPhotoById(albumId: string, photoId: string): Promise<AlbumPhoto | null> {
  const fallbackPhoto = getFallbackAlbumPhotoById(albumId, photoId);

  if (fallbackPhoto) {
    return fallbackPhoto;
  }

  return getStoredAlbumPhotoById(albumId, photoId);
}

export async function getAdjacentAlbumPhotoIds(albumId: string, photoId: string) {
  const photos = await listAlbumPhotos(albumId);
  const index = photos.findIndex((photo) => photo.id === photoId);

  if (index === -1) {
    return { previousPhotoId: null, nextPhotoId: null };
  }

  return {
    previousPhotoId: photos[index - 1]?.id ?? null,
    nextPhotoId: photos[index + 1]?.id ?? null,
  };
}

export async function createAlbumPhoto(albumId: string, input: CreateAlbumPhotoInput) {
  const currentAlbum = await getAlbumById(albumId);

  if (!currentAlbum) {
    throw new Error("相册不存在");
  }

  const currentPhotos = await listAlbumPhotos(albumId);
  const nextIndex = currentPhotos.length + 1;
  const nextPhoto = {
    id: buildStoredAlbumPhotoId(albumId, nextIndex),
    albumId,
    title: input.title || "还没有标题",
    uploadedAt: formatUploadedAt(new Date()),
    note: input.note || "先记下这一刻。",
    imageUrl: input.imageUrl,
    imagePosition: input.imagePosition ?? "center center",
  } satisfies AlbumPhoto;

  await upsertStoredAlbumPhoto(nextPhoto, nextIndex);

  const updatedAlbum: Album = {
    ...currentAlbum,
    photoCount: currentAlbum.photoCount + 1,
    status: "published",
  };

  await upsertStoredAlbum(updatedAlbum);

  return {
    album: updatedAlbum,
    photo: nextPhoto,
    photos: [...currentPhotos, nextPhoto],
  };
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
