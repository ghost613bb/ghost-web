import { asc, desc, eq } from "drizzle-orm";
import type { Album } from "./types";
import { db } from "@/lib/db/client";
import { albums as albumsTable } from "@/lib/db/schema";

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

export async function getStoredAlbumById(id: string): Promise<Album | null> {
  const [row] = await db.select().from(albumsTable).where(eq(albumsTable.id, id)).limit(1);

  return row ? toAlbum(row) : null;
}

export async function resetStoredAlbums() {
  await db.delete(albumsTable).where(eq(albumsTable.id, albumsTable.id));
}
