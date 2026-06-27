import { buildSupabaseImageTransformUrl } from "@/features/storage/supabaseImageTransforms";
import type { Album, AlbumPhoto } from "./types";

export function getAlbumCoverDisplayUrl(album: Album | null) {
  return album?.coverDisplayImage ?? buildSupabaseImageTransformUrl(album?.coverImage, { width: 1280, quality: 78 }) ?? album?.coverImage ?? null;
}

export function getAlbumCoverThumbnailUrl(album: Album | null) {
  return album?.coverThumbnailImage ?? buildSupabaseImageTransformUrl(album?.coverImage, { width: 480, quality: 72 }) ?? album?.coverImage ?? null;
}

export function getAlbumPhotoDisplayUrl(photo: AlbumPhoto | null) {
  return photo?.displayUrl ?? buildSupabaseImageTransformUrl(photo?.imageUrl, { width: 1600, quality: 82 }) ?? photo?.imageUrl ?? null;
}

export function getAlbumPhotoPreviewUrl(photo: AlbumPhoto | null) {
  return photo?.thumbnailUrl ?? buildSupabaseImageTransformUrl(photo?.imageUrl, { width: 800, quality: 74 }) ?? photo?.imageUrl ?? null;
}
