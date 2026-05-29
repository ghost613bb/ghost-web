import { NextResponse } from "next/server";
import { deleteAlbumPhoto, updateAlbumPhoto } from "@/features/album/service";
import { parseUpdateAlbumPhoto } from "@/features/album/validation";

type AlbumPhotoRouteContext = {
  params: Promise<{
    albumId: string;
    photoId: string;
  }>;
};

export async function PATCH(request: Request, context: AlbumPhotoRouteContext) {
  const { albumId, photoId } = await context.params;

  try {
    const photoDraft = parseUpdateAlbumPhoto(await request.json());
    const photo = await updateAlbumPhoto(albumId, photoId, photoDraft);

    return NextResponse.json({ photo });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "photo 参数不合法",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: AlbumPhotoRouteContext) {
  const { albumId, photoId } = await context.params;

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
