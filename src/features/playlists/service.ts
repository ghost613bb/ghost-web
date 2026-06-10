import {
  featuredPlaylistSongId,
  playlistCollections,
  playlistNotes,
  playlistPlayerSnapshot,
  playlistSongs,
  type PlaylistCollection,
  type PlaylistNote,
  type PlaylistPlayerSnapshot,
  type PlaylistSong,
} from "@/data/playlists";
import { hasSupabaseServerEnv } from "@/lib/supabase/server";
import { getSupabasePlaylistData } from "./repository";

export type PlaylistPageData = {
  collections: PlaylistCollection[];
  featuredSongId: string;
  notes: PlaylistNote[];
  playerSnapshot: PlaylistPlayerSnapshot;
  songs: PlaylistSong[];
};

export function getStaticPlaylistPageData(): PlaylistPageData {
  return {
    collections: playlistCollections,
    featuredSongId: featuredPlaylistSongId,
    notes: playlistNotes,
    playerSnapshot: playlistPlayerSnapshot,
    songs: playlistSongs,
  };
}

function buildPlayerSnapshot(collections: PlaylistCollection[]): PlaylistPlayerSnapshot {
  return {
    ...playlistPlayerSnapshot,
    currentTime: "0:00",
    progressPercent: 0,
    statusLabel: `正在循环 ${collections[0]?.title ?? "歌单"}`,
  };
}

export async function getPlaylistPageData(): Promise<PlaylistPageData> {
  if (!hasSupabaseServerEnv()) {
    return getStaticPlaylistPageData();
  }

  try {
    const data = await getSupabasePlaylistData();

    if (data.songs.length === 0 || data.collections.length === 0) {
      return getStaticPlaylistPageData();
    }

    return {
      ...data,
      featuredSongId: data.collections[0]?.songIds[0] ?? data.songs[0]?.id ?? featuredPlaylistSongId,
      playerSnapshot: buildPlayerSnapshot(data.collections),
    };
  } catch (error) {
    console.warn(error instanceof Error ? error.message : "读取 Supabase 歌单失败，已回退静态数据");
    return getStaticPlaylistPageData();
  }
}
