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
