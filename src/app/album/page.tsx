import { notFound } from "next/navigation";
import { AlbumWorkspacePageView } from "@/features/album/AlbumWorkspacePage";
import { getAlbumWorkspaceData } from "@/features/album/service";
import { MokugyoStateNotice } from "@/features/content-modules/components/MokugyoStateNotice";
import { getDisplayMode } from "@/features/module-display-mode/service";

type AlbumPageProps = {
  searchParams?: Promise<{
    albumId?: string | string[];
    photoId?: string | string[];
  }>;
};

function getSingleSearchParam(value?: string | string[]) {
  return typeof value === "string" ? value : undefined;
}

export default async function AlbumPage({ searchParams }: AlbumPageProps = {}) {
  if ((await getDisplayMode("album")) === "demo") {
    return (
      <section className="space-y-3">
        <h1>个人相册-演示模式</h1>
        <p>这是个人相册模块的基础演示内容。</p>
      </section>
    );
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const albumId = getSingleSearchParam(resolvedSearchParams.albumId);
  const photoId = getSingleSearchParam(resolvedSearchParams.photoId);
  console.time("getAlbumWorkspaceData");
  const data = await getAlbumWorkspaceData(albumId, photoId);
  console.timeEnd("getAlbumWorkspaceData");

  if (data.dataSource === "unavailable") {
    return <MokugyoStateNotice page="/album" reason={data.statusReason} />;
  }

  if (albumId && !data.activeAlbum) {
    notFound();
  }

  if (photoId && !data.activePhoto) {
    notFound();
  }

  return (
    <AlbumWorkspacePageView
      initialActiveAlbum={data.activeAlbum}
      initialActivePhoto={data.activePhoto}
      initialAlbums={data.albums}
      initialPhotos={data.photos}
    />
  );
}
