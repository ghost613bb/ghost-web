"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { albumCollections } from "@/data/album";

type CreateAlbumDialogProps = {
  onClose: () => void;
};

function CreateAlbumDialog({ onClose }: CreateAlbumDialogProps) {
  const titleId = useId();
  const nameId = useId();
  const noteId = useId();

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#6b3f49]/22 px-4 py-6 backdrop-blur-[2px]">
      <button aria-label="关闭新建相册弹窗" className="absolute inset-0" onClick={onClose} type="button" />
      <form
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative z-10 w-full max-w-[640px] rounded-[2rem] border-[3px] border-[#6f343b] bg-[#fcf8ef] px-5 py-5 shadow-[0_24px_60px_rgba(111,52,59,0.16)] sm:px-8 sm:py-7"
        onSubmit={(event) => {
          event.preventDefault();
          onClose();
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
            <label className="block text-[1.05rem] font-black sm:text-[1.25rem]" htmlFor={nameId}>
              相册名称
            </label>
            <div className="relative mt-2">
              <input
                className="h-14 w-full rounded-full border-[3px] border-[#6f343b] bg-[linear-gradient(90deg,#fff5f6_0%,#fdecef_100%)] px-5 pr-14 text-base text-[#6f343b] outline-none placeholder:text-[#c7a9af] focus:bg-white"
                id={nameId}
                placeholder="请输入相册名称"
                type="text"
              />
              <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[1.65rem]">
                🌥️
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[1.05rem] font-black sm:text-[1.25rem]" htmlFor={noteId}>
              备注/留言
            </label>
            <div className="relative mt-2">
              <textarea
                className="min-h-36 w-full rounded-[1.75rem] border-[3px] border-[#6f343b] bg-[linear-gradient(180deg,#fff6f6_0%,#fdeef0_100%)] px-5 py-4 text-sm text-[#6f343b] outline-none placeholder:text-[#c7a9af] focus:bg-white sm:text-base"
                id={noteId}
                placeholder="写点想留在相册里的话吧"
                rows={4}
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
            <p className="mb-2 text-[1.05rem] font-black sm:text-[1.25rem]">封面上传</p>
            <button
              className="flex min-h-30 w-full flex-col items-center justify-center rounded-[1.6rem] border-[3px] border-dashed border-[#6f343b] bg-[#fffdf7] text-[#6f343b] transition hover:-translate-y-0.5 hover:bg-white"
              type="button"
            >
              <span aria-hidden="true" className="text-[2.7rem] leading-none">
                📷
              </span>
              <span className="mt-2 text-[1.35rem] font-black leading-none sm:text-[1.45rem]">点击上传</span>
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <button
            className="min-w-[10.5rem] rounded-full border-[3px] border-[#6f343b] bg-[#f4b2be] px-6 py-2.5 text-[1.25rem] font-black text-[#6f343b] transition hover:-translate-y-0.5 hover:bg-[#f6bec8] sm:text-[1.35rem]"
            type="submit"
          >
            保存
          </button>
          <button
            className="min-w-[10.5rem] rounded-full border-[3px] border-[#6f343b] bg-[#fcf8ef] px-6 py-2.5 text-[1.25rem] font-black text-[#6f343b] transition hover:-translate-y-0.5 hover:bg-[#fffdf7] sm:text-[1.35rem]"
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

export function AlbumPageView() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const topActionClass =
    "inline-flex items-center rounded-[1rem] border-2 border-stone-700/80 bg-[#f8cfd5] px-3.5 py-1 text-sm font-black text-stone-900 transition hover:-translate-y-0.5 hover:bg-[#fbe0e4] sm:px-4 sm:py-1.5";

  return (
    <main className="album-page-scrollbar h-dvh overflow-y-auto bg-[#f7f1e8] text-stone-900">
      <header className="border-b-2 border-stone-700/60 bg-[#f6b8c2]">
        <div className="relative mx-auto flex max-w-[1320px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
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
          {albumCollections.map((album, index) => (
            <article
              key={album.id}
              className="relative flex min-h-[268px] flex-col rounded-[1.6rem] border-[2.5px] border-stone-700/80 bg-white p-3 shadow-[0_12px_24px_rgba(112,84,84,0.08)] sm:min-h-[282px]"
            >
              <div
                aria-hidden="true"
                className="mb-1 h-40 rounded-[1.3rem] bg-[#d8d4dc] bg-cover bg-center shadow-[inset_0_10px_24px_rgba(255,255,255,0.28)] sm:h-44"
                style={{ backgroundImage: "url(/album-cover-placeholder.jpeg)" }}
              />

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

              <div className="mt-1 flex justify-end">
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

      {isCreateDialogOpen ? <CreateAlbumDialog onClose={() => setIsCreateDialogOpen(false)} /> : null}
    </main>
  );
}
