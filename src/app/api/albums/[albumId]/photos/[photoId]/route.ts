import { NextResponse } from "next/server";
import { deleteAlbumPhoto, updateAlbumPhoto } from "@/features/album/service";
import { requireAdminRequest } from "@/lib/admin-auth";
import { parseUpdateAlbumPhoto } from "@/features/album/validation";

export const runtime = "nodejs";

type AlbumPhotoRouteContext = {
  params: Promise<{
    albumId: string;
    photoId: string;
  }>;
};

export async function PATCH(request: Request, context: AlbumPhotoRouteContext) {
  const { albumId, photoId } = await context.params;
  const unauthorizedResponse = requireAdminRequest(request, "无权限编辑照片");

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const photoDraft = parseUpdateAlbumPhoto(await request.json());
    const photo = await updateAlbumPhoto(albumId, photoId, photoDraft);

    return NextResponse.json({ photo });
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

export async function DELETE(request: Request, context: AlbumPhotoRouteContext) {
  const { albumId, photoId } = await context.params;
  const unauthorizedResponse = requireAdminRequest(request, "无权限删除照片");

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const result = await deleteAlbumPhoto(albumId, photoId);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "删除照片失败",
      },
      { status: 400 },
    );
  }
}
