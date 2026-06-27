import type { Visibility } from "@/features/content-modules/types";

export type Album = {
  coverDisplayImage?: string;
  coverImage?: string;
  coverThumbnailImage?: string;
  createdAt?: string;
  description?: string;
  id: string;
  photoCount: number;
  sortOrder?: number;
  status: "draft" | "published";
  title: string;
  visibility: Visibility;
};

export type CreateAlbumInput = {
  coverDisplayImage?: string | null;
  coverImage?: string;
  coverThumbnailImage?: string | null;
  description?: string;
  id?: string;
  title: string;
};

export type CreateAlbumPhotoInput = {
  displayUrl?: string;
  id?: string;
  imagePosition?: string;
  imageUrl: string;
  note?: string;
  thumbnailUrl?: string;
};

export type AlbumPhoto = {
  albumId: string;
  displayUrl?: string;
  id: string;
  imagePosition: string;
  imageUrl: string;
  note: string;
  thumbnailUrl?: string;
  uploadedAt: string;
};

export type UpdateAlbumPhotoInput = {
  note?: string;
};
