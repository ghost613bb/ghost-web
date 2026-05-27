import { Camera, Pencil, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { getAlbumPhotosByAlbumId } from "@/data/albumPhotos";
import type { Album } from "./types";

function coverImageFromAlbum(album: Album) {
  return album.coverImage ?? "/album-cover-placeholder.jpeg";
}

type AlbumDetailPageViewProps = {
  album: Album;
};

export function AlbumDetailPageView({ album }: AlbumDetailPageViewProps) {
  const photos = getAlbumPhotosByAlbumId(album.id);

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#fbf8f0_0%,#f7f1e8_100%)] px-4 py-5 text-[#4c2b2d] sm:px-6 sm:py-7">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            className="inline-flex items-center rounded-[1rem] border-2 border-[#6f343b] bg-[#f8cfd5] px-3.5 py-1 text-sm font-black text-[#4c2b2d] transition hover:-translate-y-0.5 hover:bg-[#fbe0e4] sm:px-4 sm:py-1.5"
            href="/album"
          >
            返回相册列表
          </Link>
        </div>

        <article className="relative overflow-hidden rounded-[2rem] border-[2.5px] border-[#d8cec0] bg-[#fcf8ef] shadow-[0_20px_42px_rgba(145,118,118,0.12)]">
          <img
            alt={`${album.title}封面背景`}
            className="absolute inset-0 h-full w-full object-cover"
            src={coverImageFromAlbum(album)}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(252,248,239,0.92)_0%,rgba(252,248,239,0.84)_34%,rgba(252,248,239,0.5)_64%,rgba(252,248,239,0.22)_100%)]"
          />
          <div aria-hidden="true" className="absolute left-3 top-1 h-7 w-16 -rotate-[28deg] rounded-sm bg-[#efe0be]/75 shadow-sm" />
          <div aria-hidden="true" className="absolute right-2 top-4 h-7 w-16 rotate-[26deg] rounded-sm bg-[#efe0be]/70 shadow-sm" />

          <div className="relative grid gap-6 px-5 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_224px] lg:items-start lg:gap-8">
            <div className="max-w-2xl">
              <h1 className="text-[2rem] font-black tracking-tight text-[#4c2b2d] sm:text-[2.35rem]">{album.title}</h1>
              <p className="mt-2 text-base font-semibold text-[#6f4b4e]">Created: {album.createdAt}</p>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#5d4145]">{album.description}</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                className="inline-flex items-center rounded-full border-2 border-[#b89b9b] bg-[#f4c0c9] px-5 py-3 text-left text-[1.05rem] font-black text-[#4c2b2d] shadow-[0_7px_16px_rgba(149,116,121,0.12)] transition hover:-translate-y-0.5 hover:bg-[#f7ccd3]"
                type="button"
              >
                <Camera aria-hidden="true" className="mr-2 h-[1.05rem] w-[1.05rem] stroke-[1.9]" />
                Upload Photos
              </button>
              <button
                className="inline-flex items-center rounded-full border-2 border-[#c7bda4] bg-[#f8f2da] px-5 py-3 text-left text-[1.05rem] font-black text-[#4c2b2d] shadow-[0_7px_16px_rgba(149,116,121,0.08)] transition hover:-translate-y-0.5 hover:bg-[#fbf6e4]"
                type="button"
              >
                <Pencil aria-hidden="true" className="mr-2 h-[1.02rem] w-[1.02rem] stroke-[1.9]" />
                Edit Album
              </button>
              <button
                className="inline-flex items-center rounded-full border-2 border-[#d7cfc4] bg-white px-5 py-3 text-left text-[1.05rem] font-black text-[#4c2b2d] shadow-[0_7px_16px_rgba(149,116,121,0.08)] transition hover:-translate-y-0.5 hover:bg-[#fffdfa]"
                type="button"
              >
                <Trash2 aria-hidden="true" className="mr-2 h-[1.02rem] w-[1.02rem] stroke-[1.9]" />
                Delete Album
              </button>
            </div>
          </div>
        </article>

        <section className="mt-5 rounded-[2rem] border-[2px] border-[#ece3d7] bg-[#fffdf8] px-4 py-5 shadow-[0_16px_36px_rgba(144,118,118,0.08)] sm:px-6 sm:py-6">
          <h2 className="text-[1.6rem] font-black tracking-tight text-[#4c2b2d]">Photos ({album.photoCount}) - Sorted by Date</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {photos.map((photo, index) => (
              <article
                key={photo.id}
                className="relative rounded-[1.45rem] border border-[#e7ddd1] bg-white p-3 shadow-[0_10px_26px_rgba(149,116,121,0.08)]"
              >
                <div
                  aria-hidden="true"
                  className={`absolute ${index % 2 === 0 ? "right-5 top-[-0.35rem] rotate-[7deg]" : "left-6 top-[-0.25rem] -rotate-[6deg]"} h-4 w-14 rounded-sm bg-[#e9dec9]/85`}
                />
                <div className="flex gap-3">
                  <Link
                    aria-label="查看照片详情"
                    className="flex min-w-0 flex-1 gap-3 rounded-[1.1rem] transition hover:bg-[#fdf7ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9898f] focus-visible:ring-offset-2"
                    href={`/album/${album.id}/${photo.id}`}
                  >
                    <div
                      aria-hidden="true"
                      className="h-25 w-25 shrink-0 rounded-[1.1rem] bg-[#e7deda] bg-cover bg-center"
                      style={{ backgroundImage: `url(${photo.imageUrl})`, backgroundPosition: photo.imagePosition }}
                    />
                    <div className="min-w-0 flex-1 py-0.5">
                      <p className="text-[1rem] font-semibold text-[#5b4347]">{photo.uploadedAt.split(" /")[0]}</p>
                      <p className="mt-1 line-clamp-2 text-[1rem] font-medium text-[#4c2b2d]">{photo.title}</p>
                    </div>
                  </Link>
                </div>
                <div className="mt-3 flex justify-end gap-2 text-[#4c2b2d]">
                  <button aria-label="编辑照片" className="rounded-full px-1 py-1 transition hover:bg-[#f7f1e8]" type="button">
                    <Pencil aria-hidden="true" className="h-[0.92rem] w-[0.92rem] stroke-[1.9]" />
                  </button>
                  <button aria-label="删除照片" className="rounded-full px-1 py-1 transition hover:bg-[#f7f1e8]" type="button">
                    <Trash2 aria-hidden="true" className="h-[0.92rem] w-[0.92rem] stroke-[1.9]" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
