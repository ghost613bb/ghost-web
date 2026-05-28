import { NextResponse } from "next/server";
import { deleteAlbum, getAlbumById, updateAlbum } from "@/features/album/service";
import { parseCreateAlbum } from "@/features/album/validation";

type AlbumRouteContext = {
  params: Promise<{
    albumId: string;
  }>;
};

export async function PATCH(request: Request, context: AlbumRouteContext) {
  const { albumId } = await context.params;

  try {
    const currentAlbum = await getAlbumById(albumId);

    if (!currentAlbum) {
      return NextResponse.json({ error: "相册不存在" }, { status: 404 });
    }

    const body = await request.json();
    const albumDraft = parseCreateAlbum(body);
    const album = await updateAlbum(albumId, {
      title: albumDraft.title,
      description: albumDraft.description,
      coverImage: albumDraft.coverImage,
    });

    return NextResponse.json({ album });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "album 参数不合法",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: AlbumRouteContext) {
  const { albumId } = await context.params;

  const currentAlbum = await getAlbumById(albumId);

  if (!currentAlbum) {
    return NextResponse.json({ error: "相册不存在" }, { status: 404 });
  }

  await deleteAlbum(albumId);

  return NextResponse.json({ success: true });
}
