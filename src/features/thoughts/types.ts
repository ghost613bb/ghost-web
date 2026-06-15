import type { BaseContent } from "@/features/content-modules/types";

export type Thought = Omit<BaseContent, "description" | "tags"> & {
  slug: string;
  body: string;
  bodyText?: string;
  coverImageUrl?: string;
  deletedAt?: string;
  excerpt?: string;
  paperBackgroundImageUrl?: string;
  paperBackgroundOpacity?: number;
  pinned?: boolean;
  publishedAt?: string;
};
