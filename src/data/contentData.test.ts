import { describe, expect, it } from "vitest";
import { aboutProfile } from "./about";
import { featuredPlaylistSongId, playlistCollections, playlistPlayerSnapshot, playlistSongs } from "./playlists";
import { thoughts } from "./thoughts";
import { lifeTodos } from "./todo";

describe("local content data", () => {
  it("defines the first-version about profile", () => {
    expect(aboutProfile.nickname).toBe("主包");
    expect(aboutProfile.links.map((link) => link.href)).toEqual(["/message", "/thoughts"]);
  });

  it("defines public playlist and todo content", () => {
    expect(playlistSongs.every((song) => song.visibility === "public" && song.status === "published")).toBe(true);
    expect(lifeTodos.map((item) => item.state)).toEqual(["planned", "planned"]);
  });

  it("defines playlist page display data", () => {
    const songIds = new Set(playlistSongs.map((song) => song.id));

    expect(songIds.has(featuredPlaylistSongId)).toBe(true);
    expect(playlistCollections.length).toBeGreaterThan(0);
    expect(playlistSongs.find((song) => song.id === "song-001")?.coverImageSrc).toBe("/audio/playlists/xiaoxue-doll-cover.jpg");
    expect(playlistSongs.find((song) => song.id === "song-007")?.audioSrc).toBe("/audio/playlists/kui-kui-zhouyi-yuxing.mp3");
    expect(playlistSongs.find((song) => song.id === "song-007")?.coverImageSrc).toBe("/audio/playlists/kui-kui-zhouyi-yuxing-cover.jpg");
    expect(playlistCollections.every((collection) => collection.songIds.every((songId) => songIds.has(songId)))).toBe(true);
    expect(playlistPlayerSnapshot.progressPercent).toBeGreaterThanOrEqual(0);
    expect(playlistPlayerSnapshot.progressPercent).toBeLessThanOrEqual(100);
    expect(playlistPlayerSnapshot.volumePercent).toBeGreaterThanOrEqual(0);
    expect(playlistPlayerSnapshot.volumePercent).toBeLessThanOrEqual(100);
  });

  it("keeps local thoughts empty because Supabase is the source of truth", () => {
    expect(thoughts).toEqual([]);
  });
});
