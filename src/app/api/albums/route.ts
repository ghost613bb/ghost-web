import { NextResponse } from "next/server";
import { createAlbum, getNextCreatedAlbumId, listAlbums } from "@/features/album/service";
import { parseCreateAlbum } from "@/features/album/validation";
import { buildAlbumCoverFileName, buildAlbumCoverVariantFileName } from "@/features/storage/paths";
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
    const rawCoverDisplayFile = formData.get("coverDisplayFile");
    const rawCoverDisplayFileName = formData.get("coverDisplayFileName");
    const rawCoverThumbnailFile = formData.get("coverThumbnailFile");
    const rawCoverThumbnailFileName = formData.get("coverThumbnailFileName");

    const albumDraft = parseCreateAlbum({
      title: typeof rawTitle === "string" ? rawTitle : "",
      description: typeof rawDescription === "string" ? rawDescription : undefined,
    });

    const albumId = await getNextCreatedAlbumId();

    let coverImage: string | undefined;
    let coverDisplayImage: string | undefined;
    let coverThumbnailImage: string | undefined;

    if (isUploadedFile(rawCoverFile) && rawCoverFile.size > 0) {
      const requestedFileName = typeof rawCoverFileName === "string" && rawCoverFileName.trim().length > 0 ? rawCoverFileName.trim() : rawCoverFile.name;
      coverImage = await uploadAlbumFile(rawCoverFile, buildAlbumCoverFileName(albumId, requestedFileName || "cover"));
    }

    if (isUploadedFile(rawCoverDisplayFile) && rawCoverDisplayFile.size > 0) {
      const requestedFileName = typeof rawCoverDisplayFileName === "string" && rawCoverDisplayFileName.trim().length > 0 ? rawCoverDisplayFileName.trim() : rawCoverDisplayFile.name;
      coverDisplayImage = await uploadAlbumFile(rawCoverDisplayFile, buildAlbumCoverVariantFileName(albumId, "display", requestedFileName || "cover"));
    }

    if (isUploadedFile(rawCoverThumbnailFile) && rawCoverThumbnailFile.size > 0) {
      const requestedFileName = typeof rawCoverThumbnailFileName === "string" && rawCoverThumbnailFileName.trim().length > 0 ? rawCoverThumbnailFileName.trim() : rawCoverThumbnailFile.name;
      coverThumbnailImage = await uploadAlbumFile(rawCoverThumbnailFile, buildAlbumCoverVariantFileName(albumId, "thumbnail", requestedFileName || "cover"));
    }

    return NextResponse.json({
      album: await createAlbum({
        ...albumDraft,
        id: albumId,
        coverImage,
        coverDisplayImage,
        coverThumbnailImage,
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
