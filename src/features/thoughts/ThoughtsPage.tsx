"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Thought } from "@/data/thoughts";
import { ContentTabsHeader } from "@/features/content-modules/components/ContentTabsHeader";
import { thoughtBodyToPlainText } from "./text";
import { formatThoughtListDate, getThoughtDateParts } from "./time";
import type { ThoughtDataSource } from "./service";

type ThoughtsPageViewProps = {
  dataSource?: ThoughtDataSource;
  initialThoughts: Thought[];
};

type ThoughtListItem = {
  bodyText: string;
  coverImageUrl?: string;
  coverMediaType?: "image" | "video";
  primaryTag: string;
  tags: string[];
  tagsText: string;
  thought: Thought;
};

type CalendarDateParts = NonNullable<ReturnType<typeof getThoughtDateParts>>;

type CalendarViewModel = {
  calendarDates: CalendarDateParts[];
  initialMonth: CalendarMonth;
};

type CalendarMonth = {
  month: number;
  year: number;
};

function thoughtTags(thought: Thought) {
  return thought.tags ?? [];
}

function getFirstImageSrc(body: string) {
  const match = body.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
  return match?.[1];
}

function getFirstMediaType(body: string) {
  const match = body.match(/<(img|video)\b/i);

  if (!match) {
    return undefined;
  }

  return match[1] === "video" ? "video" : "image";
}

function toThoughtListItem(thought: Thought): ThoughtListItem {
  const tags = thoughtTags(thought);

  return {
    bodyText: thought.bodyText ?? thoughtBodyToPlainText(thought.body),
    coverImageUrl: thought.coverImageUrl ?? getFirstImageSrc(thought.body),
    coverMediaType: getFirstMediaType(thought.body),
    primaryTag: tags[0] ?? "日常",
    tags,
    tagsText: tags.join(" "),
    thought,
  };
}

function matchesQuery(item: ThoughtListItem, normalizedQuery: string) {
  if (!normalizedQuery) {
    return true;
  }

  return [item.thought.title, item.bodyText, item.tagsText].some((value) => value.toLowerCase().includes(normalizedQuery));
}

function renderHighlightedText(value: string, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return value;
  }

  const normalizedValue = value.toLowerCase();
  const fragments = [];
  let cursor = 0;
  let matchIndex = normalizedValue.indexOf(normalizedQuery, cursor);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      fragments.push(value.slice(cursor, matchIndex));
    }

    const matchEnd = matchIndex + normalizedQuery.length;
    fragments.push(
      <mark className="rounded-[0.35rem] bg-[#ffe06d] px-0.5 text-stone-950" key={`${matchIndex}-${matchEnd}`}>
        {value.slice(matchIndex, matchEnd)}
      </mark>,
    );
    cursor = matchEnd;
    matchIndex = normalizedValue.indexOf(normalizedQuery, cursor);
  }

  if (cursor < value.length) {
    fragments.push(value.slice(cursor));
  }

  return fragments;
}

function formatCalendarMonthLabel(year: number, month: number) {
  return `${year}.${String(month).padStart(2, "0")}`;
}

function toCalendarDateParts(thought: Thought) {
  return getThoughtDateParts(thought.createdAt) ?? getThoughtDateParts(thought.publishedAt);
}

function getCalendarMonthOffset(month: CalendarMonth, offset: number): CalendarMonth {
  const date = new Date(month.year, month.month - 1 + offset, 1);

  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

function getDaysInCalendarMonth(month: CalendarMonth) {
  return new Date(month.year, month.month, 0).getDate();
}

function getFirstDayOfCalendarMonth(month: CalendarMonth) {
  return new Date(month.year, month.month - 1, 1).getDay();
}

function buildCalendarViewModel(thoughts: Thought[]): CalendarViewModel {
  const calendarDates = thoughts.map((thought) => toCalendarDateParts(thought)).filter((dateParts): dateParts is CalendarDateParts => Boolean(dateParts));

  const latestDate = calendarDates.reduce<CalendarDateParts | null>((latest, dateParts) => {
    if (!latest) {
      return dateParts;
    }

    const latestTime = new Date(latest.year, latest.month - 1, latest.day).getTime();
    const currentTime = new Date(dateParts.year, dateParts.month - 1, dateParts.day).getTime();
    return currentTime > latestTime ? dateParts : latest;
  }, null);

  const fallbackDate = new Date();

  return {
    calendarDates,
    initialMonth: latestDate
      ? {
          month: latestDate.month,
          year: latestDate.year,
        }
      : {
          month: fallbackDate.getMonth() + 1,
          year: fallbackDate.getFullYear(),
        },
  };
}

function DataSourceBadge({ source }: { source?: ThoughtDataSource }) {
  if (process.env.NODE_ENV === "production" || !source) {
    return null;
  }

  const label = source === "supabase" ? "数据源：Supabase" : source === "mixed" ? "数据源：Supabase + 本地 fallback" : "数据源：本地 fallback";

  return (
    <span className="fixed right-4 top-4 z-30 rounded-full border-2 border-[#5b3a30]/80 bg-[#fffaf0]/90 px-3 py-1 text-xs font-black text-[#5a352d] shadow-[0_4px_0_rgba(91,58,48,0.12)] backdrop-blur">
      {label}
    </span>
  );
}

type CalendarPanelProps = {
  calendarDates: CalendarDateParts[];
  month: CalendarMonth;
  onNextMonth: () => void;
  onPreviousMonth: () => void;
};

function CalendarPanel({ calendarDates, month, onNextMonth, onPreviousMonth }: CalendarPanelProps) {
  const markedDays = new Set(calendarDates.filter((dateParts) => dateParts.year === month.year && dateParts.month === month.month).map((dateParts) => dateParts.day));
  const monthLabel = formatCalendarMonthLabel(month.year, month.month);
  const daysInMonth = getDaysInCalendarMonth(month);
  const firstDayOffset = getFirstDayOfCalendarMonth(month);
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDate = today.getDate();

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[1.45rem] font-black text-[#5a352d]">Calendar</h2>
        <div className="flex items-center gap-1.5">
          <button
            aria-label="上一个月"
            className="grid h-7 w-7 place-items-center rounded-full border border-[#5b3a30]/35 bg-[#fff8e6] text-[#5a352d] transition hover:-translate-y-0.5 hover:bg-[#ffd6de] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97891]"
            onClick={onPreviousMonth}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </button>
          <span className="min-w-16 text-center text-xs font-black uppercase tracking-[0.18em] text-[#7a5147]">{monthLabel}</span>
          <button
            aria-label="下一个月"
            className="grid h-7 w-7 place-items-center rounded-full border border-[#5b3a30]/35 bg-[#fff8e6] text-[#5a352d] transition hover:-translate-y-0.5 hover:bg-[#ffd6de] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97891]"
            onClick={onNextMonth}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-y-2 text-center text-sm font-black text-[#5a352d]">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
        {Array.from({ length: firstDayOffset }, (_, index) => (
          <span aria-hidden="true" className="h-7 w-7" key={`empty-${monthLabel}-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
          const isMarkedDay = markedDays.has(day);
          const isToday = month.year === todayYear && month.month === todayMonth && day === todayDate;

          return (
            <span
              className={`relative mx-auto grid h-7 w-7 place-items-center rounded-full text-[0.92rem] transition ${isMarkedDay ? "bg-[#ffbac7] text-[#6a3d35]" : ""} ${isToday ? "-rotate-3 border border-[#5b3a30]/22 shadow-[0_3px_0_rgba(91,58,48,0.12)]" : ""} ${isToday && !isMarkedDay ? "bg-[#fff0ba] text-[#6a4a3f]" : ""} ${isToday && isMarkedDay ? "border-[#fff4cf]" : ""}`}
              key={day}
            >
              {day}
              {isToday ? <span aria-hidden="true" className="absolute -right-0.5 top-0.5 h-2 w-2 rounded-full border border-[#fffaf0] bg-[#ffd86f] shadow-[0_1px_0_rgba(91,58,48,0.12)]" /> : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function ThoughtsPageView({ dataSource, initialThoughts }: ThoughtsPageViewProps) {
  const [activeTag, setActiveTag] = useState("全部");
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const thoughtItems = useMemo(() => initialThoughts.map((thought) => toThoughtListItem(thought)), [initialThoughts]);
  const calendar = useMemo(() => buildCalendarViewModel(initialThoughts), [initialThoughts]);
  const [visibleCalendarMonth, setVisibleCalendarMonth] = useState(calendar.initialMonth);
  const tags = useMemo(() => ["全部", ...Array.from(new Set(thoughtItems.flatMap((item) => item.tags)))], [thoughtItems]);
  const filteredThoughts = useMemo(() => {
    return thoughtItems.filter((item) => (activeTag === "全部" || item.tags.includes(activeTag)) && matchesQuery(item, normalizedQuery));
  }, [activeTag, normalizedQuery, thoughtItems]);

  return (
    <main className="album-page-scrollbar h-dvh overflow-y-auto bg-[#fff8e6] text-[#4a2e28] [background-image:radial-gradient(circle_at_12%_18%,rgba(255,199,211,0.28)_0_80px,transparent_81px),radial-gradient(circle_at_88%_72%,rgba(190,233,221,0.36)_0_120px,transparent_121px),linear-gradient(90deg,rgba(121,76,55,0.04)_1px,transparent_1px),linear-gradient(rgba(121,76,55,0.035)_1px,transparent_1px)] [background-size:auto,auto,42px_42px,42px_42px]">
      <DataSourceBadge source={dataSource} />
      <ContentTabsHeader activeTab="thoughts" />

      <div className="mx-auto grid max-w-[1280px] gap-7 px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <div className="mb-6 flex flex-col gap-3 rounded-[1.4rem] border-[2px] border-[#5b3a30] bg-[#fffdf2]/86 p-3 shadow-[6px_6px_0_rgba(91,58,48,0.1)] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-black text-[#7a5147]">把今天的小事贴成一页奶油手账</p>
            <label className="relative block w-full sm:w-[19rem]">
              <span className="sr-only">搜索碎碎念</span>
              <input
                aria-label="搜索碎碎念"
                className="w-full rounded-full border-[2px] border-[#5b3a30] bg-white/85 px-5 py-2.5 pr-11 text-sm font-bold text-[#4a2e28] outline-none transition placeholder:text-[#9b7a70] focus:border-[#d97891] focus:ring-2 focus:ring-[#ffd2dc]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search diary..."
                type="search"
                value={query}
              />
              <Search aria-hidden="true" className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7a5147]" />
            </label>
          </div>

          {filteredThoughts.length > 0 ? (
            <section className="columns-1 gap-5 sm:columns-2 xl:columns-3">
              {filteredThoughts.map(({ bodyText, coverImageUrl, coverMediaType, primaryTag, thought }) => {
                return (
                  <article className="mb-5 break-inside-avoid overflow-hidden rounded-[1.45rem] border-[2px] border-[#5b3a30] bg-[#fffaf0] p-3 shadow-[8px_8px_0_rgba(91,58,48,0.14)] transition hover:-translate-y-1 hover:shadow-[10px_12px_0_rgba(91,58,48,0.16)]" key={thought.id}>
                    <Link className="block rounded-[1rem] outline-none focus-visible:ring-2 focus-visible:ring-[#d97891]" href={`/thoughts/${thought.slug}`}>
                      {coverImageUrl ? (
                        <div className="relative mb-3 overflow-hidden rounded-[1rem] border-[2px] border-[#5b3a30] bg-[#fff8e6]">
                          <img alt={`${thought.title}封面`} className="h-auto w-full object-cover" src={coverImageUrl} />
                          {coverMediaType === "video" ? (
                            <span aria-label="视频封面" className="pointer-events-none absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-[0.45rem] border border-[#5b3a30]/18 bg-[#fff7ea]/92 text-[#5b3a30] shadow-[0_3px_8px_rgba(91,58,48,0.12)] backdrop-blur-[1px]">
                              <Play aria-hidden="true" className="h-4 w-4 fill-current" />
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      <div className="px-1 pb-1">
                        <h2 className="line-clamp-2 text-[1.05rem] font-black tracking-tight text-[#3f2823]">{renderHighlightedText(thought.title, trimmedQuery)}</h2>
                        <p className="mt-1 text-xs font-bold text-[#7a5147]">{formatThoughtListDate(thought.createdAt)}</p>
                        <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[#5e463f]">{renderHighlightedText(bodyText, trimmedQuery)}</p>
                        <span className="mt-3 inline-flex rounded-full border border-[#5b3a30]/30 bg-[#ffccd5] px-3 py-1 text-xs font-black text-[#6f343b] shadow-[2px_2px_0_rgba(91,58,48,0.08)]">
                          {renderHighlightedText(primaryTag, trimmedQuery)}
                        </span>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </section>
          ) : (
            <section className="rounded-[1.5rem] border-[2px] border-dashed border-[#5b3a30] bg-[#fffdf2]/86 px-6 py-12 text-center shadow-[6px_6px_0_rgba(91,58,48,0.1)]">
              <p className="text-lg font-black text-[#4a2e28]">没有找到相关碎碎念</p>
              <p className="mt-2 text-sm font-semibold text-[#7a5147]">换个关键词，或者先回到全部分类看看。</p>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start" id="profile">
          <section className="relative overflow-hidden rounded-[1.65rem] border-[2px] border-[#5b3a30] bg-[#fffaf0]/90 px-6 py-6 shadow-[8px_8px_0_rgba(91,58,48,0.12)]">
            <div className="text-center">
              <h2 className="text-[1.45rem] font-black text-[#5a352d]">Profile</h2>
              <div className="mx-auto mt-4 grid h-28 w-28 place-items-center overflow-hidden rounded-full border-[2px] border-[#5b3a30] bg-[#ffe8a8] shadow-[4px_4px_0_rgba(91,58,48,0.12)]">
                <img alt="碎碎念头像" className="h-full w-full object-cover" src="/images/daily-thoughts-avatar.jpeg" />
              </div>
              <p className="mt-4 text-sm font-bold leading-6 text-[#765247]">记录灵感、日常和突然冒出来的小念头。</p>
            </div>

            <div className="mt-9" id="thought-tags">
              <h2 className="text-[1.45rem] font-black text-[#5a352d]">Tags</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    aria-pressed={activeTag === tag}
                    className={`rounded-full border-[2px] border-[#5b3a30] px-3 py-1.5 text-xs font-black shadow-[2px_2px_0_rgba(91,58,48,0.12)] transition hover:-translate-y-0.5 ${activeTag === tag ? "bg-[#ffb9c8] text-[#5a352d]" : "bg-[#dff4ff] text-[#5a352d] hover:bg-[#fff4cf]"
                      }`}
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    type="button"
                  >
                    {renderHighlightedText(tag, trimmedQuery)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <CalendarPanel
                calendarDates={calendar.calendarDates}
                month={visibleCalendarMonth}
                onNextMonth={() => setVisibleCalendarMonth((currentMonth) => getCalendarMonthOffset(currentMonth, 1))}
                onPreviousMonth={() => setVisibleCalendarMonth((currentMonth) => getCalendarMonthOffset(currentMonth, -1))}
              />
            </div>
          </section>
        </aside>
      </div>

      <Link
        aria-label="新建碎碎念"
        className="fixed bottom-6 right-6 z-30 inline-flex h-15 w-15 items-center justify-center rounded-full border-[3px] border-[#5b3a30] bg-[#ffb9c8] text-3xl font-black leading-none text-[#5b3a30] shadow-[8px_8px_0_rgba(91,58,48,0.18)] transition hover:-translate-y-1 hover:rotate-6 hover:bg-[#ffd6de]"
        href="/thoughts/new"
      >
        +
      </Link>
    </main>
  );
}
