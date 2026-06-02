import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const IMAGE_SIZE_LIMIT = 10 * 1024 * 1024;
const VIDEO_SIZE_LIMIT = 100 * 1024 * 1024;

type AttachmentKind = "image" | "video";

function sanitizeFileName(fileName: string) {
  return fileName.trim().replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/^-+|-+$/g, "") || "attachment";
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return value !== null && typeof value !== "string" && typeof value.arrayBuffer === "function" && typeof value.name === "string" && typeof value.size === "number";
}

function getAttachmentKind(type: string): AttachmentKind | null {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  return null;
}

function validateFileSize(kind: AttachmentKind, size: number) {
  if (kind === "image" && size > IMAGE_SIZE_LIMIT) {
    throw new Error("图片附件不能超过 10MB");
  }
  if (kind === "video" && size > VIDEO_SIZE_LIMIT) {
    throw new Error("视频附件不能超过 100MB");
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const rawAttachmentFile = formData.get("attachmentFile");
    const rawAttachmentFileName = formData.get("attachmentFileName");

    if (!isUploadedFile(rawAttachmentFile) || rawAttachmentFile.size === 0) {
      return NextResponse.json({ error: "请先选择附件" }, { status: 400 });
    }

    const attachmentType = getAttachmentKind(rawAttachmentFile.type);

    if (!attachmentType) {
      return NextResponse.json({ error: "只支持上传图片或视频附件" }, { status: 400 });
    }

    validateFileSize(attachmentType, rawAttachmentFile.size);

    const requestedFileName = typeof rawAttachmentFileName === "string" && rawAttachmentFileName.trim().length > 0 ? rawAttachmentFileName.trim() : rawAttachmentFile.name;
    const safeFileName = sanitizeFileName(requestedFileName || "attachment");
    const finalFileName = `thought-attachment-${Date.now()}-${safeFileName}`;
    const uploadDir = process.env.THOUGHT_UPLOAD_DIR ?? path.join(process.cwd(), "public/uploads/thoughts");
    const outputPath = path.join(uploadDir, finalFileName);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(outputPath, Buffer.from(await rawAttachmentFile.arrayBuffer()));

    return NextResponse.json({
      attachment: {
        fileName: finalFileName,
        type: attachmentType,
        url: `/uploads/thoughts/${finalFileName}`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "附件上传失败" }, { status: 400 });
  }
}
