"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Heart, ImagePlus, MessageSquareText, Plus, Sparkles, Trophy } from "lucide-react";
import { ContentTabsHeader } from "@/features/content-modules/components/ContentTabsHeader";
import { cloneInitialCoffees, defaultCoffeeGradient, verdictOptions, verdictStyle } from "./staticData";
import type { CoffeeItem, ReviewFormState, SelectOption } from "./types";

function CoffeePhoto({ coffee, photoUrl }: { coffee: CoffeeItem; photoUrl?: string }) {
  if (photoUrl) {
    return <img alt={`${coffee.name}评价照片`} className="h-full w-full object-cover" src={photoUrl} />;
  }

  return (
    <div className={`relative h-full w-full bg-gradient-to-br ${defaultCoffeeGradient}`}>
      <div aria-hidden="true" className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle,rgba(255,255,255,0.72)_0_2px,transparent_3px)] [background-size:22px_22px]" />
      <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-24 w-30 -translate-x-1/2 -translate-y-1/2 rounded-b-[2.4rem] rounded-t-[1.1rem] border-[2.5px] border-[#5b3a30] bg-[#fffaf0]/74 shadow-[inset_0_-22px_0_rgba(121,76,55,0.13),4px_6px_0_rgba(91,58,48,0.12)]" />
      <div aria-hidden="true" className="absolute left-[59%] top-[43%] h-11 w-11 rounded-full border-[2.5px] border-[#5b3a30]/85" />
      <div aria-hidden="true" className="absolute left-[43%] top-[31%] h-7 w-1.5 rounded-full bg-[#fffaf0]/70 shadow-[14px_-5px_0_rgba(255,250,240,0.62),28px_0_0_rgba(255,250,240,0.55)]" />
      <span className="absolute bottom-4 left-4 rotate-[-3deg] rounded-full border-[2px] border-[#5b3a30] bg-[#fffaf0] px-3 py-1 text-[0.7rem] font-black tracking-[0.08em] text-[#7a5147] shadow-[3px_3px_0_rgba(91,58,48,0.1)]">等一张咖啡照</span>
    </div>
  );
}

function HandwrittenSelect<T extends string>({ label, onChange, options, value }: { label: string; onChange: (value: T) => void; options: SelectOption<T>[]; value: T }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <div
      className="space-y-1 text-sm font-black"
      onBlur={(event) => {
        const nextFocusTarget = event.relatedTarget;

        if (!(nextFocusTarget instanceof Node) || !event.currentTarget.contains(nextFocusTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <p>{label}</p>
      <div className="relative mt-1">
        <button
          aria-controls={`${label}-coffee-select-listbox`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={label}
          className="flex w-full items-center justify-between gap-3 rounded-[1rem] border-2 border-[#d7b7a2] bg-[#fffaf0] px-3 py-2.5 text-left text-sm font-black text-[#4a2e28] outline-none transition hover:bg-[#fff6f3] focus:border-[#d48b9a]"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <span className="truncate">{selectedOption.label}</span>
          <svg aria-hidden="true" className={`h-4 w-4 shrink-0 text-[#7a5147] transition ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 16 16">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>
        {isOpen ? (
          <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-[1rem] border-2 border-[#d7b7a2] bg-[#fffdf2] shadow-[6px_6px_0_rgba(91,58,48,0.1)]">
            <ul className="max-h-56 overflow-y-auto p-1.5" id={`${label}-coffee-select-listbox`} role="listbox">
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <li key={option.value} role="presentation">
                    <button
                      aria-selected={isSelected}
                      className={`w-full rounded-[0.75rem] px-3 py-2 text-left text-sm font-black transition ${isSelected ? "bg-[#ffb9c8] text-[#5b3a30]" : "text-[#765247] hover:bg-[#fff1f4]"}`}
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      role="option"
                      type="button"
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CoffeeRankCard({ coffee, index, isActive, onSelect }: { coffee: CoffeeItem; index: number; isActive: boolean; onSelect: (coffeeId: string) => void }) {
  const latestReview = coffee.reviews[0];

  return (
    <button
      aria-pressed={isActive}
      className={`group relative w-full overflow-hidden rounded-[1.2rem] border-[2px] p-4 text-left transition duration-300 ${
        isActive
          ? "-translate-y-1 rotate-[-0.45deg] border-[#5b3a30] bg-[#fffdf2] shadow-[7px_7px_0_rgba(91,58,48,0.15)]"
          : "border-[#5b3a30]/70 bg-[#fffaf0]/82 shadow-[4px_4px_0_rgba(91,58,48,0.08)] hover:-translate-y-0.5 hover:border-[#5b3a30]"
      }`}
      onClick={() => onSelect(coffee.id)}
      type="button"
    >
      <div aria-hidden="true" className={`absolute -right-7 -top-9 h-24 w-24 rounded-full bg-gradient-to-br ${defaultCoffeeGradient} opacity-60 transition group-hover:scale-110`} />
      <div className="relative flex items-start gap-2.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[#5b3a30] bg-[#ffe8a8] text-lg font-black text-[#5b3a30] shadow-[3px_3px_0_rgba(91,58,48,0.12)]">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[1.12rem] font-black leading-none tracking-tight text-[#4a2e28]">{coffee.name}</h2>
            <span className={`rounded-full border-2 px-2.5 py-0.5 text-[0.68rem] font-black shadow-[2px_2px_0_rgba(91,58,48,0.1)] ${verdictStyle[latestReview.verdict]}`}>本次判定：{latestReview.verdict}</span>
          </div>
          <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-[#765247]">{coffee.flavor}</p>
        </div>
        <div className="relative z-10 rounded-[0.85rem] border-2 border-[#5b3a30] bg-[#fffbeb] px-2 py-1.5 text-center shadow-[3px_3px_0_rgba(91,58,48,0.1)]">
          <p className="text-[1.2rem] font-black leading-none text-[#6a3c34]">{coffee.score.toFixed(0)}</p>
          <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-[#a27a64]">分</p>
        </div>
      </div>
    </button>
  );
}

function ReviewComposer({ form, isSubmitting, onFormChange, onPhotoSelect, onSubmit, submitError }: { form: ReviewFormState; isSubmitting: boolean; onFormChange: (form: ReviewFormState) => void; onPhotoSelect: (event: ChangeEvent<HTMLInputElement>) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; submitError: string | null }) {
  return (
    <form className="rounded-[1.35rem] border-[2px] border-[#5b3a30] bg-[#fffdf2] p-3.5 text-[#4a2e28] shadow-[6px_6px_0_rgba(91,58,48,0.1)] sm:p-4" onSubmit={onSubmit}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b56f72]">new note</p>
          <h2 className="mt-1 text-xl font-black tracking-tight">再审一杯</h2>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#5b3a30] bg-[#ffb9c8] shadow-[3px_3px_0_rgba(91,58,48,0.12)]">
          <Plus aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-black">
          咖啡名
          <input className="mt-1 w-full rounded-[1rem] border-2 border-[#d7b7a2] bg-[#fffaf0] px-3 py-2.5 text-sm font-black text-[#4a2e28] outline-none transition placeholder:text-[#a27a64]/80 focus:border-[#d48b9a]" onChange={(event) => onFormChange({ ...form, coffeeName: event.currentTarget.value })} placeholder="例如：生椰拿铁" value={form.coffeeName} />
        </label>
        <HandwrittenSelect label="本次判定" onChange={(verdict) => onFormChange({ ...form, verdict })} options={verdictOptions} value={form.verdict} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[0.72fr_1fr]">
        <label className="space-y-1 text-sm font-black">
          打分
          <input className="mt-1 w-full rounded-[1rem] border-2 border-[#d7b7a2] bg-[#fffaf0] px-3 py-2.5 text-sm font-black text-[#4a2e28] outline-none transition placeholder:text-[#a27a64]/80 focus:border-[#d48b9a]" inputMode="numeric" max="100" min="0" onChange={(event) => onFormChange({ ...form, score: event.currentTarget.value })} placeholder="0-100" type="number" value={form.score} />
        </label>
        <label className="space-y-1 text-sm font-black">
          温度/糖度
          <input className="mt-1 w-full rounded-[1rem] border-2 border-[#d7b7a2] bg-[#fffaf0] px-3 py-2.5 text-sm font-black text-[#4a2e28] outline-none transition placeholder:text-[#a27a64]/80 focus:border-[#d48b9a]" onChange={(event) => onFormChange({ ...form, temperature: event.currentTarget.value })} placeholder="例如：冰 / 少糖" value={form.temperature} />
        </label>
      </div>

      <label className="mt-4 block text-sm font-black">
        why
        <textarea className="mt-1 min-h-24 w-full resize-none rounded-[1rem] border-2 border-[#d7b7a2] bg-[#fffaf0] px-3 py-3 text-sm font-bold leading-6 text-[#4a2e28] outline-none transition placeholder:text-[#a27a64]/80 focus:border-[#d48b9a]" onChange={(event) => onFormChange({ ...form, why: event.currentTarget.value })} placeholder="今天这杯为什么夯/稳/拉？甜度、咖啡感、踩雷点都可以写在这里。" value={form.why} />
      </label>

      <label className="mt-4 block text-sm font-black">
        提醒
        <input className="mt-1 w-full rounded-[1rem] border-2 border-[#d7b7a2] bg-[#fffaf0] px-3 py-2.5 text-sm font-black text-[#4a2e28] outline-none transition placeholder:text-[#a27a64]/80 focus:border-[#d48b9a]" onChange={(event) => onFormChange({ ...form, reminder: event.currentTarget.value })} placeholder="例如：下午三点后别喝" value={form.reminder} />
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block rounded-[1rem] border-2 border-dashed border-[#d48b9a] bg-[#fff6f3] px-3 py-3 text-sm font-black text-[#6a3c34] transition hover:bg-[#fff1f4]">
          <span className="flex items-center gap-2">
            <ImagePlus aria-hidden="true" className="h-4 w-4 text-[#d67a8f]" />
            上传本次照片
          </span>
          <input accept="image/*" className="sr-only" onChange={onPhotoSelect} type="file" />
          <span className="mt-1 block truncate text-xs font-semibold text-[#9b7463]">{form.photoUrl ? "已选好照片，保存后会贴到评价墙。" : "可选：给这次评价贴一张小照片。"}</span>
        </label>
        <button className="rounded-[1rem] border-2 border-[#5b3a30] bg-[#ffb9c8] px-5 py-3 text-sm font-black text-[#5b3a30] shadow-[4px_4px_0_rgba(91,58,48,0.14)] transition hover:-translate-y-0.5 hover:bg-[#ffc6d2] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
          {isSubmitting ? "记录中..." : "记入排名"}
        </button>
      </div>
      {submitError ? <p className="mt-3 rounded-[1rem] border border-[#d67a8f] bg-[#fff1f4] px-3 py-2 text-xs font-black text-[#9f5365]">{submitError}</p> : null}
    </form>
  );
}

type CoffeeRankingsPageProps = {
  initialCoffeeItems?: CoffeeItem[];
};

export function CoffeeRankingsPage({ initialCoffeeItems = cloneInitialCoffees() }: CoffeeRankingsPageProps) {
  const firstCoffee = initialCoffeeItems[0] ?? cloneInitialCoffees()[0];
  const [coffees, setCoffees] = useState<CoffeeItem[]>(initialCoffeeItems.length > 0 ? initialCoffeeItems : [firstCoffee]);
  const rankedCoffees = useMemo(() => [...coffees].sort((a, b) => b.score - a.score), [coffees]);
  const [activeCoffeeId, setActiveCoffeeId] = useState(firstCoffee.id);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<ReviewFormState>({
    coffeeId: firstCoffee.id,
    coffeeName: firstCoffee.name,
    score: String(firstCoffee.score),
    temperature: firstCoffee.temperature,
    why: firstCoffee.flavor,
    reminder: firstCoffee.warning,
    photoUrl: "",
    verdict: "夯",
  });
  const activeCoffee = rankedCoffees.find((coffee) => coffee.id === activeCoffeeId) ?? rankedCoffees[0];
  const totalReviews = coffees.reduce((total, coffee) => total + coffee.reviews.length, 0);
  const hottestCoffee = rankedCoffees[0];

  function handlePhotoSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) return;

    setPhotoFile(file);
    setForm((currentForm) => ({ ...currentForm, photoUrl: URL.createObjectURL(file) }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("coffeeId", form.coffeeId);
      formData.set("coffeeName", form.coffeeName);
      formData.set("score", form.score);
      formData.set("temperature", form.temperature);
      formData.set("why", form.why);
      formData.set("reminder", form.reminder);
      formData.set("verdict", form.verdict);

      if (photoFile) {
        formData.set("photoFile", photoFile);
      }

      const response = await fetch("/api/coffee/reviews", {
        body: formData,
        credentials: "same-origin",
        method: "POST",
      });
      const result = (await response.json().catch(() => ({}))) as { coffee?: CoffeeItem; coffees?: CoffeeItem[]; error?: string };

      if (!response.ok || !result.coffee || !result.coffees) {
        throw new Error(response.status === 401 ? "请先去后台解锁管理，再记录咖啡评价。" : result.error ?? "咖啡评价暂时没记上");
      }

      setCoffees(result.coffees);
      setActiveCoffeeId(result.coffee.id);
      setForm((currentForm) => ({
        ...currentForm,
        coffeeId: result.coffee?.id ?? currentForm.coffeeId,
        coffeeName: result.coffee?.name ?? currentForm.coffeeName,
        photoUrl: "",
      }));
      setPhotoFile(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "咖啡评价暂时没记上");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="album-page-scrollbar h-dvh overflow-y-auto bg-[#fff8e6] text-[#4a2e28] [background-image:radial-gradient(circle_at_12%_18%,rgba(255,199,211,0.28)_0_80px,transparent_81px),radial-gradient(circle_at_88%_72%,rgba(190,233,221,0.36)_0_120px,transparent_121px),linear-gradient(90deg,rgba(121,76,55,0.04)_1px,transparent_1px),linear-gradient(rgba(121,76,55,0.035)_1px,transparent_1px)] [background-size:auto,auto,42px_42px,42px_42px]">
      <ContentTabsHeader activeTab="coffee" />

      <section className="relative mx-auto max-w-[1280px] px-4 pb-12 pt-8 sm:px-6">
        <div className="relative overflow-hidden rounded-[1.45rem] border-[2px] border-[#5b3a30] bg-[#fffdf2]/92 p-3.5 shadow-[6px_6px_0_rgba(91,58,48,0.09)] sm:p-5">
          <div aria-hidden="true" className="absolute inset-0 opacity-55 [background-image:radial-gradient(circle,rgba(91,58,48,0.16)_0_1px,transparent_2px)] [background-size:24px_24px]" />
          <div className="relative grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="inline-flex rotate-[-1deg] items-center gap-1.5 rounded-full border-[2px] border-[#5b3a30] bg-[#ffb9c8] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#6a3c34] shadow-[3px_3px_0_rgba(91,58,48,0.1)]">
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                Cotti coffee notebook
              </p>
              <h1 className="mt-3 max-w-3xl text-[2rem] font-black leading-tight tracking-tight text-[#4a2e28] [text-shadow:2px_2px_0_#fff7df,0_1px_0_rgba(91,58,48,0.18)] sm:text-[2.8rem]">
                咖啡推荐
              </h1>
              <p className="mt-3 max-w-2xl text-xs font-semibold leading-6 text-[#765247] sm:text-sm">
                库迪咖啡小本本：从「夯」到「拉」记录每一杯的真实体感。可以对同一杯反复评价，也可以给这次评价贴一张照片，慢慢攒成自己的咖啡续命地图。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-[1.05rem] border-[2px] border-[#5b3a30] bg-[#fffaf0] p-3 shadow-[3px_3px_0_rgba(91,58,48,0.09)]">
                <Trophy aria-hidden="true" className="mb-2 h-5 w-5 text-[#d67a8f]" />
                <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#b56f72]">top one</p>
                <p className="mt-1 text-base font-black text-[#4a2e28]">{hottestCoffee.name}</p>
              </div>
              <div className="rounded-[1.05rem] border-[2px] border-[#5b3a30] bg-[#ffe8a8] p-3 shadow-[3px_3px_0_rgba(91,58,48,0.09)]">
                <MessageSquareText aria-hidden="true" className="mb-2 h-5 w-5 text-[#6a3c34]" />
                <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8b5c46]">reviews</p>
                <p className="mt-1 text-2xl font-black text-[#4a2e28]">{totalReviews}</p>
              </div>
              <div className="rounded-[1.05rem] border-[2px] border-[#5b3a30] bg-[#bee9dd] p-3 shadow-[3px_3px_0_rgba(91,58,48,0.09)]">
                <Heart aria-hidden="true" className="mb-2 h-5 w-5 text-[#6a3c34]" />
                <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#4f7069]">scale</p>
                <p className="mt-1 text-base font-black text-[#4a2e28]">夯到拉</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[0.88fr_1.22fr]">
          <aside className="lg:sticky lg:top-5 lg:self-start" aria-label="咖啡排名榜">
            <div className="rounded-[1.45rem] border-[2px] border-[#5b3a30] bg-[#ffe8a8]/88 p-3.5 shadow-[6px_6px_0_rgba(91,58,48,0.09)] sm:p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b56f72]">ranking</p>
                  <h2 className="text-xl font-black tracking-tight text-[#4a2e28]">夯拉排行榜</h2>
                </div>
                <span className="rounded-full border-2 border-[#5b3a30] bg-[#fffaf0] px-3 py-1 text-xs font-black text-[#765247] shadow-[2px_2px_0_rgba(91,58,48,0.08)]">按分排序</span>
              </div>
              <div className="space-y-3">
                {rankedCoffees.map((coffee, index) => (
                  <CoffeeRankCard coffee={coffee} index={index} isActive={coffee.id === activeCoffee.id} key={coffee.id} onSelect={setActiveCoffeeId} />
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-5" aria-label="咖啡详情与评价记录">
            <article className="overflow-hidden rounded-[1.65rem] border-[2px] border-[#5b3a30] bg-[#fffdf2] shadow-[8px_8px_0_rgba(91,58,48,0.1)]">
              <div className="grid min-h-[22rem] lg:grid-cols-[0.78fr_1.22fr]">
                <div className="relative min-h-[17rem] overflow-hidden border-b-[2.5px] border-[#5b3a30] bg-[#fffaf0] lg:border-b-0 lg:border-r-[2.5px]">
                  <div className="h-full min-h-[17rem] lg:min-h-0">
                    <CoffeePhoto coffee={activeCoffee} photoUrl={activeCoffee.reviews.find((review) => review.photoUrl)?.photoUrl} />
                  </div>
                  <div className="absolute left-4 top-4 rotate-[-2deg] rounded-full border-2 border-[#5b3a30] bg-[#ffb9c8] px-4 py-2 text-sm font-black text-[#6a3c34] shadow-[3px_3px_0_rgba(91,58,48,0.12)]">
                    #{rankedCoffees.findIndex((coffee) => coffee.id === activeCoffee.id) + 1} / {activeCoffee.reviews[0]?.verdict ?? "待观察"}
                  </div>
                </div>
                <div className="grid content-start gap-4 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b56f72]">selected cup</p>
                      <h2 className="mt-2 text-[1.9rem] font-black leading-tight tracking-tight text-[#4a2e28] [text-shadow:1px_1px_0_#fff7df] sm:text-[2.4rem]">
                        {activeCoffee.name}
                      </h2>
                    </div>
                    <p className="inline-flex rounded-full border-2 border-[#5b3a30] bg-[#ffe8a8] px-3 py-1 text-xs font-black text-[#6a3c34] shadow-[2px_2px_0_rgba(91,58,48,0.08)]">{activeCoffee.temperature}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[0.52fr_1fr]">
                    <div className="rounded-[1.2rem] border-2 border-[#5b3a30] bg-[#fffaf0] p-4 shadow-[3px_3px_0_rgba(91,58,48,0.08)]">
                      <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#b56f72]">score</p>
                      <p className="mt-1 text-5xl font-black leading-none text-[#d67a8f]">{activeCoffee.score.toFixed(0)}</p>
                    </div>
                    <div className="rounded-[1.2rem] border-2 border-[#5b3a30] bg-[#fffaf0] p-4 shadow-[3px_3px_0_rgba(91,58,48,0.08)]">
                      <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#b56f72]">why</p>
                      <p className="mt-2 text-sm font-bold leading-7 text-[#765247]">{activeCoffee.flavor}</p>
                    </div>
                  </div>
                  <div className="rounded-[1.2rem] border-2 border-[#5b3a30] bg-[#fff1f4] p-4 shadow-[3px_3px_0_rgba(91,58,48,0.08)]">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#b56f72]">小提醒</p>
                    <p className="mt-2 text-sm font-black leading-7 text-[#765247]">{activeCoffee.warning}</p>
                  </div>
                </div>
              </div>
            </article>
            <ReviewComposer form={form} isSubmitting={isSubmitting} onFormChange={setForm} onPhotoSelect={handlePhotoSelect} onSubmit={handleSubmit} submitError={submitError} />
          </section>
        </div>
      </section>
    </main>
  );
}
