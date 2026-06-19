import type { AlbumPhoto } from "@/data/albumPhotos";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { Album, AlbumComment } from "./types";

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
  title: string;
  uploaded_at: string;
};

type StoredAlbumCommentRow = {
  album_id: string;
  author: string;
  avatar: string | null;
  content: string;
  created_at: string | null;
  id: string;
};

const albumColumns = "id,title,description,cover_image,photo_count,visibility,status,created_at,sort_order";
const albumPhotoColumns = "id,album_id,title,uploaded_at,note,image_url,image_position,sort_order";
const albumCommentColumns = "id,album_id,author,content,avatar,created_at";
const isTestEnvironment = process.env.NODE_ENV === "test";
const testAlbumStore = new Map<string, Album>();
const testAlbumPhotoStore = new Map<string, StoredAlbumPhotoRow>();
const testAlbumPhotoDeletionStore = new Map<string, Set<string>>();
const testAlbumCommentStore = new Map<string, StoredAlbumCommentRow>();

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
    title: row.title,
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
    title: photo.title,
    uploaded_at: photo.uploadedAt,
    note: photo.note,
    image_url: photo.imageUrl,
    image_position: photo.imagePosition,
    sort_order: sortOrder,
  };
}

function formatCommentTime(createdAt: string | null) {
  if (!createdAt) {
    return "刚刚";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "刚刚";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(date);
}

function toAlbumComment(row: StoredAlbumCommentRow): AlbumComment {
  return {
    id: row.id,
    albumId: row.album_id,
    author: row.author,
    avatar: row.avatar ?? "/images/image.png",
    content: row.content,
    createdAt: row.created_at ?? undefined,
    time: formatCommentTime(row.created_at),
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

function isMissingAlbumCommentsTableError(error: { message: string } | null) {
  return error?.message.includes("album_comments") && error.message.includes("does not exist");
}

function listTestStoredAlbumRows() {
  return [...testAlbumStore.values()].sort(sortAlbums);
}

function listTestStoredAlbumPhotoRowsByAlbumId(albumId: string) {
  return [...testAlbumPhotoStore.values()].filter((photo) => photo.album_id === albumId).sort(sortAlbumPhotos);
}

function listTestStoredAlbumCommentRowsByAlbumId(albumId: string) {
  return [...testAlbumCommentStore.values()].filter((comment) => comment.album_id === albumId).sort((left, right) => (left.created_at ?? "").localeCompare(right.created_at ?? ""));
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

export async function listDeletedAlbumPhotoIds(albumId: string): Promise<Set<string>> {
  if (isTestEnvironment) {
    return new Set(testAlbumPhotoDeletionStore.get(albumId) ?? []);
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("album_photo_deletions").select("photo_id").eq("album_id", albumId);

  throwSupabaseError("读取 Supabase 已删除相册照片失败", error);

  return new Set(((data ?? []) as { photo_id: string }[]).map((row) => row.photo_id));
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

export async function markFallbackAlbumPhotoDeleted(albumId: string, photoId: string) {
  if (isTestEnvironment) {
    const deletedPhotoIds = testAlbumPhotoDeletionStore.get(albumId) ?? new Set<string>();
    deletedPhotoIds.add(photoId);
    testAlbumPhotoDeletionStore.set(albumId, deletedPhotoIds);
    return;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from("album_photo_deletions").upsert({ album_id: albumId, photo_id: photoId }, { onConflict: "photo_id" });

  throwSupabaseError("写入 Supabase 相册照片删除记录失败", error);
}

export async function deleteStoredAlbum(id: string) {
  if (isTestEnvironment) {
    testAlbumStore.delete(id);

    for (const [photoId, photo] of testAlbumPhotoStore.entries()) {
      if (photo.album_id === id) {
        testAlbumPhotoStore.delete(photoId);
      }
    }

    for (const [commentId, comment] of testAlbumCommentStore.entries()) {
      if (comment.album_id === id) {
        testAlbumCommentStore.delete(commentId);
      }
    }

    testAlbumPhotoDeletionStore.delete(id);
    return;
  }

  const supabase = createSupabaseServiceRoleClient();
  const deleteCommentsResult = await supabase.from("album_comments").delete().eq("album_id", id);
  throwSupabaseError("删除 Supabase 相册评论失败", deleteCommentsResult.error);

  const deletePhotosResult = await supabase.from("album_photos").delete().eq("album_id", id);
  throwSupabaseError("删除 Supabase 相册照片失败", deletePhotosResult.error);

  const deletePhotoDeletionsResult = await supabase.from("album_photo_deletions").delete().eq("album_id", id);
  throwSupabaseError("删除 Supabase 相册照片删除记录失败", deletePhotoDeletionsResult.error);

  const deleteAlbumResult = await supabase.from("albums").delete().eq("id", id);
  throwSupabaseError("删除 Supabase 相册失败", deleteAlbumResult.error);
}

export async function getStoredAlbumIds(): Promise<Set<string>> {
  if (isTestEnvironment) {
    return new Set(testAlbumStore.keys());
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("albums").select("id");

  throwSupabaseError("读取 Supabase 相册 ID 失败", error);

  return new Set(((data ?? []) as { id: string }[]).map((row) => row.id));
}

export async function listStoredAlbumCommentsByAlbumId(albumId: string): Promise<AlbumComment[]> {
  if (isTestEnvironment) {
    return listTestStoredAlbumCommentRowsByAlbumId(albumId).map((row) => toAlbumComment(row));
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("album_comments").select(albumCommentColumns).eq("album_id", albumId).order("created_at", { ascending: true, nullsFirst: false });

  if (isMissingAlbumCommentsTableError(error)) {
    return [];
  }

  throwSupabaseError("读取 Supabase 相册评论失败", error);

  return ((data ?? []) as StoredAlbumCommentRow[]).map((row) => toAlbumComment(row));
}

export async function insertStoredAlbumComment(comment: { albumId: string; author: string; avatar: string; content: string; createdAt?: string; id: string }) {
  const row: StoredAlbumCommentRow = {
    id: comment.id,
    album_id: comment.albumId,
    author: comment.author,
    content: comment.content,
    avatar: comment.avatar,
    created_at: comment.createdAt ?? new Date().toISOString(),
  };

  if (isTestEnvironment) {
    testAlbumCommentStore.set(comment.id, row);
    return toAlbumComment(row);
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("album_comments").insert(row).select(albumCommentColumns).single();

  throwSupabaseError("写入 Supabase 相册评论失败", error);

  return toAlbumComment(data as StoredAlbumCommentRow);
}

export async function deleteStoredAlbumComment(albumId: string, commentId: string) {
  if (isTestEnvironment) {
    const row = testAlbumCommentStore.get(commentId);

    if (row?.album_id === albumId) {
      testAlbumCommentStore.delete(commentId);
      return;
    }

    throw new Error("评论不存在");
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("album_comments").delete().eq("album_id", albumId).eq("id", commentId).select("id").maybeSingle();

  throwSupabaseError("删除 Supabase 相册评论失败", error);

  if (!data) {
    throw new Error("评论不存在");
  }
}

export async function listVisibleStoredAlbums(): Promise<Album[]> {
  if (isTestEnvironment) {
    return listTestStoredAlbumRows().filter((album) => album.status !== "draft");
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("albums").select(albumColumns).neq("status", "draft").order("sort_order", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false, nullsFirst: false });

  throwSupabaseError("读取 Supabase 可见相册失败", error);

  return ((data ?? []) as StoredAlbumRow[]).map((row) => toAlbum(row));
}

export async function resetStoredAlbums() {
  if (!isTestEnvironment) {
    throw new Error("resetStoredAlbums 仅供测试使用");
  }

  testAlbumStore.clear();
  testAlbumPhotoStore.clear();
  testAlbumPhotoDeletionStore.clear();
  testAlbumCommentStore.clear();
}
