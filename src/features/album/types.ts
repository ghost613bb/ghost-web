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
  imagePosition?: string;
  imageUrl: string;
  note?: string;
  title?: string;
};

export type AlbumComment = {
  albumId: string;
  author: string;
  avatar: string;
  content: string;
  createdAt?: string;
  id: string;
  time: string;
};

export type CreateAlbumCommentInput = {
  author: string;
  content: string;
};

export type UpdateAlbumPhotoInput = {
  note?: string;
  title: string;
};
