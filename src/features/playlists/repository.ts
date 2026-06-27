import type { PlaylistCollection, PlaylistLyricLine, PlaylistNote, PlaylistSong } from "@/data/playlists";
import { uploadStorageObject } from "@/features/storage/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { measurePlaylistServerTiming } from "./server-timing";

type PlaylistSongRow = {
  id: string;
  title: string;
  artist: string;
  feeling: string | null;
  audio_src: string | null;
  cover_image_src: string | null;
  lyric_lines: unknown;
  short_review: string | null;
  visibility: PlaylistSong["visibility"] | null;
  status: PlaylistSong["status"] | null;
  sort_order: number | null;
  created_at: string | null;
};

type PlaylistCollectionRow = {
  id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  accent_class: string | null;
  cover_image_src?: string | null;
  sort_order: number | null;
};

type PlaylistCollectionSongRow = {
  collection_id: string;
  song_id: string;
  sort_order: number | null;
};

type PlaylistNoteRow = {
  id: string;
  song_id: string;
  author: string;
  content: string;
  avatar: string | null;
  created_at: string | null;
};

export type SupabasePlaylistData = {
  collections: PlaylistCollection[];
  notes: PlaylistNote[];
  songs: PlaylistSong[];
};

function parseJsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function parseLyrics(value: unknown): PlaylistLyricLine[] {
  return parseJsonArray(value)
    .map((line) => {
      if (!line || typeof line !== "object") {
        return null;
      }

      const lyricLine = line as { text?: unknown; time?: unknown };

      if (typeof lyricLine.text !== "string" || typeof lyricLine.time !== "number") {
        return null;
      }

      return {
        text: lyricLine.text,
        time: lyricLine.time,
      };
    })
    .filter((line): line is PlaylistLyricLine => line !== null);
}

function formatNoteTime(createdAt: string | null) {
  if (!createdAt) {
    return "刚刚";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "刚刚";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
  }).format(date);
}

export function toPlaylistSong(row: PlaylistSongRow): PlaylistSong {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    audioSrc: row.audio_src ?? undefined,
    coverImageSrc: row.cover_image_src ?? undefined,
    createdAt: row.created_at ?? undefined,
    description: row.short_review ?? "",
    feeling: row.feeling ?? "",
    lyrics: parseLyrics(row.lyric_lines),
    shortReview: row.short_review ?? undefined,
    visibility: row.visibility ?? "public",
    status: row.status ?? "published",
    sortOrder: row.sort_order ?? undefined,
  };
}

export function toPlaylistCollection(row: PlaylistCollectionRow, songIds: string[]): PlaylistCollection {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    emoji: row.emoji ?? "🎵",
    songIds,
    accentClass: row.accent_class ?? "bg-[#fde2e7]",
    coverImageSrc: row.cover_image_src ?? undefined,
  };
}

export function toPlaylistNote(row: PlaylistNoteRow): PlaylistNote {
  return {
    id: row.id,
    author: row.author,
    time: formatNoteTime(row.created_at),
    content: row.content,
    songId: row.song_id,
    avatar: row.avatar ?? "🎧",
  };
}

function throwSupabaseError(context: string, error: { message: string } | null) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

function isMissingPlaylistCollectionCoverColumnError(error: { message: string } | null) {
  return error?.message.includes("playlist_collections.cover_image_src") && error.message.includes("does not exist");
}

async function listSupabasePlaylistSongs(): Promise<PlaylistSongRow[]> {
  return measurePlaylistServerTiming("list playlist songs", async () => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("playlist_songs")
      .select("id,title,artist,feeling,audio_src,cover_image_src,lyric_lines,short_review,visibility,status,sort_order,created_at")
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    throwSupabaseError("读取 Supabase 歌曲失败", error);

    return (data ?? []) as PlaylistSongRow[];
  });
}

async function listSupabasePlaylistCollections(): Promise<PlaylistCollectionRow[]> {
  return measurePlaylistServerTiming("list playlist collections", async () => {
    const supabase = createSupabaseServerClient();
    const collectionColumns = "id,title,description,emoji,accent_class,cover_image_src,sort_order";
    const fallbackCollectionColumns = "id,title,description,emoji,accent_class,sort_order";
    const result = await supabase.from("playlist_collections").select(collectionColumns).order("sort_order", { ascending: true });

    if (!isMissingPlaylistCollectionCoverColumnError(result.error)) {
      throwSupabaseError("读取 Supabase 歌单失败", result.error);
      return (result.data ?? []) as PlaylistCollectionRow[];
    }

    const fallbackResult = await supabase.from("playlist_collections").select(fallbackCollectionColumns).order("sort_order", { ascending: true });

    throwSupabaseError("读取 Supabase 歌单失败", fallbackResult.error);

    return (fallbackResult.data ?? []) as PlaylistCollectionRow[];
  });
}

async function listSupabasePlaylistCollectionSongRelations(): Promise<PlaylistCollectionSongRow[]> {
  return measurePlaylistServerTiming("list collection song relations", async () => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("playlist_collection_songs").select("collection_id,song_id,sort_order").order("sort_order", { ascending: true });

    throwSupabaseError("读取 Supabase 歌单歌曲关系失败", error);

    return (data ?? []) as PlaylistCollectionSongRow[];
  });
}

async function listSupabasePlaylistNotes(): Promise<PlaylistNoteRow[]> {
  return measurePlaylistServerTiming("list playlist notes", async () => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("playlist_notes").select("id,song_id,author,content,avatar,created_at").order("created_at", { ascending: true });

    throwSupabaseError("读取 Supabase 歌单留言失败", error);

    return (data ?? []) as PlaylistNoteRow[];
  });
}

export async function getSupabasePlaylistData(): Promise<SupabasePlaylistData> {
  return measurePlaylistServerTiming("getSupabasePlaylistData", async () => {
    const [songRows, collectionRows, collectionSongRows, noteRows] = await Promise.all([
      listSupabasePlaylistSongs(),
      listSupabasePlaylistCollections(),
      listSupabasePlaylistCollectionSongRelations(),
      listSupabasePlaylistNotes(),
    ]);

    const relationsByCollection = new Map<string, string[]>();

    collectionSongRows.forEach((relation) => {
      const songIds = relationsByCollection.get(relation.collection_id) ?? [];
      songIds.push(relation.song_id);
      relationsByCollection.set(relation.collection_id, songIds);
    });

    return {
      songs: songRows.map((row) => toPlaylistSong(row)),
      collections: collectionRows.map((row) => toPlaylistCollection(row, relationsByCollection.get(row.id) ?? [])),
      notes: noteRows.map((row) => toPlaylistNote(row)),
    };
  });
}

export type PlaylistCollectionInsert = {
  accentClass: string;
  coverImageSrc?: string;
  description: string;
  emoji: string;
  id: string;
  sortOrder: number;
  title: string;
};

export type PlaylistCollectionUpdate = {
  accentClass: string;
  coverImageSrc?: string | null;
  description: string;
  emoji: string;
  id: string;
  title: string;
};

export type PlaylistNoteInsert = {
  author: string;
  avatar?: string;
  content: string;
  id: string;
  songId: string;
};

export type PlaylistNoteUpdate = {
  author: string;
  avatar?: string;
  content: string;
  noteId: string;
  songId: string;
};

export type PlaylistSongInsert = {
  artist: string;
  audioSrc: string;
  coverImageSrc?: string;
  feeling: string;
  id: string;
  lyrics: PlaylistLyricLine[];
  shortReview: string;
  sortOrder: number;
  title: string;
};

export function requireSupabasePlaylistWriteEnv() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("写入歌单需要配置 SUPABASE_SERVICE_ROLE_KEY");
  }

  if (!process.env.PLAYLIST_IMPORT_ADMIN_TOKEN) {
    throw new Error("写入歌单需要配置 PLAYLIST_IMPORT_ADMIN_TOKEN");
  }
}

export async function getNextSupabasePlaylistCollectionSortOrder() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("playlist_collections").select("sort_order").order("sort_order", { ascending: false }).limit(1);

  throwSupabaseError("读取 Supabase 歌单排序失败", error);

  return ((data?.[0] as { sort_order?: number } | undefined)?.sort_order ?? 0) + 1;
}

export async function insertSupabasePlaylistCollection(collection: PlaylistCollectionInsert) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("playlist_collections")
    .insert({
      id: collection.id,
      title: collection.title,
      description: collection.description,
      emoji: collection.emoji,
      accent_class: collection.accentClass,
      cover_image_src: collection.coverImageSrc ?? null,
      sort_order: collection.sortOrder,
    })
    .select("id,title,description,emoji,accent_class,cover_image_src,sort_order")
    .single();

  throwSupabaseError("写入 Supabase 歌单失败", error);

  return toPlaylistCollection(data as PlaylistCollectionRow, []);
}

export async function updateSupabasePlaylistCollection(collection: PlaylistCollectionUpdate) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("playlist_collections")
    .update({
      title: collection.title,
      description: collection.description,
      emoji: collection.emoji,
      accent_class: collection.accentClass,
      ...(collection.coverImageSrc === undefined ? {} : { cover_image_src: collection.coverImageSrc }),
    })
    .eq("id", collection.id)
    .select("id,title,description,emoji,accent_class,cover_image_src,sort_order")
    .maybeSingle();

  throwSupabaseError("更新 Supabase 歌单失败", error);

  if (!data) {
    throw new Error("目标歌单不存在");
  }

  return toPlaylistCollection(data as PlaylistCollectionRow, []);
}

export async function deleteSupabasePlaylistCollection(collectionId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("playlist_collections").delete().eq("id", collectionId).select("id").maybeSingle();

  throwSupabaseError("删除 Supabase 歌单失败", error);

  if (!data) {
    throw new Error("目标歌单不存在");
  }
}

export async function ensureSupabasePlaylistCollection(collectionId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("playlist_collections").select("id").eq("id", collectionId).maybeSingle();

  throwSupabaseError("校验 Supabase 歌单失败", error);

  if (!data) {
    throw new Error("目标歌单不存在");
  }
}

export async function ensureSupabasePlaylistSong(songId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("playlist_songs").select("id").eq("id", songId).maybeSingle();

  throwSupabaseError("校验 Supabase 歌曲失败", error);

  if (!data) {
    throw new Error("目标歌曲不存在");
  }
}

export async function getNextSupabasePlaylistSongSortOrder() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("playlist_songs").select("sort_order").order("sort_order", { ascending: false }).limit(1);

  throwSupabaseError("读取 Supabase 歌曲排序失败", error);

  return ((data?.[0] as { sort_order?: number } | undefined)?.sort_order ?? 0) + 1;
}

export async function uploadSupabasePlaylistAsset({ buffer, contentType, path }: { buffer: Buffer; contentType: string; path: string }) {
  try {
    const result = await uploadStorageObject({
      buffer,
      contentType,
      objectPath: path,
      provider: "supabase",
      scope: "playlists",
    });

    return result.url;
  } catch (error) {
    throwSupabaseError("上传 Supabase 歌单资源失败", error instanceof Error ? { message: error.message } : { message: "未知错误" });
    throw error;
  }
}

export async function insertSupabasePlaylistSongs(songs: PlaylistSongInsert[]) {
  const supabase = createSupabaseServerClient();
  const rows = songs.map((song) => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    feeling: song.feeling,
    audio_src: song.audioSrc,
    cover_image_src: song.coverImageSrc ?? null,
    lyric_lines: song.lyrics,
    short_review: song.shortReview,
    visibility: "public",
    status: "published",
    sort_order: song.sortOrder,
  }));
  const { error } = await supabase.from("playlist_songs").insert(rows);

  throwSupabaseError("写入 Supabase 歌曲失败", error);
}

export async function insertSupabasePlaylistNote(note: PlaylistNoteInsert) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("playlist_notes")
    .insert({
      id: note.id,
      song_id: note.songId,
      author: note.author,
      content: note.content,
      avatar: note.avatar ?? null,
    })
    .select("id,song_id,author,content,avatar,created_at")
    .single();

  throwSupabaseError("写入 Supabase 歌曲评论失败", error);

  return toPlaylistNote(data as PlaylistNoteRow);
}

export async function updateSupabasePlaylistNote(note: PlaylistNoteUpdate) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("playlist_notes")
    .update({
      author: note.author,
      avatar: note.avatar ?? null,
      content: note.content,
    })
    .eq("id", note.noteId)
    .eq("song_id", note.songId)
    .select("id,song_id,author,content,avatar,created_at")
    .maybeSingle();

  throwSupabaseError("更新 Supabase 歌曲评论失败", error);

  if (!data) {
    throw new Error("目标评论不存在");
  }

  return toPlaylistNote(data as PlaylistNoteRow);
}

export async function deleteSupabasePlaylistNote({ noteId, songId }: { noteId: string; songId: string }) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("playlist_notes").delete().eq("id", noteId).eq("song_id", songId).select("id").maybeSingle();

  throwSupabaseError("删除 Supabase 歌曲评论失败", error);

  if (!data) {
    throw new Error("目标评论不存在");
  }
}

function uniqueSongIds(songIds: string[]) {
  return Array.from(new Set(songIds.map((songId) => songId.trim()).filter(Boolean)));
}

export async function getSupabasePlaylistCollectionSongIds(collectionId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("playlist_collection_songs").select("song_id,sort_order").eq("collection_id", collectionId).order("sort_order", { ascending: true });

  throwSupabaseError("读取 Supabase 歌单歌曲关系失败", error);

  return ((data ?? []) as PlaylistCollectionSongRow[]).map((relation) => relation.song_id);
}

export async function removeSupabasePlaylistCollectionSongs(collectionId: string, songIds: string[]) {
  const uniqueIds = uniqueSongIds(songIds);

  if (uniqueIds.length === 0) {
    return [];
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("playlist_collection_songs").delete().eq("collection_id", collectionId).in("song_id", uniqueIds).select("song_id");

  throwSupabaseError("删除 Supabase 歌单歌曲关系失败", error);

  return ((data ?? []) as Array<{ song_id: string }>).map((relation) => relation.song_id);
}

export async function appendSupabasePlaylistCollectionSongsDeduped(collectionId: string, songIds: string[]) {
  const uniqueIds = uniqueSongIds(songIds);
  const supabase = createSupabaseServerClient();
  const { data, error: readError } = await supabase.from("playlist_collection_songs").select("song_id,sort_order").eq("collection_id", collectionId).order("sort_order", { ascending: true });

  throwSupabaseError("读取 Supabase 歌单歌曲关系失败", readError);

  const existingRelations = (data ?? []) as PlaylistCollectionSongRow[];
  const existingSongIds = new Set(existingRelations.map((relation) => relation.song_id));
  const insertedSongIds = uniqueIds.filter((songId) => !existingSongIds.has(songId));
  const skippedSongIds = uniqueIds.filter((songId) => existingSongIds.has(songId));
  const maxSortOrder = existingRelations.reduce((max, relation) => Math.max(max, relation.sort_order ?? 0), 0);

  if (insertedSongIds.length > 0) {
    const { error } = await supabase.from("playlist_collection_songs").insert(
      insertedSongIds.map((songId, index) => ({
        collection_id: collectionId,
        song_id: songId,
        sort_order: maxSortOrder + index + 1,
      })),
    );

    throwSupabaseError("写入 Supabase 歌单歌曲关系失败", error);
  }

  return {
    insertedSongIds,
    skippedSongIds,
    songIds: await getSupabasePlaylistCollectionSongIds(collectionId),
  };
}

export async function moveSupabasePlaylistCollectionSongs({ sourceCollectionId, targetCollectionId, songIds }: { sourceCollectionId: string; targetCollectionId: string; songIds: string[] }) {
  const uniqueIds = uniqueSongIds(songIds);
  const sourceSongIdsBeforeMove = await getSupabasePlaylistCollectionSongIds(sourceCollectionId);
  const sourceSongIdSet = new Set(sourceSongIdsBeforeMove);
  const movedSongIds = uniqueIds.filter((songId) => sourceSongIdSet.has(songId));
  const targetResult = await appendSupabasePlaylistCollectionSongsDeduped(targetCollectionId, movedSongIds);

  await removeSupabasePlaylistCollectionSongs(sourceCollectionId, movedSongIds);

  return {
    insertedSongIds: targetResult.insertedSongIds,
    movedSongIds,
    skippedSongIds: targetResult.skippedSongIds,
    sourceSongIds: await getSupabasePlaylistCollectionSongIds(sourceCollectionId),
    targetSongIds: await getSupabasePlaylistCollectionSongIds(targetCollectionId),
  };
}

export async function insertSupabasePlaylistCollectionSongs(collectionId: string, songIds: string[]) {
  if (songIds.length === 0) {
    return;
  }

  const supabase = createSupabaseServerClient();
  const { data, error: readError } = await supabase.from("playlist_collection_songs").select("sort_order").eq("collection_id", collectionId).order("sort_order", { ascending: false }).limit(1);

  throwSupabaseError("读取 Supabase 歌单歌曲排序失败", readError);

  const nextSortOrder = ((data?.[0] as { sort_order?: number } | undefined)?.sort_order ?? 0) + 1;
  const { error } = await supabase.from("playlist_collection_songs").insert(
    songIds.map((songId, index) => ({
      collection_id: collectionId,
      song_id: songId,
      sort_order: nextSortOrder + index,
    })),
  );

  throwSupabaseError("写入 Supabase 歌单歌曲关系失败", error);
}
