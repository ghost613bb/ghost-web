import type { Visibility } from "@/features/content-modules/types";

export type Album = {
  coverImage?: string;
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
  coverImage?: string;
  description?: string;
  id?: string;
  title: string;
};

export type CreateAlbumPhotoInput = {
  id?: string;
  imagePosition?: string;
  imageUrl: string;
  note?: string;
};

export type AlbumPhoto = {
  albumId: string;
  id: string;
  imagePosition: string;
  imageUrl: string;
  note: string;
  uploadedAt: string;
};

export type UpdateAlbumPhotoInput = {
  note?: string;
};
