const THOUGHT_IMAGE_SIZE_LIMIT = 10 * 1024 * 1024;
const THOUGHT_VIDEO_SIZE_LIMIT = 100 * 1024 * 1024;
const THOUGHT_FILE_SIZE_LIMIT = 20 * 1024 * 1024;
const thoughtFileAttachmentMimeTypes = new Set(["application/pdf", "text/plain", "text/markdown", "application/zip", "application/x-zip-compressed"]);
const thoughtFileAttachmentExtensions = new Set(["pdf", "txt", "md", "zip"]);

export type ThoughtAttachmentKind = "image" | "video" | "file";

export function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return value !== null && typeof value !== "string" && typeof value.arrayBuffer === "function" && typeof value.name === "string" && typeof value.size === "number";
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.trim().toLowerCase() ?? "";
}

function isSupportedThoughtFileAttachment(contentType: string, fileName: string) {
  return thoughtFileAttachmentMimeTypes.has(contentType) || thoughtFileAttachmentExtensions.has(getFileExtension(fileName));
}

export function getThoughtAttachmentKind(contentType: string, fileName = ""): ThoughtAttachmentKind | null {
  if (contentType.startsWith("image/")) {
    return "image";
  }

  if (contentType.startsWith("video/")) {
    return "video";
  }

  if (isSupportedThoughtFileAttachment(contentType, fileName)) {
    return "file";
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

  if (kind === "file" && size > THOUGHT_FILE_SIZE_LIMIT) {
    throw new Error("文件附件不能超过 20MB");
  }
}
