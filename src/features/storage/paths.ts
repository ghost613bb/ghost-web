function normalizeExtension(extension: string) {
  const normalizedExtension = extension.replace(/^\./, "").trim().toLowerCase();

  return normalizedExtension || "bin";
}

export function sanitizeThoughtAttachmentFileName(fileName: string) {
  return fileName.trim().replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/^-+|-+$/g, "") || "attachment";
}

export function sanitizeAlbumUploadFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function buildThoughtAttachmentFileName(fileName: string, timestamp = Date.now()) {
  return `thought-attachment-${timestamp}-${sanitizeThoughtAttachmentFileName(fileName)}`;
}

export function buildAlbumCoverFileName(albumId: string, fileName: string) {
  return `${albumId}/cover/${sanitizeAlbumUploadFileName(fileName || "cover")}`;
}

export function buildAlbumPhotoFileName(albumId: string, photoId: string, fileName: string) {
  return `${albumId}/photos/${photoId}-${sanitizeAlbumUploadFileName(fileName || "photo")}`;
}

export function buildPlaylistCollectionCoverPath(collectionId: string, extension: string) {
  return `collection-covers/${collectionId}.${normalizeExtension(extension)}`;
}

export function buildPlaylistAudioPath(songId: string) {
  return `audio/${songId}.mp3`;
}

export function buildPlaylistSongCoverPath(songId: string, extension: string) {
  return `covers/${songId}.${normalizeExtension(extension)}`;
}
