import {
  featuredPlaylistSongId,
  playlistCollections,
  playlistNotes,
  playlistPlayerSnapshot,
  playlistSongs,
} from "@/data/playlists";
import { getDisplayMode } from "@/features/module-display-mode/service";
import { PlaylistsPageView } from "@/features/playlists/PlaylistsPage";

export default async function PlaylistsPage() {
  if ((await getDisplayMode("playlists")) === "demo") {
    return (
      <section className="space-y-3">
        <h1>歌单-演示模式</h1>
        <p>这是歌单模块的基础演示内容。</p>
      </section>
    );
  }

  return (
    <PlaylistsPageView
      collections={playlistCollections}
      featuredSongId={featuredPlaylistSongId}
      notes={playlistNotes}
      playerSnapshot={playlistPlayerSnapshot}
      songs={playlistSongs}
    />
  );
}
