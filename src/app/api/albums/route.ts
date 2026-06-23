import { NextResponse } from "next/server";
import { createAlbum, getNextCreatedAlbumId, listAlbums } from "@/features/album/service";
import { parseCreateAlbum } from "@/features/album/validation";
import { buildAlbumCoverFileName } from "@/features/storage/paths";
import { uploadStorageObject } from "@/features/storage/service";
import { isUploadedFile } from "@/features/storage/validation";
import { requireAdminRequest } from "@/lib/admin-auth";

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
      const finalFileName = buildAlbumCoverFileName(albumId, requestedFileName || "cover");
      const result = await uploadStorageObject({
        buffer: Buffer.from(await rawCoverFile.arrayBuffer()),
        contentType: rawCoverFile.type,
        objectPath: finalFileName,
        scope: "albums",
      });
      coverImage = result.url;
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
