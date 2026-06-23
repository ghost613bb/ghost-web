import { NextResponse } from "next/server";
import { createAlbumPhoto, getAlbumById, listAlbumPhotos } from "@/features/album/service";
import { parseCreateAlbumPhoto } from "@/features/album/validation";
import { buildAlbumPhotoFileName } from "@/features/storage/paths";
import { uploadStorageObject } from "@/features/storage/service";
import { isUploadedFile } from "@/features/storage/validation";
import { requireAdminRequest } from "@/lib/admin-auth";

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
    const photoId = crypto.randomUUID();
    const finalFileName = buildAlbumPhotoFileName(photoId, requestedFileName || "photo");
    const result = await uploadStorageObject({
      buffer: Buffer.from(await rawPhotoFile.arrayBuffer()),
      contentType: rawPhotoFile.type,
      objectPath: finalFileName,
      scope: "albums",
    });

    const photoDraft = parseCreateAlbumPhoto({
      id: photoId,
      note: typeof rawNote === "string" ? rawNote : undefined,
      imageUrl: result.url,
    });

    const resultPayload = await createAlbumPhoto(albumId, photoDraft);

    return NextResponse.json(resultPayload);
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
