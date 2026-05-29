"use client";

import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AlbumPhoto } from "@/data/albumPhotos";
import { AlbumPhotoUploadDialog } from "./AlbumPhotoUploadDialog";
import type { Album } from "./types";

type AlbumPhotoDetailPageViewProps = {
  album: Album;
  nextPhotoId: string | null;
  photo: AlbumPhoto;
  previousPhotoId: string | null;
};

type NavigationButtonProps = {
  albumId: string;
  direction: "previous" | "next";
  photoId: string | null;
};

function PhotoNavigationButton({ albumId, direction, photoId }: NavigationButtonProps) {
  const isPrevious = direction === "previous";
  const label = isPrevious ? "上一张" : "下一张";
  const icon = isPrevious ? (
    <ChevronLeft aria-hidden="true" className="h-4 w-4 stroke-[2.1]" />
  ) : (
    <ChevronRight aria-hidden="true" className="h-4 w-4 stroke-[2.1]" />
  );
  const className =
    "inline-flex items-center justify-center gap-1 rounded-full border-2 px-4 py-2 text-sm font-black transition sm:min-w-[112px]";

  if (!photoId) {
    return (
      <button
        aria-label={label}
        className={`${className} cursor-not-allowed border-[#ddd5ca] bg-[#f5f0e8] text-[#b7a9a3]`}
        disabled
        type="button"
      >
        {isPrevious ? icon : null}
        {label}
        {!isPrevious ? icon : null}
      </button>
    );
  }

  return (
    <Link
      aria-label={label}
      className={`${className} border-[#caa8ad] bg-white text-[#4c2b2d] shadow-[0_7px_16px_rgba(149,116,121,0.08)] hover:-translate-y-0.5 hover:bg-[#fff8fb]`}
      href={`/album/${albumId}/${photoId}`}
    >
      {isPrevious ? icon : null}
      {label}
      {!isPrevious ? icon : null}
    </Link>
  );
}

export function AlbumPhotoDetailPageView({ album, nextPhotoId, photo, previousPhotoId }: AlbumPhotoDetailPageViewProps) {
  const router = useRouter();
  const [currentPhoto, setCurrentPhoto] = useState(photo);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeletePhotoError, setPendingDeletePhotoError] = useState("");
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const destinationAfterDelete = nextPhotoId ?? previousPhotoId;

  useEffect(() => {
    setCurrentPhoto(photo);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setPendingDeletePhotoError("");
    setIsDeletingPhoto(false);
  }, [photo]);

  return (
    <>
      <main className="min-h-dvh bg-[linear-gradient(180deg,#fbf8f0_0%,#f7f1e8_100%)] px-4 py-5 text-[#4c2b2d] sm:px-6 sm:py-7">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              className="inline-flex items-center rounded-[1rem] border-2 border-[#6f343b] bg-[#f8cfd5] px-3.5 py-1 text-sm font-black text-[#4c2b2d] transition hover:-translate-y-0.5 hover:bg-[#fbe0e4] sm:px-4 sm:py-1.5"
              href={`/album/${album.id}`}
            >
              返回相册
            </Link>
          </div>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)] lg:items-start">
            <article className="relative overflow-hidden rounded-[2rem] border-[2.5px] border-[#d8cec0] bg-[#fcf8ef] p-4 shadow-[0_20px_42px_rgba(145,118,118,0.12)] sm:p-5">
              <div aria-hidden="true" className="absolute left-4 top-2 h-7 w-16 -rotate-[28deg] rounded-sm bg-[#efe0be]/75 shadow-sm" />
              <div aria-hidden="true" className="absolute right-5 top-3 h-7 w-16 rotate-[24deg] rounded-sm bg-[#efe0be]/70 shadow-sm" />
              <div
                aria-label={`${currentPhoto.title}大图`}
                className="min-h-[420px] rounded-[1.6rem] border border-[#eadfce] bg-[#e7deda] bg-cover bg-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)] sm:min-h-[560px]"
                role="img"
                style={{ backgroundImage: `url(${currentPhoto.imageUrl})`, backgroundPosition: currentPhoto.imagePosition }}
              />
            </article>

            <aside className="rounded-[2rem] border-[2px] border-[#ece3d7] bg-[#fffdf8] p-5 shadow-[0_16px_36px_rgba(144,118,118,0.08)] sm:p-6">
              <div className="space-y-2 border-b border-[#efe4d7] pb-4">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9a7f74]">Album</p>
                <p className="text-base font-semibold text-[#6a4d50]">{album.title}</p>
                <h1 className="text-[2rem] font-black tracking-tight text-[#4c2b2d]">{currentPhoto.title}</h1>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-[#eee3d6] bg-[#fcf7f0] p-4">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9a7f74]">Upload Time</p>
                <p className="mt-2 text-base font-semibold text-[#4c2b2d]">{currentPhoto.uploadedAt}</p>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-[#eee3d6] bg-white p-4 shadow-[0_10px_24px_rgba(149,116,121,0.06)]">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9a7f74]">备注区</p>
                <div aria-label="照片备注内容" className="album-page-scrollbar mt-3 h-[180px] overflow-y-auto pr-2">
                  <p className="whitespace-pre-line text-[1rem] leading-7 text-[#5b4347]">{currentPhoto.note || "还没有备注。"}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center rounded-full border-2 border-[#b89b9b] bg-[#f4c0c9] px-5 py-3 text-[1rem] font-black text-[#4c2b2d] shadow-[0_7px_16px_rgba(149,116,121,0.12)] transition hover:-translate-y-0.5 hover:bg-[#f7ccd3]"
                  onClick={() => setIsEditDialogOpen(true)}
                  type="button"
                >
                  <Pencil aria-hidden="true" className="mr-2 h-[1rem] w-[1rem] stroke-[1.9]" />
                  编辑备注
                </button>
                <button
                  className="inline-flex items-center rounded-full border-2 border-[#d7cfc4] bg-white px-5 py-3 text-[1rem] font-black text-[#4c2b2d] shadow-[0_7px_16px_rgba(149,116,121,0.08)] transition hover:-translate-y-0.5 hover:bg-[#fffdfa]"
                  onClick={() => {
                    setPendingDeletePhotoError("");
                    setIsDeleteDialogOpen(true);
                  }}
                  type="button"
                >
                  <Trash2 aria-hidden="true" className="mr-2 h-[1rem] w-[1rem] stroke-[1.9]" />
                  删除照片
                </button>
              </div>

              <div aria-label="照片翻页导航" className="mt-6 flex flex-wrap justify-center gap-3 border-t border-[#efe4d7] pt-5">
                <PhotoNavigationButton albumId={album.id} direction="previous" photoId={previousPhotoId} />
                <PhotoNavigationButton albumId={album.id} direction="next" photoId={nextPhotoId} />
              </div>
            </aside>
          </section>
        </div>
      </main>

      {isEditDialogOpen ? (
        <AlbumPhotoUploadDialog
          initialNote={currentPhoto.note}
          initialTitle={currentPhoto.title}
          onClose={() => setIsEditDialogOpen(false)}
          onSubmit={async ({ title, note }) => {
            const response = await fetch(`/api/albums/${album.id}/photos/${currentPhoto.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ title, note }),
            });
            const data = (await response.json()) as {
              photo?: AlbumPhoto;
              error?: string;
            };

            if (!response.ok || !data.photo) {
              throw new Error(data.error ?? "编辑备注失败");
            }

            setCurrentPhoto(data.photo);
            setIsEditDialogOpen(false);
          }}
          requireFile={false}
          showFileInput={false}
          submitErrorMessage="编辑备注失败"
          submitLabel="保存修改"
          title="编辑备注"
        />
      ) : null}

      {isDeleteDialogOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#6b3f49]/22 px-4 py-6 backdrop-blur-[2px]">
          <button
            aria-label="关闭删除照片确认弹窗"
            className="absolute inset-0"
            onClick={() => {
              setPendingDeletePhotoError("");
              setIsDeleteDialogOpen(false);
            }}
            type="button"
          />
          <div className="relative z-10 w-full max-w-[420px] rounded-[2rem] border-[3px] border-[#6f343b] bg-[#fcf8ef] px-6 py-6 text-[#6f343b] shadow-[0_24px_60px_rgba(111,52,59,0.16)]">
            <h2 className="text-[1.7rem] font-black tracking-tight">删除照片</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#7d5960]">确认删除“{currentPhoto.title}”吗？删除后会从当前相册中移除。</p>
            {pendingDeletePhotoError ? <p className="mt-4 text-sm font-semibold text-[#b14f5d]">{pendingDeletePhotoError}</p> : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                className="rounded-full border-[3px] border-[#6f343b] bg-[#fcf8ef] px-5 py-2 text-[1rem] font-black text-[#6f343b] transition hover:-translate-y-0.5 hover:bg-[#fffdf7] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isDeletingPhoto}
                onClick={() => {
                  setPendingDeletePhotoError("");
                  setIsDeleteDialogOpen(false);
                }}
                type="button"
              >
                取消
              </button>
              <button
                className="rounded-full border-[3px] border-[#9d3245] bg-[#f8c4cd] px-5 py-2 text-[1rem] font-black text-[#9d3245] transition hover:-translate-y-0.5 hover:bg-[#fad0d7] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isDeletingPhoto}
                onClick={async () => {
                  setPendingDeletePhotoError("");
                  setIsDeletingPhoto(true);

                  try {
                    const response = await fetch(`/api/albums/${album.id}/photos/${currentPhoto.id}`, {
                      method: "DELETE",
                    });
                    const data = (await response.json()) as { error?: string };

                    if (!response.ok) {
                      throw new Error(data.error ?? "删除照片失败");
                    }

                    router.push(destinationAfterDelete ? `/album/${album.id}/${destinationAfterDelete}` : `/album/${album.id}`);
                  } catch (error) {
                    setPendingDeletePhotoError(error instanceof Error ? error.message : "删除照片失败");
                    setIsDeletingPhoto(false);
                  }
                }}
                type="button"
              >
                {isDeletingPhoto ? "删除中" : "确认删除照片"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
