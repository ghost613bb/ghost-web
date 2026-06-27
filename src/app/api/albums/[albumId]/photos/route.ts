import { NextResponse } from "next/server";
import { createAlbumPhoto, getAlbumById, listAlbumPhotos } from "@/features/album/service";
import { parseCreateAlbumPhoto } from "@/features/album/validation";
import { buildAlbumPhotoFileName, buildAlbumPhotoVariantFileName } from "@/features/storage/paths";
import { uploadStorageObject } from "@/features/storage/service";
import { isUploadedFile } from "@/features/storage/validation";
import { requireAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

async function uploadAlbumFile(rawFile: FormDataEntryValue | null, objectPath: string) {
  if (!isUploadedFile(rawFile) || rawFile.size === 0) {
    return undefined;
  }

  const result = await uploadStorageObject({
    buffer: Buffer.from(await rawFile.arrayBuffer()),
    contentType: rawFile.type,
    objectPath,
    scope: "albums",
  });

  return result.url;
}

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
    const rawPhotoDisplayFile = formData.get("photoDisplayFile");
    const rawPhotoDisplayFileName = formData.get("photoDisplayFileName");
    const rawPhotoThumbnailFile = formData.get("photoThumbnailFile");
    const rawPhotoThumbnailFileName = formData.get("photoThumbnailFileName");

    if (!isUploadedFile(rawPhotoFile) || rawPhotoFile.size === 0) {
      return NextResponse.json({ error: "请先选择照片" }, { status: 400 });
    }

    const requestedFileName = typeof rawPhotoFileName === "string" && rawPhotoFileName.trim().length > 0 ? rawPhotoFileName.trim() : rawPhotoFile.name;
    const photoId = crypto.randomUUID();
    const imageUrl = await uploadAlbumFile(rawPhotoFile, buildAlbumPhotoFileName(albumId, photoId, requestedFileName || "photo"));

    if (!imageUrl) {
      return NextResponse.json({ error: "请先选择照片" }, { status: 400 });
    }

    let displayUrl: string | undefined;
    let thumbnailUrl: string | undefined;

    if (isUploadedFile(rawPhotoDisplayFile) && rawPhotoDisplayFile.size > 0) {
      const requestedDisplayFileName = typeof rawPhotoDisplayFileName === "string" && rawPhotoDisplayFileName.trim().length > 0 ? rawPhotoDisplayFileName.trim() : rawPhotoDisplayFile.name;
      displayUrl = await uploadAlbumFile(rawPhotoDisplayFile, buildAlbumPhotoVariantFileName(albumId, photoId, "display", requestedDisplayFileName || "photo"));
    }

    if (isUploadedFile(rawPhotoThumbnailFile) && rawPhotoThumbnailFile.size > 0) {
      const requestedThumbnailFileName = typeof rawPhotoThumbnailFileName === "string" && rawPhotoThumbnailFileName.trim().length > 0 ? rawPhotoThumbnailFileName.trim() : rawPhotoThumbnailFile.name;
      thumbnailUrl = await uploadAlbumFile(rawPhotoThumbnailFile, buildAlbumPhotoVariantFileName(albumId, photoId, "thumbnail", requestedThumbnailFileName || "photo"));
    }

    const photoDraft = parseCreateAlbumPhoto({
      id: photoId,
      note: typeof rawNote === "string" ? rawNote : undefined,
      imageUrl,
      displayUrl,
      thumbnailUrl,
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
