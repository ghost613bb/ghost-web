import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { createAlbum, getNextCreatedAlbumId, listAlbums } from "@/features/album/service";
import { requireAdminRequest } from "@/lib/admin-auth";
import { parseCreateAlbum } from "@/features/album/validation";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    value !== null &&
    typeof value !== "string" &&
    typeof value.arrayBuffer === "function" &&
    typeof value.name === "string" &&
    typeof value.size === "number"
  );
}

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    albums: await listAlbums(),
  });
}

export async function POST(request: Request) {
  const unauthorizedResponse = requireAdminRequest(request, "无权限新增相册");

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const formData = await request.formData();
    const rawTitle = formData.get("title");
    const rawDescription = formData.get("description");
    const rawCoverFile = formData.get("coverFile");
    const rawCoverFileName = formData.get("coverFileName");

    const albumDraft = parseCreateAlbum({
      title: typeof rawTitle === "string" ? rawTitle : "",
      description: typeof rawDescription === "string" ? rawDescription : undefined,
    });

    const albumId = await getNextCreatedAlbumId();

    let coverImage: string | undefined;

    if (isUploadedFile(rawCoverFile) && rawCoverFile.size > 0) {
      const requestedFileName = typeof rawCoverFileName === "string" && rawCoverFileName.trim().length > 0 ? rawCoverFileName.trim() : rawCoverFile.name;
      const safeFileName = sanitizeFileName(requestedFileName || "cover");
      const finalFileName = `${albumId}-${safeFileName}`;
      const uploadDir = process.env.ALBUM_UPLOAD_DIR ?? path.join(process.cwd(), "public/uploads/albums");
      const outputPath = path.join(uploadDir, finalFileName);

      await mkdir(uploadDir, { recursive: true });
      await writeFile(outputPath, Buffer.from(await rawCoverFile.arrayBuffer()));
      coverImage = `/uploads/albums/${finalFileName}`;
    }

    return NextResponse.json({
      album: await createAlbum({
        ...albumDraft,
        id: albumId,
        coverImage,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "album 参数不合法";

    return NextResponse.json(
      {
        error: message,
      },
      { status: message === "相册数据源未配置" ? 503 : 400 },
    );
  }
}
