export type Visibility = "public" | "private" | "interview_hidden" | "masked";

export type PublishStatus = "draft" | "published";

export type SiteMode = "normal" | "interview";

export type BaseContent = {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  tags?: string[];
  visibility: Visibility;
  status: PublishStatus;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};
