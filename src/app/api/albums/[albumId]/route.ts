import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { deleteAlbum, getAlbumById, updateAlbum } from "@/features/album/service";
import type { CreateAlbumInput } from "@/features/album/types";
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

      albumDraft = parseCreateAlbum({
        title: typeof rawTitle === "string" ? rawTitle : "",
        description: typeof rawDescription === "string" ? rawDescription : undefined,
      });

      if (isUploadedFile(rawCoverFile) && rawCoverFile.size > 0) {
        const requestedFileName = typeof rawCoverFileName === "string" && rawCoverFileName.trim().length > 0 ? rawCoverFileName.trim() : rawCoverFile.name;
        const safeFileName = sanitizeFileName(requestedFileName || "cover");
        const finalFileName = `${albumId}-${safeFileName}`;
        const uploadDir = process.env.ALBUM_UPLOAD_DIR ?? path.join(process.cwd(), "public/uploads/albums");
        const outputPath = path.join(uploadDir, finalFileName);

        await mkdir(uploadDir, { recursive: true });
        await writeFile(outputPath, Buffer.from(await rawCoverFile.arrayBuffer()));
        albumDraft = {
          ...albumDraft,
          coverImage: `/uploads/albums/${finalFileName}`,
        };
      }
    } else {
      albumDraft = parseCreateAlbum(await request.json());
    }

    const album = await updateAlbum(albumId, {
      title: albumDraft.title,
      description: albumDraft.description,
      coverImage: albumDraft.coverImage,
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
