const THOUGHT_IMAGE_SIZE_LIMIT = 10 * 1024 * 1024;
const THOUGHT_VIDEO_SIZE_LIMIT = 100 * 1024 * 1024;

export type ThoughtAttachmentKind = "image" | "video";

export function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return value !== null && typeof value !== "string" && typeof value.arrayBuffer === "function" && typeof value.name === "string" && typeof value.size === "number";
}

export function getThoughtAttachmentKind(contentType: string): ThoughtAttachmentKind | null {
  if (contentType.startsWith("image/")) {
    return "image";
  }

  if (contentType.startsWith("video/")) {
    return "video";
  }

  return null;
}

export function assertThoughtAttachmentSize(kind: ThoughtAttachmentKind, size: number) {
  if (kind === "image" && size > THOUGHT_IMAGE_SIZE_LIMIT) {
    throw new Error("图片附件不能超过 10MB");
  }

  if (kind === "video" && size > THOUGHT_VIDEO_SIZE_LIMIT) {
    throw new Error("视频附件不能超过 100MB");
  }
}
