import { AlbumPageView } from "@/features/album/AlbumPage";
import { listAlbums } from "@/features/album/service";
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

  return <AlbumPageView initialAlbums={await listAlbums()} />;
}
