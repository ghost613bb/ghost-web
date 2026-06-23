import { NextResponse } from "next/server";
import { buildThoughtAttachmentFileName } from "@/features/storage/paths";
import { uploadStorageObject } from "@/features/storage/service";
import { assertThoughtAttachmentSize, getThoughtAttachmentKind, isUploadedFile } from "@/features/storage/validation";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const rawAttachmentFile = formData.get("attachmentFile");
    const rawAttachmentFileName = formData.get("attachmentFileName");

    if (!isUploadedFile(rawAttachmentFile) || rawAttachmentFile.size === 0) {
      return NextResponse.json({ error: "请先选择附件" }, { status: 400 });
    }

    const requestedFileName = typeof rawAttachmentFileName === "string" && rawAttachmentFileName.trim().length > 0 ? rawAttachmentFileName.trim() : rawAttachmentFile.name;
    const attachmentType = getThoughtAttachmentKind(rawAttachmentFile.type, requestedFileName);

    if (!attachmentType) {
      return NextResponse.json({ error: "只支持上传图片、视频或文件附件" }, { status: 400 });
    }

    assertThoughtAttachmentSize(attachmentType, rawAttachmentFile.size);

    const finalFileName = buildThoughtAttachmentFileName(requestedFileName || "attachment");
    const result = await uploadStorageObject({
      buffer: Buffer.from(await rawAttachmentFile.arrayBuffer()),
      contentType: rawAttachmentFile.type,
      objectPath: finalFileName,
      scope: "thoughts",
    });

    return NextResponse.json({
      attachment: {
        fileName: finalFileName,
        type: attachmentType,
        url: result.url,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "附件上传失败" }, { status: 400 });
  }
}
