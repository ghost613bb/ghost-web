import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Thought } from "@/data/thoughts";
import { formatThoughtListDate } from "./time";

type ThoughtDetailPageViewProps = {
  thought: Thought;
};

function renderThoughtLine(line: string, index: number): ReactNode {
  const trimmedLine = line.trim();

  if (!trimmedLine) {
    return <div aria-hidden="true" className="h-4" key={`blank-${index}`} />;
  }

  if (trimmedLine.startsWith("## ")) {
    return (
      <h2 className="pt-2 text-[1.12rem] font-black tracking-[0.03em] text-[#d97891]" key={`heading-${index}`}>
        {trimmedLine.slice(3)}
      </h2>
    );
  }

  if (trimmedLine.startsWith("- ")) {
    return (
      <p className="pl-3 text-[1rem] font-semibold leading-8 text-[#5b4347] before:mr-2 before:text-[#e79aab] before:content-['•']" key={`bullet-${index}`}>
        {trimmedLine.slice(2)}
      </p>
    );
  }

  if (trimmedLine.startsWith("> ")) {
    return (
      <p className="rounded-r-[1rem] border-l-4 border-[#f0b5c0] bg-[#fff6f8]/80 px-4 py-2 text-[1rem] font-bold leading-8 text-[#7a565a]" key={`quote-${index}`}>
        {trimmedLine.slice(2)}
      </p>
    );
  }

  return (
    <p className="whitespace-pre-wrap text-[1rem] font-semibold leading-8 text-[#5b4347]" key={`paragraph-${index}`}>
      {line}
    </p>
  );
}

export function ThoughtDetailPageView({ thought }: ThoughtDetailPageViewProps) {
  return (
    <main className="album-page-scrollbar h-dvh overflow-y-auto bg-[#f7f1e8] px-3 py-3 text-[#4c2b2d] sm:px-5 sm:py-3">
      <div className="mx-auto max-w-[1360px]">
        <section className="relative max-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-[2.2rem] border-[2px] border-[#e4d0bd] bg-[#fffaf0] p-3 shadow-[0_24px_60px_rgba(135,95,76,0.14)] sm:p-4 lg:pl-[5.6rem]" data-testid="thought-detail-frame">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-[4.3rem] border-r border-[#ead9c6] bg-[linear-gradient(90deg,#fff8ea_0%,#f7ead9_100%)] lg:block" />
          <div aria-hidden="true" className="absolute left-[3.62rem] top-9 hidden h-[76%] w-5 flex-col justify-between lg:flex">
            {Array.from({ length: 8 }).map((_, index) => (
              <span className="h-3 w-10 rounded-full bg-[linear-gradient(90deg,#8a572f_0%,#d19b62_48%,#7a4829_100%)] shadow-[0_2px_5px_rgba(74,45,24,0.28)]" key={index} />
            ))}
          </div>

          <div className="rounded-[1.8rem] border border-[#eadccf] bg-[#fffdf8] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)] sm:p-4">
            <header className="mb-2 flex flex-col gap-2 border-b border-[#efe4d8] pb-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <Link aria-label="返回" className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-black text-[#d97891] transition hover:-translate-x-0.5 hover:bg-[#fff2f5]" href="/thoughts">
                  <ArrowLeft aria-hidden="true" className="h-4 w-4 stroke-[2.2]" data-testid="thought-detail-back-icon" />
                  返回
                </Link>
              </div>
            </header>

            <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-[0.9rem] border border-[#eee2d4] bg-[#fffaf3] px-3 py-1.5 text-xs font-black text-[#7c625d] shadow-[0_8px_20px_rgba(120,90,75,0.05)]">
              {["H1", "H2", "H3", "B", "I", "❝", "☑", "⌘", "☻", "↶"].map((item) => (
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 hover:bg-white" key={item}>
                  {item}
                </span>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_270px]">
              <article aria-label="碎碎念正文纸张" className="relative min-h-[605px] overflow-hidden rounded-[1.2rem] border border-[#eee3d5] bg-[repeating-linear-gradient(0deg,#fffdf7_0,#fffdf7_31px,#efe6d8_32px)] px-5 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)] sm:px-7 sm:py-6">
                <div className="relative max-w-[780px] space-y-2">
                  <div className="flex flex-wrap items-center gap-2 pb-2 text-sm font-black text-[#9a7f74]">
                    <span>{formatThoughtListDate(thought.createdAt)}</span>
                  </div>
                  <div className="space-y-2 pt-2">{thought.body.split("\n").map((line, index) => renderThoughtLine(line, index))}</div>
                </div>
              </article>

              <aside className="rounded-[1.2rem] border border-[#eee0d4] bg-[#fff9f4] p-3.5 shadow-[0_12px_28px_rgba(129,92,75,0.08)]">
                <div className="mb-4 grid grid-cols-2 rounded-[0.9rem] bg-[#f8edf0] p-1 text-center text-xs font-black text-[#80615c]">
                  <span className="rounded-[0.7rem] bg-[#f8cfd5] py-2 text-[#7a3f4a]">背景模板</span>
                  <span className="py-2">自定义背景</span>
                </div>
                <div className="grid grid-cols-3 gap-3" aria-label="背景模板预览">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <span
                      className="h-18 rounded-[0.75rem] border border-[#eaded1] bg-[repeating-linear-gradient(0deg,#fffdf7_0,#fffdf7_11px,#efe6d8_12px)] shadow-[0_6px_14px_rgba(130,96,76,0.06)]"
                      key={index}
                    />
                  ))}
                </div>
                <div className="mt-4 rounded-[1rem] border border-dashed border-[#e2cfc2] bg-white/70 px-4 py-5 text-center text-sm font-black text-[#9a7f74]">☁ 上传背景图片</div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
