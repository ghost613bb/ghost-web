import { asc, desc, eq, ne } from "drizzle-orm";
import type { AlbumPhoto } from "@/data/albumPhotos";
import { db } from "@/lib/db/client";
import { albumPhotos as albumPhotosTable, albums as albumsTable } from "@/lib/db/schema";
import type { Album } from "./types";

type StoredAlbumRow = {
  coverImage: string | null;
  createdAt: string | null;
  description: string | null;
  id: string;
  photoCount: number;
  sortOrder: number | null;
  status: Album["status"];
  title: string;
  visibility: Album["visibility"];
};

type StoredAlbumPhotoRow = {
  albumId: string;
  id: string;
  imagePosition: string;
  imageUrl: string;
  note: string | null;
  sortOrder: number;
  title: string;
  uploadedAt: string;
};

function toAlbum(row: StoredAlbumRow): Album {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    coverImage: row.coverImage ?? undefined,
    photoCount: row.photoCount,
    visibility: row.visibility,
    status: row.status,
    createdAt: row.createdAt ?? undefined,
    sortOrder: row.sortOrder ?? undefined,
  };
}

function toAlbumPhoto(row: StoredAlbumPhotoRow): AlbumPhoto {
  return {
    id: row.id,
    albumId: row.albumId,
    title: row.title,
    uploadedAt: row.uploadedAt,
    note: row.note ?? "",
    imageUrl: row.imageUrl,
    imagePosition: row.imagePosition,
  };
}

export async function listStoredAlbums(): Promise<Album[]> {
  const rows = await db.select().from(albumsTable).orderBy(asc(albumsTable.sortOrder), desc(albumsTable.createdAt));
  return rows.map((row) => toAlbum(row));
}

export async function upsertStoredAlbum(album: Album) {
  await db
    .insert(albumsTable)
    .values({
      id: album.id,
      title: album.title,
      description: album.description ?? null,
      coverImage: album.coverImage ?? null,
      photoCount: album.photoCount,
      visibility: album.visibility,
      status: album.status,
      createdAt: album.createdAt ?? null,
      sortOrder: album.sortOrder ?? null,
    })
    .onConflictDoUpdate({
      target: albumsTable.id,
      set: {
        title: album.title,
        description: album.description ?? null,
        coverImage: album.coverImage ?? null,
        photoCount: album.photoCount,
        visibility: album.visibility,
        status: album.status,
        createdAt: album.createdAt ?? null,
        sortOrder: album.sortOrder ?? null,
      },
    });
}

export async function listStoredAlbumPhotosByAlbumId(albumId: string): Promise<AlbumPhoto[]> {
  const rows = await db
    .select()
    .from(albumPhotosTable)
    .where(eq(albumPhotosTable.albumId, albumId))
    .orderBy(asc(albumPhotosTable.sortOrder), desc(albumPhotosTable.uploadedAt));

  return rows.map((row) => toAlbumPhoto(row));
}

export async function upsertStoredAlbumPhoto(photo: AlbumPhoto, sortOrder: number) {
  await db
    .insert(albumPhotosTable)
    .values({
      id: photo.id,
      albumId: photo.albumId,
      title: photo.title,
      uploadedAt: photo.uploadedAt,
      note: photo.note,
      imageUrl: photo.imageUrl,
      imagePosition: photo.imagePosition,
      sortOrder,
    })
    .onConflictDoUpdate({
      target: albumPhotosTable.id,
      set: {
        albumId: photo.albumId,
        title: photo.title,
        uploadedAt: photo.uploadedAt,
        note: photo.note,
        imageUrl: photo.imageUrl,
        imagePosition: photo.imagePosition,
        sortOrder,
      },
    });
}

export async function getStoredAlbumById(id: string): Promise<Album | null> {
  const [row] = await db.select().from(albumsTable).where(eq(albumsTable.id, id)).limit(1);

  return row ? toAlbum(row) : null;
}

export async function getStoredAlbumPhotoById(albumId: string, photoId: string): Promise<AlbumPhoto | null> {
  const [row] = await db
    .select()
    .from(albumPhotosTable)
    .where(eq(albumPhotosTable.albumId, albumId))
    .limit(1000);

  if (!row) {
    return null;
  }

  const photos = await listStoredAlbumPhotosByAlbumId(albumId);
  return photos.find((photo) => photo.id === photoId) ?? null;
}

export async function deleteStoredAlbum(id: string) {
  await db.delete(albumsTable).where(eq(albumsTable.id, id));
  await db.delete(albumPhotosTable).where(eq(albumPhotosTable.albumId, id));
}

export async function getStoredAlbumIds(): Promise<Set<string>> {
  const rows = await db.select({ id: albumsTable.id }).from(albumsTable);
  return new Set(rows.map((row) => row.id));
}

export async function listVisibleStoredAlbums(): Promise<Album[]> {
  const rows = await db
    .select()
    .from(albumsTable)
    .where(ne(albumsTable.status, "draft"))
    .orderBy(asc(albumsTable.sortOrder), desc(albumsTable.createdAt));

  return rows.map((row) => toAlbum(row));
}

export async function resetStoredAlbums() {
  await db.delete(albumPhotosTable).where(eq(albumPhotosTable.id, albumPhotosTable.id));
  await db.delete(albumsTable).where(eq(albumsTable.id, albumsTable.id));
}
