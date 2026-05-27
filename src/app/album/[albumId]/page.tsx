import { notFound } from "next/navigation";
import { AlbumDetailPageView } from "@/features/album/AlbumDetailPage";
import { getAlbumById } from "@/features/album/service";
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
  const album = await getAlbumById(albumId);

  if (!album) {
    notFound();
  }

  return <AlbumDetailPageView album={album} />;
}
