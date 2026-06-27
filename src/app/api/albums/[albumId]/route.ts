import { NextResponse } from "next/server";
import { deleteAlbum, getAlbumById, updateAlbum } from "@/features/album/service";
import type { CreateAlbumInput } from "@/features/album/types";
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

type AlbumRouteContext = {
  params: Promise<{
    albumId: string;
  }>;
};

export async function PATCH(request: Request, context: AlbumRouteContext) {
  const { albumId } = await context.params;
  const unauthorizedResponse = requireAdminRequest(request, "无权限编辑相册");

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const currentAlbum = await getAlbumById(albumId);

    if (!currentAlbum) {
      return NextResponse.json({ error: "相册不存在" }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    let albumDraft: CreateAlbumInput;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const rawTitle = formData.get("title");
      const rawDescription = formData.get("description");
      const rawCoverFile = formData.get("coverFile");
      const rawCoverFileName = formData.get("coverFileName");
      const rawCoverDisplayFile = formData.get("coverDisplayFile");
      const rawCoverDisplayFileName = formData.get("coverDisplayFileName");
      const rawCoverThumbnailFile = formData.get("coverThumbnailFile");
      const rawCoverThumbnailFileName = formData.get("coverThumbnailFileName");

      albumDraft = parseCreateAlbum({
        title: typeof rawTitle === "string" ? rawTitle : "",
        description: typeof rawDescription === "string" ? rawDescription : undefined,
      });

      if (isUploadedFile(rawCoverFile) && rawCoverFile.size > 0) {
        const requestedFileName = typeof rawCoverFileName === "string" && rawCoverFileName.trim().length > 0 ? rawCoverFileName.trim() : rawCoverFile.name;
        albumDraft = {
          ...albumDraft,
          coverImage: await uploadAlbumFile(rawCoverFile, buildAlbumCoverFileName(albumId, requestedFileName || "cover")),
          coverDisplayImage: null,
          coverThumbnailImage: null,
        };
      }

      if (isUploadedFile(rawCoverDisplayFile) && rawCoverDisplayFile.size > 0) {
        const requestedFileName = typeof rawCoverDisplayFileName === "string" && rawCoverDisplayFileName.trim().length > 0 ? rawCoverDisplayFileName.trim() : rawCoverDisplayFile.name;
        albumDraft = {
          ...albumDraft,
          coverDisplayImage: await uploadAlbumFile(rawCoverDisplayFile, buildAlbumCoverVariantFileName(albumId, "display", requestedFileName || "cover")),
        };
      }

      if (isUploadedFile(rawCoverThumbnailFile) && rawCoverThumbnailFile.size > 0) {
        const requestedFileName = typeof rawCoverThumbnailFileName === "string" && rawCoverThumbnailFileName.trim().length > 0 ? rawCoverThumbnailFileName.trim() : rawCoverThumbnailFile.name;
        albumDraft = {
          ...albumDraft,
          coverThumbnailImage: await uploadAlbumFile(rawCoverThumbnailFile, buildAlbumCoverVariantFileName(albumId, "thumbnail", requestedFileName || "cover")),
        };
      }
    } else {
      albumDraft = parseCreateAlbum(await request.json());
    }

    const album = await updateAlbum(albumId, {
      title: albumDraft.title,
      description: albumDraft.description,
      coverImage: albumDraft.coverImage,
      coverDisplayImage: albumDraft.coverDisplayImage,
      coverThumbnailImage: albumDraft.coverThumbnailImage,
    });

    return NextResponse.json({ album });
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

export async function DELETE(request: Request, context: AlbumRouteContext) {
  const { albumId } = await context.params;
  const unauthorizedResponse = requireAdminRequest(request, "无权限删除相册");

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const currentAlbum = await getAlbumById(albumId);

  if (!currentAlbum) {
    return NextResponse.json({ error: "相册不存在" }, { status: 404 });
  }

  await deleteAlbum(albumId);

  return NextResponse.json({ success: true });
}
