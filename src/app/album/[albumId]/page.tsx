import { notFound } from "next/navigation";
import { AlbumDetailPageView } from "@/features/album/AlbumDetailPage";
import { getAlbumDetailPageData } from "@/features/album/service";
import { MokugyoStateNotice } from "@/features/content-modules/components/MokugyoStateNotice";
import { getDisplayMode } from "@/features/module-display-mode/service";

type AlbumDetailPageProps = {
  params: Promise<{
    albumId: string;
  }>;
};

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  if ((await getDisplayMode("album")) === "demo") {
    return (
      <section className="space-y-3">
        <h1>个人相册-演示模式</h1>
        <p>这是个人相册模块的基础演示内容。</p>
      </section>
    );
  }

  const { albumId } = await params;
  const data = await getAlbumDetailPageData(albumId);

  if (data.dataSource === "unavailable") {
    return <MokugyoStateNotice page={`/album/${albumId}`} reason={data.statusReason} />;
  }

  if (!data.album) {
    notFound();
  }

  return <AlbumDetailPageView album={data.album} initialPhotos={data.photos} />;
}
