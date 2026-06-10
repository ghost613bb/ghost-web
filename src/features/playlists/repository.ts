import type { PlaylistCollection, PlaylistLyricLine, PlaylistNote, PlaylistSong } from "@/data/playlists";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PlaylistSongRow = {
  id: string;
  title: string;
  artist: string;
  feeling: string | null;
  audio_src: string | null;
  cover_image_src: string | null;
  lyric_lines: unknown;
  short_review: string | null;
  tags: unknown;
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

function parseTags(value: unknown): string[] {
  return parseJsonArray(value).filter((tag): tag is string => typeof tag === "string");
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
    tags: parseTags(row.tags),
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

export async function getSupabasePlaylistData(): Promise<SupabasePlaylistData> {
  const supabase = createSupabaseServerClient();

  const [songsResult, collectionsResult, collectionSongsResult, notesResult] = await Promise.all([
    supabase
      .from("playlist_songs")
      .select("id,title,artist,feeling,audio_src,cover_image_src,lyric_lines,short_review,tags,visibility,status,sort_order,created_at")
      .eq("status", "published")
      .order("sort_order", { ascending: true }),
    supabase.from("playlist_collections").select("id,title,description,emoji,accent_class,sort_order").order("sort_order", { ascending: true }),
    supabase.from("playlist_collection_songs").select("collection_id,song_id,sort_order").order("sort_order", { ascending: true }),
    supabase.from("playlist_notes").select("id,song_id,author,content,avatar,created_at").order("created_at", { ascending: true }),
  ]);

  throwSupabaseError("读取 Supabase 歌曲失败", songsResult.error);
  throwSupabaseError("读取 Supabase 歌单失败", collectionsResult.error);
  throwSupabaseError("读取 Supabase 歌单歌曲关系失败", collectionSongsResult.error);
  throwSupabaseError("读取 Supabase 歌单留言失败", notesResult.error);

  const relationsByCollection = new Map<string, string[]>();

  ((collectionSongsResult.data ?? []) as PlaylistCollectionSongRow[]).forEach((relation) => {
    const songIds = relationsByCollection.get(relation.collection_id) ?? [];
    songIds.push(relation.song_id);
    relationsByCollection.set(relation.collection_id, songIds);
  });

  return {
    songs: ((songsResult.data ?? []) as PlaylistSongRow[]).map((row) => toPlaylistSong(row)),
    collections: ((collectionsResult.data ?? []) as PlaylistCollectionRow[]).map((row) => toPlaylistCollection(row, relationsByCollection.get(row.id) ?? [])),
    notes: ((notesResult.data ?? []) as PlaylistNoteRow[]).map((row) => toPlaylistNote(row)),
  };
}
