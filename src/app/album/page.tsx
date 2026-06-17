import { AlbumPageView } from "@/features/album/AlbumPage";
import { getAlbumPageData } from "@/features/album/service";
import { MokugyoStateNotice } from "@/features/content-modules/components/MokugyoStateNotice";
import { getDisplayMode } from "@/features/module-display-mode/service";

export default async function AlbumPage() {
  if ((await getDisplayMode("album")) === "demo") {
    return (
      <section className="space-y-3">
        <h1>个人相册-演示模式</h1>
        <p>这是个人相册模块的基础演示内容。</p>
      </section>
    );
  }

  const data = await getAlbumPageData();

  if (data.dataSource === "unavailable") {
    return <MokugyoStateNotice page="/album" reason={data.statusReason} />;
  }

  return <AlbumPageView initialAlbums={data.albums} />;
}
