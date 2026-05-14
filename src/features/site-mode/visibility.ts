import type { BaseContent, SiteMode } from "@/features/content-modules/types";

export type RestrictedReason = "draft" | "private" | "interview_hidden" | null;

export function getRestrictedReason(content: BaseContent, siteMode: SiteMode): RestrictedReason {
  if (content.status !== "published") {
    return "draft";
  }

  if (content.visibility === "private") {
    return "private";
  }

  if (siteMode === "interview" && content.visibility === "interview_hidden") {
    return "interview_hidden";
  }

  return null;
}

export function canDisplayContent(content: BaseContent, siteMode: SiteMode): boolean {
  return getRestrictedReason(content, siteMode) === null;
}

export function isBodyVisible(content: BaseContent, siteMode: SiteMode): boolean {
  return canDisplayContent(content, siteMode) && content.visibility !== "masked";
}
