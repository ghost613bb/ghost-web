function normalizeExtension(extension: string) {
  const normalizedExtension = extension.replace(/^\./, "").trim().toLowerCase();

  return normalizedExtension || "bin";
}

export function sanitizeThoughtAttachmentFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.replace(/[^a-zA-Z0-9]+/g, "").toLowerCase();

  return extension ? `attachment.${extension}` : "attachment";
}

export function sanitizeAlbumUploadFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function buildThoughtAttachmentFileName(fileName: string, timestamp = Date.now()) {
  return `attachments/thought-attachment-${timestamp}-${sanitizeThoughtAttachmentFileName(fileName)}`;
}

export function buildAlbumCoverFileName(albumId: string, fileName: string) {
  return `${albumId}/cover/${sanitizeAlbumUploadFileName(fileName || "cover")}`;
}

export function buildAlbumPhotoFileName(albumId: string, photoId: string, fileName: string) {
  return `${albumId}/photos/${photoId}-${sanitizeAlbumUploadFileName(fileName || "photo")}`;
}

export function buildAlbumCoverVariantFileName(albumId: string, variant: "display" | "thumbnail", fileName: string) {
  return `${albumId}/cover/${variant}-${sanitizeAlbumUploadFileName(fileName || "cover")}`;
}

export function buildAlbumPhotoVariantFileName(albumId: string, photoId: string, variant: "display" | "thumbnail", fileName: string) {
  return `${albumId}/photos/${photoId}-${variant}-${sanitizeAlbumUploadFileName(fileName || "photo")}`;
}

export function buildPlaylistCollectionCoverPath(collectionId: string, extension: string) {
  return `collections/${collectionId}/cover.${normalizeExtension(extension)}`;
}

export function buildPlaylistAudioPath(songId: string) {
  return `songs/${songId}/audio.mp3`;
}

export function buildPlaylistSongCoverPath(songId: string, extension: string) {
  return `songs/${songId}/cover.${normalizeExtension(extension)}`;
}
