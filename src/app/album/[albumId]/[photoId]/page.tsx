import { notFound } from "next/navigation";
import { getAdjacentAlbumPhotoIds, getAlbumPhotoById } from "@/data/albumPhotos";
import { AlbumPhotoDetailPageView } from "@/features/album/AlbumPhotoDetailPage";
import { getAlbumById } from "@/features/album/service";
import { getDisplayMode } from "@/features/module-display-mode/service";

type AlbumPhotoDetailPageProps = {
  params: Promise<{
    albumId: string;
    photoId: string;
  }>;
};

export default async function AlbumPhotoDetailPage({ params }: AlbumPhotoDetailPageProps) {
  if ((await getDisplayMode("album")) === "demo") {
    return (
      <section className="space-y-3">
        <h1>个人相册-演示模式</h1>
        <p>这是个人相册模块的基础演示内容。</p>
      </section>
    );
  }

  const { albumId, photoId } = await params;
  const album = await getAlbumById(albumId);

  if (!album) {
    notFound();
  }

  const photo = getAlbumPhotoById(albumId, photoId);

  if (!photo) {
    notFound();
  }

  const { previousPhotoId, nextPhotoId } = getAdjacentAlbumPhotoIds(albumId, photoId);

  return <AlbumPhotoDetailPageView album={album} nextPhotoId={nextPhotoId} photo={photo} previousPhotoId={previousPhotoId} />;
}
