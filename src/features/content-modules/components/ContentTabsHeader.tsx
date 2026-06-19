import Link from "next/link";
import { contentTabs, type ContentTabId } from "@/features/content-modules/config/contentTabs";

type ContentTabsHeaderProps = {
  activeTab: ContentTabId;
  title?: string;
};

export function ContentTabsHeader({ activeTab, title }: ContentTabsHeaderProps) {
  const activeContentTab = contentTabs.find((tab) => tab.id === activeTab);
  const displayTitle = title ?? activeContentTab?.headerTitle ?? "Pocket Diary";
  const avatarAlt = activeContentTab ? `${activeContentTab.label}头像` : "内容页头像";

  return (
    <header className="relative overflow-hidden border-b-[2px] border-[#5b3a30] bg-[#ffe8a8] shadow-[0_8px_0_rgba(91,58,48,0.06)]">
      <div aria-hidden="true" className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle,rgba(255,255,255,0.55)_0_2px,transparent_3px)] [background-size:34px_24px]" />
      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-4 px-4 pb-11 pt-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-13 w-13 place-items-center overflow-hidden rounded-full border-[2px] border-[#5b3a30] bg-[#fff8ed] shadow-[3px_3px_0_rgba(91,58,48,0.12)]">
            <img alt={avatarAlt} className="h-full w-full object-cover" src="/images/daily-thoughts-avatar.jpeg" />
          </span>
          <h1 className="text-[2.55rem] font-semibold leading-none tracking-[0.02em] text-[#6a3c34] [text-shadow:2px_2px_0_#fff7df,0_1px_0_rgba(91,58,48,0.18)] sm:text-[3.1rem]" style={{ fontFamily: '"Snell Roundhand", "Apple Chancery", "Bradley Hand", cursive' }}>
            {displayTitle}
          </h1>
        </div>
        <nav aria-label="内容页导航" className="flex flex-wrap items-center gap-3 text-base font-black text-[#4a2e28]">
          <Link aria-label="返回首页小镇" className="rounded-full px-4 py-1.5 transition hover:-translate-y-0.5 hover:bg-[#fff4cf]" href="/">
            Home
          </Link>
          {contentTabs.map((tab) =>
            tab.id === activeTab ? (
              <span className="rounded-full border-[2px] border-[#5b3a30] bg-[#ffb9c8] px-5 py-1.5 shadow-[3px_3px_0_rgba(91,58,48,0.12)]" key={tab.id}>
                {tab.label}
              </span>
            ) : (
              <Link className="rounded-full px-4 py-1.5 transition hover:-translate-y-0.5 hover:bg-[#fff4cf]" href={tab.href} key={tab.id}>
                {tab.label}
              </Link>
            ),
          )}
        </nav>
      </div>
      <svg aria-hidden="true" className="absolute inset-x-0 bottom-[-1px] h-10 w-full text-[#5b3a30]" preserveAspectRatio="none" viewBox="0 0 1440 40">
        <path d="M0 13 Q24 35 48 13 T96 13 T144 13 T192 13 T240 13 T288 13 T336 13 T384 13 T432 13 T480 13 T528 13 T576 13 T624 13 T672 13 T720 13 T768 13 T816 13 T864 13 T912 13 T960 13 T1008 13 T1056 13 T1104 13 T1152 13 T1200 13 T1248 13 T1296 13 T1344 13 T1392 13 T1440 13 L1440 40 L0 40 Z" fill="#fff8e6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
      </svg>
    </header>
  );
}
