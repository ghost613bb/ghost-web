"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import type { Album } from "./types";

type CreateAlbumDialogProps = {
  onClose: () => void;
  onCreate: (payload: { coverFile?: File; description: string; title: string }) => Promise<void>;
};

type AlbumCard = Album & {
  coverBadge?: string;
};

type AlbumPageViewProps = {
  initialAlbums: Album[];
};

function albumToCard(album: Album): AlbumCard {
  return {
    ...album,
    coverBadge: album.coverImage?.split("/").pop(),
  };
}

function coverImageFromAlbum(album: AlbumCard) {
  return album.coverImage ?? "/album-cover-placeholder.jpeg";
}

function coverBadgeFromAlbum(album: AlbumCard) {
  return album.coverBadge;
}

function CreateAlbumDialog({ onClose, onCreate }: CreateAlbumDialogProps) {
  const titleId = useId();
  const nameId = useId();
  const noteId = useId();
  const [albumName, setAlbumName] = useState("");
  const [albumNote, setAlbumNote] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [nameError, setNameError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [coverFile]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#6b3f49]/22 px-4 py-6 backdrop-blur-[2px]">
      <button aria-label="关闭新建相册弹窗" className="absolute inset-0" onClick={onClose} type="button" />
      <form
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative z-10 w-full max-w-[640px] rounded-[2rem] border-[3px] border-[#6f343b] bg-[#fcf8ef] px-5 py-5 shadow-[0_24px_60px_rgba(111,52,59,0.16)] sm:px-8 sm:py-7"
        onSubmit={async (event) => {
          event.preventDefault();

          const trimmedName = albumName.trim();
          const trimmedNote = albumNote.trim();

          if (!trimmedName) {
            setNameError("请先填写相册名称");
            return;
          }

          setSubmitError("");
          setIsSubmitting(true);

          try {
            await onCreate({
              title: trimmedName,
              description: trimmedNote,
              coverFile: coverFile ?? undefined,
            });
          } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "新建相册失败");
            setIsSubmitting(false);
          }
        }}
        role="dialog"
      >
        <div className="relative mb-5 text-center">
          <div aria-hidden="true" className="absolute left-1/2 top-[62%] h-5 w-42 -translate-x-1/2 rounded-full bg-[#f6d6da] sm:h-6 sm:w-52" />
          <h2 id={titleId} className="relative text-[1.95rem] font-black tracking-tight text-[#6f343b] sm:text-[2.75rem]">
            新建相册
          </h2>
        </div>

        <div className="space-y-4 text-[#6f343b]">
          <div>
            <label className="block text-[1.05rem] font-black sm:text-[1.15rem]" htmlFor={nameId}>
              相册名称
            </label>
            <div className="relative mt-2">
              <input
                className="h-14 w-full rounded-full border-[3px] border-[#6f343b] bg-[linear-gradient(90deg,#fff5f6_0%,#fdecef_100%)] px-5 pr-14 text-base text-[#6f343b] outline-none placeholder:text-[#c7a9af] focus:bg-white"
                id={nameId}
                onChange={(event) => {
                  setAlbumName(event.target.value);
                  if (nameError) {
                    setNameError("");
                  }
                }}
                placeholder="请输入相册名称"
                type="text"
                value={albumName}
              />
              <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[1.65rem]">
                🌥️
              </span>
            </div>
            {nameError ? <p className="mt-2 text-sm font-semibold text-[#b14f5d]">{nameError}</p> : null}
          </div>

          <div>
            <label className="block text-[1.05rem] font-black sm:text-[1.15rem]" htmlFor={noteId}>
              备注/留言
            </label>
            <div className="relative mt-2">
              <textarea
                className="min-h-36 w-full rounded-[1.75rem] border-[3px] border-[#6f343b] bg-[linear-gradient(180deg,#fff6f6_0%,#fdeef0_100%)] px-5 py-4 text-sm text-[#6f343b] outline-none placeholder:text-[#c7a9af] focus:bg-white sm:text-base"
                id={noteId}
                onChange={(event) => setAlbumNote(event.target.value)}
                placeholder="写点想留在相册里的话吧"
                rows={4}
                value={albumNote}
              />
              <span aria-hidden="true" className="absolute -left-4 top-13 text-[1.8rem] drop-shadow-[0_3px_0_rgba(255,255,255,0.7)]">
                ⭐
              </span>
              <span aria-hidden="true" className="absolute left-0 bottom-2 text-[1.9rem] drop-shadow-[0_3px_0_rgba(255,255,255,0.7)]">
                🐱
              </span>
              <span aria-hidden="true" className="absolute right-5 top-[-0.7rem] text-[1.7rem]">
                😊
              </span>
              <span aria-hidden="true" className="absolute right-0 top-5 text-[1.8rem]">
                💙
              </span>
              <span aria-hidden="true" className="absolute right-7 bottom-3 text-[1.7rem]">
                😊
              </span>
              <span aria-hidden="true" className="absolute right-18 bottom-3 text-[1.7rem]">
                ❤️
              </span>
              <span aria-hidden="true" className="absolute right-0 bottom-4 text-[1.7rem]">
                🐾
              </span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[1.05rem] font-black sm:text-[1.15rem]">封面上传</p>
            <label
              aria-label={coverFile ? "重新选择封面" : "点击上传"}
              className="block cursor-pointer"
              htmlFor="album-cover-upload"
              role="button"
              tabIndex={0}
            >
              <input
                accept="image/*"
                aria-label="上传本地封面"
                className="sr-only"
                id="album-cover-upload"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setCoverFile(file);
                }}
                type="file"
              />
              <div className="relative min-h-30 overflow-hidden rounded-[1.6rem] border-[3px] border-dashed border-[#6f343b] bg-[#fffdf7] transition hover:-translate-y-0.5 hover:bg-white">
                {coverPreviewUrl ? (
                  <img alt="封面本地预览" className="absolute inset-0 h-full w-full object-cover" src={coverPreviewUrl} />
                ) : (
                  <img
                    alt="封面预览占位"
                    className="absolute inset-0 h-full w-full object-cover opacity-55"
                    src="/album-cover-placeholder.jpeg"
                  />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,253,247,0.12)_0%,rgba(255,253,247,0.72)_68%,rgba(255,253,247,0.96)_100%)]" />
                <div className="relative flex min-h-30 flex-col items-center justify-center px-4 py-5 text-center text-[#6f343b]">
                  <span aria-hidden="true" className="text-[2.7rem] leading-none">
                    {coverFile ? "🖼️" : "📷"}
                  </span>
                  <span className="mt-2 text-[1.35rem] font-black leading-none sm:text-[1.25rem]">{coverFile ? "重新选择" : "点击上传"}</span>
                  <span className="mt-2 text-sm font-medium text-[#8d6368]">{coverFile ? coverFile.name : "选择本地图片作为相册封面。"}</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {submitError ? <p className="mt-4 text-sm font-semibold text-[#b14f5d]">{submitError}</p> : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <button
            className="min-w-[10.5rem] rounded-full border-[3px] border-[#6f343b] bg-[#f4b2be] px-6 py-2.5 text-[1.15rem] font-black text-[#6f343b] transition hover:-translate-y-0.5 hover:bg-[#f6bec8] disabled:cursor-not-allowed disabled:opacity-70 sm:text-[1.25rem]"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "保存中" : "保存"}
          </button>
          <button
            className="min-w-[10.5rem] rounded-full border-[3px] border-[#6f343b] bg-[#fcf8ef] px-6 py-2.5 text-[1.15rem] font-black text-[#6f343b] transition hover:-translate-y-0.5 hover:bg-[#fffdf7] sm:text-[1.25rem]"
            onClick={onClose}
            type="button"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

export function AlbumPageView({ initialAlbums }: AlbumPageViewProps) {
  const [albums, setAlbums] = useState<AlbumCard[]>(initialAlbums.map(albumToCard));
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const topActionClass =
    "inline-flex items-center rounded-[1rem] border-2 border-stone-700/80 bg-[#f8cfd5] px-3.5 py-1 text-sm font-black text-stone-900 transition hover:-translate-y-0.5 hover:bg-[#fbe0e4] sm:px-4 sm:py-1.5";

  return (
    <main className="album-page-scrollbar h-dvh overflow-y-auto bg-[#f7f1e8] text-stone-900">
      <header className="border-b-2 border-stone-700/60 bg-[#f6b8c2]">
        <div className="relative mx-auto flex max-w-[1320px] items-center justify-between gap-3 px-4 py-4.5 sm:px-6">
          <Link className={topActionClass} href="/">
            返回首页小镇
          </Link>
          <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-black tracking-tight sm:text-[1.75rem]">
            个人相册
          </h1>
          <button className={topActionClass} onClick={() => setIsCreateDialogOpen(true)} type="button">
            新建相册
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1320px] px-4 pb-8 pt-3 sm:px-6">
        <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {albums.map((album, index) => (
            <article
              key={album.id}
              className="relative flex min-h-[288px] flex-col rounded-[1.6rem] border-[2.5px] border-stone-700/80 bg-white p-3 shadow-[0_12px_24px_rgba(112,84,84,0.08)] sm:min-h-[304px]"
            >
              <div className="mb-1 h-48 overflow-hidden rounded-[1.3rem] bg-[#d8d4dc] shadow-[inset_0_10px_24px_rgba(255,255,255,0.28)] sm:h-52">
                <img alt={`${album.title}封面`} className="h-full w-full object-cover" src={coverImageFromAlbum(album)} />
              </div>
              {coverBadgeFromAlbum(album) ? (
                <span className="absolute left-6 top-6 z-20 inline-flex max-w-[70%] rounded-full bg-[#fff7dd] px-2.5 py-1 text-[11px] font-black text-[#6f343b] shadow-[0_4px_10px_rgba(111,52,59,0.08)]">
                  {coverBadgeFromAlbum(album)}
                </span>
              ) : null}
              <Link aria-label={`${album.title}详情`} className="absolute inset-0 z-10 rounded-[1.6rem]" href={`/album/${album.id}`} />

              <div
                aria-hidden="true"
                className={`absolute ${index % 3 === 0 ? "-left-1 top-2 -rotate-[36deg]" : index % 3 === 2 ? "right-1 top-2 rotate-[24deg]" : "hidden"} h-6 w-13 rounded-sm border border-[#d0b1b5] bg-[linear-gradient(135deg,rgba(255,255,255,0.28)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.28)_50%,rgba(255,255,255,0.28)_75%,transparent_75%,transparent)] bg-[length:12px_12px] bg-[#efcfd4] opacity-90 shadow-sm`}
              />

              <div className="flex flex-1 flex-col gap-0 px-1 text-stone-900">
                <h2 className="text-[1.2rem] font-black tracking-tight">{album.title}</h2>
                <p className="text-[11px] font-medium">照片{album.photoCount}个</p>
                <p className="text-[11px] font-medium">创建日期： {album.createdAt}</p>
                <p className="line-clamp-2 text-[11px] text-stone-700">{album.description}</p>
              </div>

              <div className="relative z-20 mt-1 flex justify-end">
                <button
                  className="rounded-[0.95rem] border-[2.5px] border-stone-700/80 bg-[#ee9eaa] px-1.5 py-0.5 text-right text-[10px] font-black leading-tight text-stone-900 shadow-[0_4px_0_rgba(109,76,76,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f2abb5] sm:px-2"
                  type="button"
                >
                  <span className="block text-[0.95rem] leading-none">更多</span>
                  <span className="block text-[8px] font-semibold">(编辑/删除)</span>
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>

      {isCreateDialogOpen ? (
        <CreateAlbumDialog
          onClose={() => setIsCreateDialogOpen(false)}
          onCreate={async ({ title, description, coverFile }) => {
            const formData = new FormData();
            formData.set("title", title);
            formData.set("description", description);

            if (coverFile) {
              formData.set("coverFileName", coverFile.name);
              formData.append("coverFile", coverFile, coverFile.name);
            }

            const response = await fetch("/api/albums", {
              method: "POST",
              body: formData,
            });
            const data = (await response.json()) as {
              album?: Album;
              error?: string;
            };

            const createdAlbum = data.album;

            if (!response.ok || !createdAlbum) {
              throw new Error(data.error ?? "新建相册失败");
            }

            setAlbums((currentAlbums) => [albumToCard(createdAlbum), ...currentAlbums]);
            setIsCreateDialogOpen(false);
          }}
        />
      ) : null}
    </main>
  );
}
