import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { Album, AlbumPhoto } from "./types";

type StoredAlbumRow = {
  cover_image: string | null;
  created_at: string | null;
  description: string | null;
  id: string;
  photo_count: number;
  sort_order: number | null;
  status: Album["status"];
  title: string;
  visibility: Album["visibility"];
};

type StoredAlbumPhotoRow = {
  album_id: string;
  id: string;
  image_position: string;
  image_url: string;
  note: string | null;
  sort_order: number;
  uploaded_at: string;
};

const albumColumns = "id,title,description,cover_image,photo_count,visibility,status,created_at,sort_order";
const albumPhotoColumns = "id,album_id,uploaded_at,note,image_url,image_position,sort_order";
const isTestEnvironment = process.env.NODE_ENV === "test";
const testAlbumStore = new Map<string, Album>();
const testAlbumPhotoStore = new Map<string, StoredAlbumPhotoRow>();

function toAlbum(row: StoredAlbumRow): Album {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    coverImage: row.cover_image ?? undefined,
    photoCount: row.photo_count,
    visibility: row.visibility,
    status: row.status,
    createdAt: row.created_at ?? undefined,
    sortOrder: row.sort_order ?? undefined,
  };
}

function toStoredAlbumRow(album: Album): StoredAlbumRow {
  return {
    id: album.id,
    title: album.title,
    description: album.description ?? null,
    cover_image: album.coverImage ?? null,
    photo_count: album.photoCount,
    visibility: album.visibility,
    status: album.status,
    created_at: album.createdAt ?? null,
    sort_order: album.sortOrder ?? null,
  };
}

function toAlbumPhoto(row: StoredAlbumPhotoRow): AlbumPhoto {
  return {
    id: row.id,
    albumId: row.album_id,
    uploadedAt: row.uploaded_at,
    note: row.note ?? "",
    imageUrl: row.image_url,
    imagePosition: row.image_position,
  };
}

function toStoredAlbumPhotoRow(photo: AlbumPhoto, sortOrder: number): StoredAlbumPhotoRow {
  return {
    id: photo.id,
    album_id: photo.albumId,
    uploaded_at: photo.uploadedAt,
    note: photo.note,
    image_url: photo.imageUrl,
    image_position: photo.imagePosition,
    sort_order: sortOrder,
  };
}

function sortAlbums(left: Album, right: Album) {
  const leftSortOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const rightSortOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;

  if (leftSortOrder !== rightSortOrder) {
    return leftSortOrder - rightSortOrder;
  }

  return (right.createdAt ?? "").localeCompare(left.createdAt ?? "");
}

function sortAlbumPhotos(left: StoredAlbumPhotoRow, right: StoredAlbumPhotoRow) {
  if (left.sort_order !== right.sort_order) {
    return left.sort_order - right.sort_order;
  }

  return right.uploaded_at.localeCompare(left.uploaded_at);
}

function throwSupabaseError(context: string, error: { message: string } | null) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

function listTestStoredAlbumRows() {
  return [...testAlbumStore.values()].sort(sortAlbums);
}

function listTestStoredAlbumPhotoRowsByAlbumId(albumId: string) {
  return [...testAlbumPhotoStore.values()].filter((photo) => photo.album_id === albumId).sort(sortAlbumPhotos);
}

export async function listStoredAlbums(): Promise<Album[]> {
  if (isTestEnvironment) {
    return listTestStoredAlbumRows();
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("albums").select(albumColumns).order("sort_order", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false, nullsFirst: false });

  throwSupabaseError("读取 Supabase 相册失败", error);

  return ((data ?? []) as StoredAlbumRow[]).map((row) => toAlbum(row));
}

export async function upsertStoredAlbum(album: Album) {
  if (isTestEnvironment) {
    testAlbumStore.set(album.id, album);
    return;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from("albums").upsert(toStoredAlbumRow(album), { onConflict: "id" });

  throwSupabaseError("写入 Supabase 相册失败", error);
}

export async function listStoredAlbumPhotosByAlbumId(albumId: string): Promise<AlbumPhoto[]> {
  if (isTestEnvironment) {
    return listTestStoredAlbumPhotoRowsByAlbumId(albumId).map((row) => toAlbumPhoto(row));
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("album_photos").select(albumPhotoColumns).eq("album_id", albumId).order("sort_order", { ascending: true, nullsFirst: false }).order("uploaded_at", { ascending: false, nullsFirst: false });

  throwSupabaseError("读取 Supabase 相册照片失败", error);

  return ((data ?? []) as StoredAlbumPhotoRow[]).map((row) => toAlbumPhoto(row));
}

export async function upsertStoredAlbumPhoto(photo: AlbumPhoto, sortOrder: number) {
  if (isTestEnvironment) {
    testAlbumPhotoStore.set(photo.id, toStoredAlbumPhotoRow(photo, sortOrder));
    return;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from("album_photos").upsert(toStoredAlbumPhotoRow(photo, sortOrder), { onConflict: "id" });

  throwSupabaseError("写入 Supabase 相册照片失败", error);
}

export async function getStoredAlbumById(id: string): Promise<Album | null> {
  if (isTestEnvironment) {
    return testAlbumStore.get(id) ?? null;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("albums").select(albumColumns).eq("id", id).maybeSingle();

  throwSupabaseError("读取 Supabase 相册失败", error);

  return data ? toAlbum(data as StoredAlbumRow) : null;
}

export async function getStoredAlbumPhotoById(albumId: string, photoId: string): Promise<AlbumPhoto | null> {
  if (isTestEnvironment) {
    const row = testAlbumPhotoStore.get(photoId);
    return row && row.album_id === albumId ? toAlbumPhoto(row) : null;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("album_photos").select(albumPhotoColumns).eq("album_id", albumId).eq("id", photoId).maybeSingle();

  throwSupabaseError("读取 Supabase 相册照片失败", error);

  return data ? toAlbumPhoto(data as StoredAlbumPhotoRow) : null;
}

export async function deleteStoredAlbumPhoto(albumId: string, photoId: string) {
  if (isTestEnvironment) {
    const row = testAlbumPhotoStore.get(photoId);

    if (row?.album_id === albumId) {
      testAlbumPhotoStore.delete(photoId);
    }

    return;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from("album_photos").delete().eq("album_id", albumId).eq("id", photoId);

  throwSupabaseError("删除 Supabase 相册照片失败", error);
}

export async function deleteStoredAlbum(id: string) {
  if (isTestEnvironment) {
    testAlbumStore.delete(id);

    for (const [photoId, photo] of testAlbumPhotoStore.entries()) {
      if (photo.album_id === id) {
        testAlbumPhotoStore.delete(photoId);
      }
    }

    return;
  }

  const supabase = createSupabaseServiceRoleClient();
  const deletePhotosResult = await supabase.from("album_photos").delete().eq("album_id", id);
  throwSupabaseError("删除 Supabase 相册照片失败", deletePhotosResult.error);

  const deleteAlbumResult = await supabase.from("albums").delete().eq("id", id);
  throwSupabaseError("删除 Supabase 相册失败", deleteAlbumResult.error);
}

export async function resetStoredAlbums() {
  if (!isTestEnvironment) {
    throw new Error("resetStoredAlbums 仅供测试使用");
  }

  testAlbumStore.clear();
  testAlbumPhotoStore.clear();
}
