import { notFound } from "next/navigation";
import { AlbumPhotoDetailPageView } from "@/features/album/AlbumPhotoDetailPage";
import { getAlbumPhotoDetailPageData } from "@/features/album/service";
import { MokugyoStateNotice } from "@/features/content-modules/components/MokugyoStateNotice";
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
  const data = await getAlbumPhotoDetailPageData(albumId, photoId);

  if (data.dataSource === "unavailable") {
    return <MokugyoStateNotice page={`/album/${albumId}/${photoId}`} reason={data.statusReason} />;
  }

  if (!data.album || !data.photo) {
    notFound();
  }

  return <AlbumPhotoDetailPageView album={data.album} nextPhotoId={data.nextPhotoId} photo={data.photo} previousPhotoId={data.previousPhotoId} />;
}
