import { describe, expect, it } from "vitest";
import {
  buildAlbumCoverFileName,
  buildAlbumCoverVariantFileName,
  buildAlbumPhotoFileName,
  buildAlbumPhotoVariantFileName,
  buildPlaylistAudioPath,
  buildPlaylistCollectionCoverPath,
  buildPlaylistSongCoverPath,
  buildThoughtAttachmentFileName,
} from "./paths";

describe("storage paths", () => {
  it("keeps the current thought attachment file naming rule", () => {
    expect(buildThoughtAttachmentFileName("小猫 photo.png", 1719206400000)).toBe("attachments/thought-attachment-1719206400000-attachment.png");
  });

  it("keeps the current album file naming rules", () => {
    expect(buildAlbumCoverFileName("album-created-001", "summer cover.png")).toBe("album-created-001/cover/summer-cover.png");
    expect(buildAlbumPhotoFileName("album-created-001", "photo-001", "cat window.png")).toBe("album-created-001/photos/photo-001-cat-window.png");
    expect(buildAlbumCoverVariantFileName("album-created-001", "display", "summer cover.webp")).toBe("album-created-001/cover/display-summer-cover.webp");
    expect(buildAlbumCoverVariantFileName("album-created-001", "thumbnail", "summer cover.webp")).toBe("album-created-001/cover/thumbnail-summer-cover.webp");
    expect(buildAlbumPhotoVariantFileName("album-created-001", "photo-001", "display", "cat window.webp")).toBe("album-created-001/photos/photo-001-display-cat-window.webp");
    expect(buildAlbumPhotoVariantFileName("album-created-001", "photo-001", "thumbnail", "cat window.webp")).toBe("album-created-001/photos/photo-001-thumbnail-cat-window.webp");
  });

  it("keeps the current playlist object path rules", () => {
    expect(buildPlaylistCollectionCoverPath("collection-001", ".PNG")).toBe("collections/collection-001/cover.png");
    expect(buildPlaylistAudioPath("song-001")).toBe("songs/song-001/audio.mp3");
    expect(buildPlaylistSongCoverPath("song-001", "WebP")).toBe("songs/song-001/cover.webp");
  });
});
