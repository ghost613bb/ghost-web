import { describe, expect, it } from "vitest";
import { aboutProfile } from "./about";
import { albumCollections } from "./album";
import {
  albumPhotos,
  getAdjacentAlbumPhotoIds,
  getAlbumPhotoById,
  getAlbumPhotosByAlbumId,
} from "./albumPhotos";
import { featuredPlaylistSongId, playlistCollections, playlistPlayerSnapshot, playlistSongs } from "./playlists";
import { thoughts } from "./thoughts";
import { lifeTodos } from "./todo";

describe("local content data", () => {
  it("defines the first-version about profile", () => {
    expect(aboutProfile.nickname).toBe("主包");
    expect(aboutProfile.links.map((link) => link.href)).toEqual(["/message", "/thoughts"]);
  });

  it("defines public album, playlist, and todo content", () => {
    expect(albumCollections.every((album) => album.visibility === "public" && album.status === "published")).toBe(true);
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

  it("defines thoughts for public, interview-hidden, and masked visibility", () => {
    expect(thoughts).toHaveLength(7);
    expect(thoughts.map((thought) => thought.slug)).toEqual([
      "glowing-town",
      "interview-mode",
      "masked-note",
      "glowing-town-copy-1",
      "glowing-town-copy-2",
      "glowing-town-copy-3",
      "glowing-town-copy-4",
    ]);
    expect(thoughts.every((thought) => !("description" in thought))).toBe(true);
    expect(thoughts.map((thought) => thought.visibility)).toEqual(["public", "interview_hidden", "masked", "public", "public", "public", "public"]);
  });

  it("defines album photo records and adjacent navigation helpers", () => {
    expect(albumPhotos).toHaveLength(7);
    expect(getAlbumPhotosByAlbumId("album-001").map((photo) => photo.id)).toEqual([
      "photo-001",
      "photo-002",
      "photo-003",
      "photo-004",
      "photo-005",
      "photo-006",
      "photo-007",
    ]);

    expect(getAlbumPhotoById("album-001", "photo-001")).toMatchObject({
      id: "photo-001",
      albumId: "album-001",
      title: "Sleepy head...",
      uploadedAt: "Oct 24, 2023 / 4:30",
    });

    expect(getAdjacentAlbumPhotoIds("album-001", "photo-001")).toEqual({
      previousPhotoId: null,
      nextPhotoId: "photo-002",
    });

    expect(getAdjacentAlbumPhotoIds("album-001", "photo-004")).toEqual({
      previousPhotoId: "photo-003",
      nextPhotoId: "photo-005",
    });

    expect(getAdjacentAlbumPhotoIds("album-001", "photo-007")).toEqual({
      previousPhotoId: "photo-006",
      nextPhotoId: null,
    });
  });
});
