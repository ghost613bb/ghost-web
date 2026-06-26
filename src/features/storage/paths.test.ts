import { describe, expect, it } from "vitest";
import {
  buildAlbumCoverFileName,
  buildAlbumPhotoFileName,
  buildPlaylistAudioPath,
  buildPlaylistCollectionCoverPath,
  buildPlaylistSongCoverPath,
  buildThoughtAttachmentFileName,
} from "./paths";

describe("storage paths", () => {
  it("keeps the current thought attachment file naming rule", () => {
    expect(buildThoughtAttachmentFileName("小猫 photo.png", 1719206400000)).toBe("thought-attachment-1719206400000-小猫-photo.png");
  });

  it("keeps the current album file naming rules", () => {
    expect(buildAlbumCoverFileName("album-created-001", "summer cover.png")).toBe("album-created-001/cover/summer-cover.png");
    expect(buildAlbumPhotoFileName("album-created-001", "photo-001", "cat window.png")).toBe("album-created-001/photos/photo-001-cat-window.png");
  });

  it("keeps the current playlist object path rules", () => {
    expect(buildPlaylistCollectionCoverPath("collection-001", ".PNG")).toBe("collections/collection-001/cover.png");
    expect(buildPlaylistAudioPath("song-001")).toBe("songs/song-001/audio.mp3");
    expect(buildPlaylistSongCoverPath("song-001", "WebP")).toBe("songs/song-001/cover.webp");
  });
});
