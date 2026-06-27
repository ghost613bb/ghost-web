import { NextResponse } from "next/server";
import { buildThoughtAttachmentFileName } from "@/features/storage/paths";
import { assertThoughtAttachmentSize, getThoughtAttachmentKind } from "@/features/storage/validation";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type SignedUploadPayload = {
  contentType?: unknown;
  fileName?: unknown;
  size?: unknown;
};

function getThoughtStorageBucket() {
  return process.env.STORAGE_BUCKET_THOUGHTS ?? "thought-assets";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SignedUploadPayload;
    const fileName = typeof payload.fileName === "string" && payload.fileName.trim().length > 0 ? payload.fileName.trim() : "attachment";
    const contentType = typeof payload.contentType === "string" ? payload.contentType : "";
    const size = typeof payload.size === "number" ? payload.size : 0;

    if (size <= 0) {
      return NextResponse.json({ error: "请先选择附件" }, { status: 400 });
    }

    const attachmentType = getThoughtAttachmentKind(contentType, fileName);

    if (!attachmentType) {
      return NextResponse.json({ error: "只支持上传图片、视频或文件附件" }, { status: 400 });
    }

    assertThoughtAttachmentSize(attachmentType, size);

    const objectPath = buildThoughtAttachmentFileName(fileName);
    const bucket = getThoughtStorageBucket();
    const supabase = createSupabaseServiceRoleClient();
    const storage = supabase.storage.from(bucket);
    const { data, error } = await storage.createSignedUploadUrl(objectPath, { upsert: true });

    if (error) {
      throw new Error(error.message);
    }

    const { data: publicUrlData } = storage.getPublicUrl(objectPath);

    return NextResponse.json({
      attachment: {
        fileName: objectPath,
        type: attachmentType,
        upload: {
          path: data.path,
          signedUrl: data.signedUrl,
          token: data.token,
        },
        url: publicUrlData.publicUrl,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "附件上传签名失败" }, { status: 400 });
  }
}
