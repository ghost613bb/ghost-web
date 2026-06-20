import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { createAlbumPhoto, getAlbumById, listAlbumPhotos } from "@/features/album/service";
import { requireAdminRequest } from "@/lib/admin-auth";
import { parseCreateAlbumPhoto } from "@/features/album/validation";

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

type AlbumPhotoRouteContext = {
  params: Promise<{
    albumId: string;
  }>;
};

export async function GET(_request: Request, context: AlbumPhotoRouteContext) {
  const { albumId } = await context.params;
  const currentAlbum = await getAlbumById(albumId);

  if (!currentAlbum) {
    return NextResponse.json({ error: "相册不存在" }, { status: 404 });
  }

  return NextResponse.json({
    photos: await listAlbumPhotos(albumId),
  });
}

export async function POST(request: Request, context: AlbumPhotoRouteContext) {
  const { albumId } = await context.params;
  const unauthorizedResponse = requireAdminRequest(request, "无权限上传照片");

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const currentAlbum = await getAlbumById(albumId);

    if (!currentAlbum) {
      return NextResponse.json({ error: "相册不存在" }, { status: 404 });
    }

    const formData = await request.formData();
    const rawNote = formData.get("note");
    const rawPhotoFile = formData.get("photoFile");
    const rawPhotoFileName = formData.get("photoFileName");

    if (!isUploadedFile(rawPhotoFile) || rawPhotoFile.size === 0) {
      return NextResponse.json({ error: "请先选择照片" }, { status: 400 });
    }

    const requestedFileName = typeof rawPhotoFileName === "string" && rawPhotoFileName.trim().length > 0 ? rawPhotoFileName.trim() : rawPhotoFile.name;
    const safeFileName = sanitizeFileName(requestedFileName || "photo");
    const photoId = crypto.randomUUID();
    const finalFileName = `${photoId}-${safeFileName}`;
    const uploadDir = process.env.ALBUM_UPLOAD_DIR ?? path.join(process.cwd(), "public/uploads/albums");
    const outputPath = path.join(uploadDir, finalFileName);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(outputPath, Buffer.from(await rawPhotoFile.arrayBuffer()));

    const photoDraft = parseCreateAlbumPhoto({
      id: photoId,
      note: typeof rawNote === "string" ? rawNote : undefined,
      imageUrl: `/uploads/albums/${finalFileName}`,
    });

    const result = await createAlbumPhoto(albumId, photoDraft);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "photo 参数不合法";

    return NextResponse.json(
      {
        error: message,
      },
      { status: message === "相册数据源未配置" ? 503 : 400 },
    );
  }
}
