"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Thought } from "@/data/thoughts";

type ThoughtsPageViewProps = {
  initialThoughts: Thought[];
};

function formatThoughtDate(createdAt: string | undefined) {
  if (!createdAt) {
    return "未记录日期";
  }

  return createdAt.replaceAll("-", ".");
}

function thoughtTags(thought: Thought) {
  return thought.tags ?? [];
}

function primaryTag(thought: Thought) {
  return thoughtTags(thought)[0] ?? "日常";
}

function thoughtImageRatioClass(index: number) {
  return ["aspect-[4/5]", "aspect-square", "aspect-[5/4]", "aspect-[3/4]"][index % 4];
}

function matchesQuery(thought: Thought, normalizedQuery: string) {
  if (!normalizedQuery) {
    return true;
  }

  return [thought.title, thought.body, thoughtTags(thought).join(" ")].some((value) => value.toLowerCase().includes(normalizedQuery));
}

export function ThoughtsPageView({ initialThoughts }: ThoughtsPageViewProps) {
  const [activeTag, setActiveTag] = useState("全部");
  const [query, setQuery] = useState("");
  const tags = useMemo(() => ["全部", ...Array.from(new Set(initialThoughts.flatMap((thought) => thoughtTags(thought))))], [initialThoughts]);
  const filteredThoughts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return initialThoughts.filter((thought) => (activeTag === "全部" || thoughtTags(thought).includes(activeTag)) && matchesQuery(thought, normalizedQuery));
  }, [activeTag, initialThoughts, query]);
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
            碎碎念
          </h1>
          <div aria-hidden="true" className="w-[6.5rem] sm:w-[7.75rem]" />
        </div>
      </header>

      <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-6 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                aria-pressed={activeTag === tag}
                className={`rounded-full border px-4 py-2 text-sm font-black shadow-sm transition hover:-translate-y-0.5 ${
                  activeTag === tag ? "border-[#e8cfd1] bg-[#f6dfe2] text-stone-800" : "border-[#e6d3d0] bg-white/60 text-stone-700 hover:bg-[#fff7f4]"
                }`}
                key={tag}
                onClick={() => setActiveTag(tag)}
                type="button"
              >
                {tag}
              </button>
            ))}
          </div>

          <label className="relative block w-full lg:w-[19rem]">
            <span className="sr-only">搜索碎碎念</span>
            <input
              aria-label="搜索碎碎念"
              className="w-full rounded-full border border-[#e3c8ca] bg-white/70 px-5 py-2.5 pr-11 text-sm font-semibold text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#c98f99] focus:ring-2 focus:ring-[#f3cfd5]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索"
              type="search"
              value={query}
            />
            <Search aria-hidden="true" className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
          </label>
        </div>

        {filteredThoughts.length > 0 ? (
          <section className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-5">
            {filteredThoughts.map((thought, index) => (
              <article
                className="mb-4 break-inside-avoid overflow-hidden rounded-[1.45rem] border-[2px] border-[#e8d4d1] bg-white p-2.5 shadow-[0_12px_24px_rgba(112,84,84,0.12)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(112,84,84,0.16)]"
                key={thought.id}
              >
                <div className={`mb-3 flex ${thoughtImageRatioClass(index)} items-center justify-center overflow-hidden rounded-[1rem] bg-[radial-gradient(circle_at_25%_20%,#fff8f4_0,#fff8f4_26%,transparent_27%),linear-gradient(135deg,#f8dfe1,#f7efe5)] text-4xl`}>
                  <img alt="碎碎念配图" className="h-full w-full object-cover" src="/album-cover-placeholder.jpeg" />
                </div>
                <div className="px-1 pb-1">
                  <h2 className="text-[1.15rem] font-black tracking-tight text-stone-900">{thought.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-600">{thought.body}</p>
                  <p className="mt-3 text-sm font-bold text-stone-600">
                    {formatThoughtDate(thought.createdAt)} · {primaryTag(thought)}
                  </p>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-[1.5rem] border-[2px] border-dashed border-[#e1c5c3] bg-white/60 px-6 py-12 text-center shadow-[0_12px_24px_rgba(112,84,84,0.08)]">
            <p className="text-lg font-black text-stone-800">没有找到相关碎碎念</p>
            <p className="mt-2 text-sm font-semibold text-stone-600">换个关键词，或者先回到全部分类看看。</p>
          </section>
        )}
      </div>
    </main>
  );
}
