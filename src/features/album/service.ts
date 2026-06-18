import { randomUUID } from "node:crypto";
import { albumCollections as fallbackAlbums } from "@/data/album";
import {
  getAlbumPhotoById as getFallbackAlbumPhotoById,
  getAlbumPhotosByAlbumId as getFallbackAlbumPhotosByAlbumId,
  type AlbumPhoto,
} from "@/data/albumPhotos";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/server";
import {
  deleteStoredAlbum,
  deleteStoredAlbumComment,
  deleteStoredAlbumPhoto,
  getStoredAlbumById,
  getStoredAlbumIds,
  getStoredAlbumPhotoById,
  insertStoredAlbumComment,
  listDeletedAlbumPhotoIds,
  listStoredAlbumCommentsByAlbumId,
  listStoredAlbumPhotosByAlbumId,
  listStoredAlbums,
  listVisibleStoredAlbums,
  markFallbackAlbumPhotoDeleted,
  upsertStoredAlbum,
  upsertStoredAlbumPhoto,
} from "./repository";
import type { Album, AlbumComment, CreateAlbumCommentInput, CreateAlbumInput, CreateAlbumPhotoInput, UpdateAlbumPhotoInput } from "./types";

export type AlbumPageDataSource = "available" | "unavailable";

export type AlbumPageStatusReason = "missing-env" | "read-error";

export type AlbumPageData = {
  albums: Album[];
  dataSource: AlbumPageDataSource;
  statusReason?: AlbumPageStatusReason;
};

export type AlbumDetailPageData = {
  album: Album | null;
  dataSource: AlbumPageDataSource;
  photos: AlbumPhoto[];
  statusReason?: AlbumPageStatusReason;
};

export type AlbumPhotoDetailPageData = {
  album: Album | null;
  dataSource: AlbumPageDataSource;
  nextPhotoId: string | null;
  photo: AlbumPhoto | null;
  previousPhotoId: string | null;
  statusReason?: AlbumPageStatusReason;
};

export type AlbumWorkspaceData = {
  activeAlbum: Album | null;
  activePhoto: AlbumPhoto | null;
  albumComments: AlbumComment[];
  albums: Album[];
  dataSource: AlbumPageDataSource;
  nextPhotoId: string | null;
  photos: AlbumPhoto[];
  previousPhotoId: string | null;
  statusReason?: AlbumPageStatusReason;
};

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
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} / ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function buildStoredAlbumPhotoId(albumId: string, index: number) {
  return `${albumId}-photo-${String(index).padStart(3, "0")}`;
}

function isAlbumStorageConfigured() {
  return Boolean(hasSupabaseServiceRoleEnv() || (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY));
}

function assertAlbumStorageConfigured() {
  if (isAlbumStorageConfigured()) {
    return;
  }

  throw new Error("相册数据源未配置");
}

export async function getNextCreatedAlbumId(): Promise<string> {
  assertAlbumStorageConfigured();
  const storedAlbums = await listStoredAlbums();
  const nextAlbumIndex = storedAlbums.reduce((maxIndex, album) => {
    const matchedSuffix = album.id.match(/^album-created-(\d+)$/)?.[1];
    const numericSuffix = matchedSuffix ? Number(matchedSuffix) : 0;
    return Math.max(maxIndex, Number.isFinite(numericSuffix) ? numericSuffix : 0);
  }, 0) + 1;

  return `album-created-${String(nextAlbumIndex).padStart(3, "0")}`;
}

async function withActualPhotoCount(album: Album): Promise<Album> {
  const photos = await listAlbumPhotos(album.id);
  return {
    ...album,
    photoCount: photos.length,
  };
}

export async function listAlbums(): Promise<Album[]> {
  const [storedAlbumIds, storedAlbums] = await Promise.all([getStoredAlbumIds(), listVisibleStoredAlbums()]);
  const visibleFallbackAlbums = fallbackAlbums
    .filter((album) => !storedAlbumIds.has(album.id))
    .map(normalizeFallbackAlbum);

  return Promise.all([...storedAlbums, ...visibleFallbackAlbums].map(withActualPhotoCount));
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
  assertAlbumStorageConfigured();
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
  assertAlbumStorageConfigured();
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
  const [storedPhotos, fallbackPhotos, deletedFallbackPhotoIds] = await Promise.all([
    listStoredAlbumPhotosByAlbumId(albumId),
    Promise.resolve(getFallbackAlbumPhotosByAlbumId(albumId)),
    listDeletedAlbumPhotoIds(albumId),
  ]);

  const storedPhotoIds = new Set(storedPhotos.map((photo) => photo.id));
  return [...fallbackPhotos.filter((photo) => !deletedFallbackPhotoIds.has(photo.id) && !storedPhotoIds.has(photo.id)), ...storedPhotos];
}

export async function getAlbumPhotoById(albumId: string, photoId: string): Promise<AlbumPhoto | null> {
  const storedPhoto = await getStoredAlbumPhotoById(albumId, photoId);

  if (storedPhoto) {
    return storedPhoto;
  }

  const deletedFallbackPhotoIds = await listDeletedAlbumPhotoIds(albumId);

  if (deletedFallbackPhotoIds.has(photoId)) {
    return null;
  }

  return getFallbackAlbumPhotoById(albumId, photoId);
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
  assertAlbumStorageConfigured();
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

export async function updateAlbumPhoto(albumId: string, photoId: string, input: UpdateAlbumPhotoInput): Promise<AlbumPhoto> {
  assertAlbumStorageConfigured();
  const currentPhoto = await getAlbumPhotoById(albumId, photoId);

  if (!currentPhoto) {
    throw new Error("照片不存在");
  }

  const updatedPhoto = {
    ...currentPhoto,
    title: input.title,
    note: input.note ?? "",
  } satisfies AlbumPhoto;
  const photos = await listAlbumPhotos(albumId);
  const sortOrder = Math.max(
    1,
    photos.findIndex((photo) => photo.id === photoId) + 1,
  );

  await upsertStoredAlbumPhoto(updatedPhoto, sortOrder);
  return updatedPhoto;
}

export async function deleteAlbumPhoto(albumId: string, photoId: string) {
  assertAlbumStorageConfigured();
  const currentAlbum = await getAlbumById(albumId);

  if (!currentAlbum) {
    throw new Error("相册不存在");
  }

  const currentPhoto = await getAlbumPhotoById(albumId, photoId);

  if (!currentPhoto) {
    throw new Error("照片不存在");
  }

  const [fallbackPhoto, storedPhoto] = await Promise.all([Promise.resolve(getFallbackAlbumPhotoById(albumId, photoId)), getStoredAlbumPhotoById(albumId, photoId)]);

  if (storedPhoto) {
    await deleteStoredAlbumPhoto(albumId, photoId);
  }

  if (fallbackPhoto) {
    await markFallbackAlbumPhotoDeleted(albumId, photoId);
  }

  const photos = await listAlbumPhotos(albumId);
  const updatedAlbum: Album = {
    ...currentAlbum,
    photoCount: photos.length,
    status: "published",
  };

  await upsertStoredAlbum(updatedAlbum);

  return {
    album: updatedAlbum,
    photos,
  };
}

export async function deleteAlbum(id: string): Promise<void> {
  assertAlbumStorageConfigured();
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

export async function listAlbumComments(albumId: string): Promise<AlbumComment[]> {
  return listStoredAlbumCommentsByAlbumId(albumId);
}

export async function createAlbumComment(albumId: string, input: CreateAlbumCommentInput) {
  assertAlbumStorageConfigured();
  const album = await getAlbumById(albumId);

  if (!album) {
    throw new Error("相册不存在");
  }

  const comment = await insertStoredAlbumComment({
    id: `album-comment-${randomUUID()}`,
    albumId,
    author: input.author || "Name",
    avatar: "📷",
    content: input.content,
  });

  return comment;
}

export async function deleteAlbumComment(albumId: string, commentId: string) {
  assertAlbumStorageConfigured();
  const album = await getAlbumById(albumId);

  if (!album) {
    throw new Error("相册不存在");
  }

  await deleteStoredAlbumComment(albumId, commentId);
}

export async function getAlbumPageData(): Promise<AlbumPageData> {
  if (!isAlbumStorageConfigured()) {
    return {
      albums: [],
      dataSource: "unavailable",
      statusReason: "missing-env",
    };
  }

  try {
    return {
      albums: await listAlbums(),
      dataSource: "available",
    };
  } catch (error) {
    console.warn(error instanceof Error ? error.message : "读取相册列表失败");

    return {
      albums: [],
      dataSource: "unavailable",
      statusReason: "read-error",
    };
  }
}

export async function getAlbumDetailPageData(id: string): Promise<AlbumDetailPageData> {
  if (!isAlbumStorageConfigured()) {
    return {
      album: null,
      dataSource: "unavailable",
      photos: [],
      statusReason: "missing-env",
    };
  }

  try {
    const album = await getAlbumById(id);

    if (!album) {
      return {
        album: null,
        dataSource: "available",
        photos: [],
      };
    }

    return {
      album,
      dataSource: "available",
      photos: await listAlbumPhotos(id),
    };
  } catch (error) {
    console.warn(error instanceof Error ? error.message : "读取相册详情失败");

    return {
      album: null,
      dataSource: "unavailable",
      photos: [],
      statusReason: "read-error",
    };
  }
}

export async function getAlbumPhotoDetailPageData(albumId: string, photoId: string): Promise<AlbumPhotoDetailPageData> {
  if (!isAlbumStorageConfigured()) {
    return {
      album: null,
      dataSource: "unavailable",
      nextPhotoId: null,
      photo: null,
      previousPhotoId: null,
      statusReason: "missing-env",
    };
  }

  try {
    const album = await getAlbumById(albumId);

    if (!album) {
      return {
        album: null,
        dataSource: "available",
        nextPhotoId: null,
        photo: null,
        previousPhotoId: null,
      };
    }

    const photo = await getAlbumPhotoById(albumId, photoId);

    if (!photo) {
      return {
        album,
        dataSource: "available",
        nextPhotoId: null,
        photo: null,
        previousPhotoId: null,
      };
    }

    const { previousPhotoId, nextPhotoId } = await getAdjacentAlbumPhotoIds(albumId, photoId);

    return {
      album,
      dataSource: "available",
      nextPhotoId,
      photo,
      previousPhotoId,
    };
  } catch (error) {
    console.warn(error instanceof Error ? error.message : "读取照片详情失败");

    return {
      album: null,
      dataSource: "unavailable",
      nextPhotoId: null,
      photo: null,
      previousPhotoId: null,
      statusReason: "read-error",
    };
  }
}

export async function getAlbumWorkspaceData(selectedAlbumId?: string, selectedPhotoId?: string): Promise<AlbumWorkspaceData> {
  if (!isAlbumStorageConfigured()) {
    return {
      activeAlbum: null,
      activePhoto: null,
      albumComments: [],
      albums: [],
      dataSource: "unavailable",
      nextPhotoId: null,
      photos: [],
      previousPhotoId: null,
      statusReason: "missing-env",
    };
  }

  try {
    const albums = await listAlbums();
    const activeAlbum = selectedAlbumId ? await getAlbumById(selectedAlbumId) : albums[0] ?? null;

    if (!activeAlbum) {
      return {
        activeAlbum: null,
        activePhoto: null,
        albumComments: [],
        albums,
        dataSource: "available",
        nextPhotoId: null,
        photos: [],
        previousPhotoId: null,
      };
    }

    const [photos, albumComments] = await Promise.all([listAlbumPhotos(activeAlbum.id), listAlbumComments(activeAlbum.id)]);
    const activePhoto = selectedPhotoId ? await getAlbumPhotoById(activeAlbum.id, selectedPhotoId) : null;
    const adjacentPhotoIds = activePhoto ? await getAdjacentAlbumPhotoIds(activeAlbum.id, activePhoto.id) : { previousPhotoId: null, nextPhotoId: null };

    return {
      activeAlbum,
      activePhoto,
      albumComments,
      albums,
      dataSource: "available",
      nextPhotoId: adjacentPhotoIds.nextPhotoId,
      photos,
      previousPhotoId: adjacentPhotoIds.previousPhotoId,
    };
  } catch (error) {
    console.warn(error instanceof Error ? error.message : "读取相册工作台失败");

    return {
      activeAlbum: null,
      activePhoto: null,
      albumComments: [],
      albums: [],
      dataSource: "unavailable",
      nextPhotoId: null,
      photos: [],
      previousPhotoId: null,
      statusReason: "read-error",
    };
  }
}
