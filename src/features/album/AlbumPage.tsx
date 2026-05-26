import Link from "next/link";
import { albumCollections } from "@/data/album";

export function AlbumPageView() {
  return (
    <main className="min-h-dvh bg-[#f7f1e8] text-stone-900">
      <header className="border-b-2 border-stone-700/60 bg-[#f6b8c2]">
        <div className="relative mx-auto flex max-w-[1320px] items-center justify-end px-4 py-3 sm:px-6">
          <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-black tracking-tight sm:text-[1.9rem]">
            个人相册
          </h1>
          <button
            className="rounded-[1.1rem] border-2 border-stone-700/80 bg-[#f8cfd5] px-4 py-1.5 text-sm font-black text-stone-900 transition hover:-translate-y-0.5 hover:bg-[#fbe0e4] sm:px-5 sm:text-base"
            type="button"
          >
            新建相册
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Link
            className="inline-flex items-center rounded-full border border-stone-400 bg-white/70 px-3 py-1.5 text-xs text-stone-700 transition hover:bg-white sm:px-4 sm:text-sm"
            href="/"
          >
            返回首页小镇
          </Link>
          <p className="text-right text-xs text-stone-600 sm:text-sm">先用静态卡片搭一版轻量结构，后续再替换真实封面。</p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {albumCollections.map((album, index) => (
            <article
              key={album.id}
              className="relative flex min-h-[248px] flex-col rounded-[1.75rem] border-[2.5px] border-stone-700/80 bg-white p-3.5 shadow-[0_14px_28px_rgba(112,84,84,0.08)] sm:min-h-[260px]"
            >
              <div
                aria-hidden="true"
                className={`mb-4 flex h-28 items-center justify-center rounded-[1.45rem] ${album.coverTone} text-5xl shadow-[inset_0_10px_24px_rgba(255,255,255,0.28)] sm:h-32 sm:text-6xl`}
              >
                <span>{album.coverEmoji}</span>
              </div>

              <div
                aria-hidden="true"
                className={`absolute ${index % 3 === 0 ? "-left-1 top-2 -rotate-[36deg]" : index % 3 === 2 ? "right-1 top-2 rotate-[24deg]" : "hidden"} h-7 w-14 rounded-sm border border-[#d0b1b5] bg-[linear-gradient(135deg,rgba(255,255,255,0.28)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.28)_50%,rgba(255,255,255,0.28)_75%,transparent_75%,transparent)] bg-[length:12px_12px] bg-[#efcfd4] opacity-90 shadow-sm`}
              />

              <div className="flex flex-1 flex-col gap-1 px-1 text-stone-900">
                <h2 className="text-[2rem] font-black tracking-tight">{album.title}</h2>
                <p className="text-base font-medium">照片{album.photoCount}个</p>
                <p className="text-base font-medium">创建日期： {album.createdAt}</p>
                <p className="line-clamp-2 text-base text-stone-700">{album.description}</p>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  className="rounded-[1.15rem] border-[2.5px] border-stone-700/80 bg-[#ee9eaa] px-4 py-2 text-right text-xs font-black leading-tight text-stone-900 shadow-[0_4px_0_rgba(109,76,76,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f2abb5] sm:px-5"
                  type="button"
                >
                  <span className="block text-[1.65rem] leading-none">更多</span>
                  <span className="block text-[13px] font-semibold">(编辑/删除)</span>
                </button>
              </div>
            </article>
          ))}
        </section>

        <div className="fixed bottom-5 right-5 z-10">
          <button
            aria-label="上传"
            className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-[2.5px] border-stone-700/80 bg-[#ee9eaa] text-stone-900 shadow-[0_18px_40px_rgba(95,59,59,0.18)] transition hover:-translate-y-1 hover:bg-[#f2abb5] sm:h-24 sm:w-24"
            type="button"
          >
            <span className="text-2xl leading-none sm:text-3xl">📷</span>
            <span className="mt-1 text-xl font-black leading-none sm:text-2xl">上传</span>
          </button>
        </div>
      </div>
    </main>
  );
}
