"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Heart, ImagePlus, MessageSquareText, Plus, Sparkles, Trophy } from "lucide-react";
import { ContentTabsHeader } from "@/features/content-modules/components/ContentTabsHeader";

type CoffeeReview = {
  id: string;
  author: string;
  date: string;
  note: string;
  photoUrl?: string;
  verdict: "夯" | "稳" | "待观察" | "拉";
};

type CoffeeItem = {
  id: string;
  name: string;
  alias: string;
  rankLabel: string;
  score: number;
  temperature: string;
  flavor: string;
  warning: string;
  gradient: string;
  reviews: CoffeeReview[];
};

type ReviewFormState = {
  coffeeId: string;
  note: string;
  photoUrl: string;
  verdict: CoffeeReview["verdict"];
};

const initialCoffees: CoffeeItem[] = [
  {
    id: "coconut-latte",
    name: "生椰拿铁",
    alias: "续命白月光",
    rankLabel: "夯到爆",
    score: 98,
    temperature: "冰 / 少糖 / 必须大杯",
    flavor: "椰香很厚，咖啡感不怂，像把人从工位上拎起来重启。",
    warning: "下午三点后喝会把夜晚变成第二个白天。",
    gradient: "from-[#fff7d8] via-[#f6d995] to-[#c9864d]",
    reviews: [
      {
        id: "review-coconut-1",
        author: "我本人",
        date: "06.25 10:18",
        note: "今天的椰香在线，入口像一口奶油色电池，精神条直接回满。",
        verdict: "夯",
      },
      {
        id: "review-coconut-2",
        author: "我本人",
        date: "06.27 14:06",
        note: "加冰之后甜度刚好，适合周会前强行恢复人类语言能力。",
        verdict: "夯",
      },
    ],
  },
  {
    id: "raw-coconut-americano",
    name: "生椰美式",
    alias: "清醒狠角色",
    rankLabel: "很能打",
    score: 91,
    temperature: "冰 / 无糖 / 不许摇太散",
    flavor: "前调清爽，后调有一点椰子水的甜，适合需要理智但不想受苦的时候。",
    warning: "状态差时会觉得它太直给。",
    gradient: "from-[#e7fbf3] via-[#bdebdc] to-[#73bba7]",
    reviews: [
      {
        id: "review-americano-1",
        author: "我本人",
        date: "06.20 09:47",
        note: "像给脑子开了一扇窗，适合早上第一杯。",
        verdict: "稳",
      },
    ],
  },
  {
    id: "cheese-latte",
    name: "厚乳拿铁",
    alias: "圆润缓冲垫",
    rankLabel: "稳定上桌",
    score: 86,
    temperature: "热 / 半糖 / 加班备用",
    flavor: "奶感很厚，咖啡被包住了，像穿毛衣的工作日。",
    warning: "连喝两天会腻，需要美式解围。",
    gradient: "from-[#fff9e7] via-[#f4d79f] to-[#d99b67]",
    reviews: [
      {
        id: "review-cheese-1",
        author: "我本人",
        date: "06.18 19:32",
        note: "夜里写东西时很安慰，但没有生椰那种上头感。",
        verdict: "稳",
      },
    ],
  },
  {
    id: "orange-americano",
    name: "橙C美式",
    alias: "花活选手",
    rankLabel: "看当天心情",
    score: 73,
    temperature: "冰 / 默认糖 / 只在想换口味时点",
    flavor: "果酸很亮，咖啡存在感被橙子推到墙角，快乐但不够日常。",
    warning: "空腹喝像把胃交给随机数。",
    gradient: "from-[#fff0c7] via-[#ffc981] to-[#f19b60]",
    reviews: [
      {
        id: "review-orange-1",
        author: "我本人",
        date: "06.13 16:45",
        note: "第一口很开心，第八口开始想念正常咖啡。",
        verdict: "待观察",
      },
    ],
  },
  {
    id: "brown-sugar-latte",
    name: "黑糖拿铁",
    alias: "甜到报警",
    rankLabel: "拉警戒线",
    score: 58,
    temperature: "冰 / 少糖也甜 / 慎点",
    flavor: "黑糖香很抢，像喝了一杯披着咖啡外套的甜品。",
    warning: "需要强咖啡因时不要被它骗。",
    gradient: "from-[#f7dfbd] via-[#c99267] to-[#7b4a32]",
    reviews: [
      {
        id: "review-brown-1",
        author: "我本人",
        date: "06.11 12:24",
        note: "不是难喝，是它不承担咖啡应该承担的责任。",
        verdict: "拉",
      },
    ],
  },
];

const verdictStyle: Record<CoffeeReview["verdict"], string> = {
  夯: "border-[#5b3a30] bg-[#ffb9c8] text-[#5b3a30]",
  稳: "border-[#5b3a30] bg-[#ffe8a8] text-[#5b3a30]",
  待观察: "border-[#5b3a30] bg-[#bee9dd] text-[#36584f]",
  拉: "border-[#5b3a30] bg-[#d9c1ad] text-[#5b3a30]",
};

function getVerdictDelta(verdict: CoffeeReview["verdict"]) {
  if (verdict === "夯") return 2.4;
  if (verdict === "稳") return 0.8;
  if (verdict === "待观察") return -0.6;
  return -2.8;
}

function createReviewId() {
  return `review-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function getCurrentDateLabel() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  return `${month}.${date} ${hour}:${minute}`;
}

function CoffeePhoto({ coffee, photoUrl }: { coffee: CoffeeItem; photoUrl?: string }) {
  if (photoUrl) {
    return <img alt={`${coffee.name}评价照片`} className="h-full w-full object-cover" src={photoUrl} />;
  }

  return (
    <div className={`relative h-full w-full bg-gradient-to-br ${coffee.gradient}`}>
      <div aria-hidden="true" className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle,rgba(255,255,255,0.72)_0_2px,transparent_3px)] [background-size:22px_22px]" />
      <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-24 w-30 -translate-x-1/2 -translate-y-1/2 rounded-b-[2.4rem] rounded-t-[1.1rem] border-[2.5px] border-[#5b3a30] bg-[#fffaf0]/74 shadow-[inset_0_-22px_0_rgba(121,76,55,0.13),4px_6px_0_rgba(91,58,48,0.12)]" />
      <div aria-hidden="true" className="absolute left-[59%] top-[43%] h-11 w-11 rounded-full border-[2.5px] border-[#5b3a30]/85" />
      <div aria-hidden="true" className="absolute left-[43%] top-[31%] h-7 w-1.5 rounded-full bg-[#fffaf0]/70 shadow-[14px_-5px_0_rgba(255,250,240,0.62),28px_0_0_rgba(255,250,240,0.55)]" />
      <span className="absolute bottom-4 left-4 rotate-[-3deg] rounded-full border-[2px] border-[#5b3a30] bg-[#fffaf0] px-3 py-1 text-[0.7rem] font-black tracking-[0.08em] text-[#7a5147] shadow-[3px_3px_0_rgba(91,58,48,0.1)]">等一张咖啡照</span>
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
      <div aria-hidden="true" className={`absolute -right-7 -top-9 h-24 w-24 rounded-full bg-gradient-to-br ${coffee.gradient} opacity-60 transition group-hover:scale-110`} />
      <div className="relative flex items-start gap-2.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[#5b3a30] bg-[#ffe8a8] text-lg font-black text-[#5b3a30] shadow-[3px_3px_0_rgba(91,58,48,0.12)]">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[1.12rem] font-black leading-none tracking-tight text-[#4a2e28]">{coffee.name}</h2>
            <span className={`rounded-full border-2 px-2.5 py-0.5 text-[0.68rem] font-black shadow-[2px_2px_0_rgba(91,58,48,0.1)] ${verdictStyle[latestReview.verdict]}`}>{coffee.rankLabel}</span>
          </div>
          <p className="mt-1 text-xs font-black tracking-[0.12em] text-[#b56f72]">{coffee.alias}</p>
          <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-[#765247]">{latestReview.note}</p>
        </div>
        <div className="relative z-10 rounded-[0.85rem] border-2 border-[#5b3a30] bg-[#fffbeb] px-2 py-1.5 text-center shadow-[3px_3px_0_rgba(91,58,48,0.1)]">
          <p className="text-[1.2rem] font-black leading-none text-[#6a3c34]">{coffee.score.toFixed(0)}</p>
          <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-[#a27a64]">分</p>
        </div>
      </div>
    </button>
  );
}

function ReviewComposer({ coffees, form, onFormChange, onPhotoSelect, onSubmit }: { coffees: CoffeeItem[]; form: ReviewFormState; onFormChange: (form: ReviewFormState) => void; onPhotoSelect: (event: ChangeEvent<HTMLInputElement>) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
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

      <div className="mt-5 grid gap-3 sm:grid-cols-[1.1fr_0.85fr]">
        <label className="space-y-1 text-sm font-black">
          选择咖啡
          <select className="mt-1 w-full rounded-[1rem] border-2 border-[#d7b7a2] bg-[#fffaf0] px-3 py-2.5 text-sm font-black text-[#4a2e28] outline-none transition focus:border-[#d48b9a]" onChange={(event) => onFormChange({ ...form, coffeeId: event.currentTarget.value })} value={form.coffeeId}>
            {coffees.map((coffee) => (
              <option key={coffee.id} value={coffee.id}>
                {coffee.name} / {coffee.alias}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-black">
          本次判定
          <select className="mt-1 w-full rounded-[1rem] border-2 border-[#d7b7a2] bg-[#fffaf0] px-3 py-2.5 text-sm font-black text-[#4a2e28] outline-none transition focus:border-[#d48b9a]" onChange={(event) => onFormChange({ ...form, verdict: event.currentTarget.value as CoffeeReview["verdict"] })} value={form.verdict}>
            <option value="夯">夯：愿意复购</option>
            <option value="稳">稳：不会出错</option>
            <option value="待观察">待观察：看当天</option>
            <option value="拉">拉：下次慎点</option>
          </select>
        </label>
      </div>

      <label className="mt-4 block text-sm font-black">
        评论
        <textarea className="mt-1 min-h-28 w-full resize-none rounded-[1rem] border-2 border-[#d7b7a2] bg-[#fffaf0] px-3 py-3 text-sm font-bold leading-6 text-[#4a2e28] outline-none transition placeholder:text-[#a27a64]/80 focus:border-[#d48b9a]" onChange={(event) => onFormChange({ ...form, note: event.currentTarget.value })} placeholder="今天这杯是夯还是拉？甜度、咖啡感、踩雷点都可以写在这里。" value={form.note} />
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
        <button className="rounded-[1rem] border-2 border-[#5b3a30] bg-[#ffb9c8] px-5 py-3 text-sm font-black text-[#5b3a30] shadow-[4px_4px_0_rgba(91,58,48,0.14)] transition hover:-translate-y-0.5 hover:bg-[#ffc6d2]" type="submit">
          记入排名
        </button>
      </div>
    </form>
  );
}

export function CoffeeRankingsPage() {
  const [coffees, setCoffees] = useState<CoffeeItem[]>(initialCoffees);
  const rankedCoffees = useMemo(() => [...coffees].sort((a, b) => b.score - a.score), [coffees]);
  const [activeCoffeeId, setActiveCoffeeId] = useState(initialCoffees[0].id);
  const [form, setForm] = useState<ReviewFormState>({ coffeeId: initialCoffees[0].id, note: "", photoUrl: "", verdict: "夯" });
  const activeCoffee = rankedCoffees.find((coffee) => coffee.id === activeCoffeeId) ?? rankedCoffees[0];
  const totalReviews = coffees.reduce((total, coffee) => total + coffee.reviews.length, 0);
  const hottestCoffee = rankedCoffees[0];

  function handlePhotoSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) return;

    setForm((currentForm) => ({ ...currentForm, photoUrl: URL.createObjectURL(file) }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedNote = form.note.trim();
    if (!trimmedNote) return;

    const review: CoffeeReview = {
      id: createReviewId(),
      author: "我本人",
      date: getCurrentDateLabel(),
      note: trimmedNote,
      photoUrl: form.photoUrl || undefined,
      verdict: form.verdict,
    };

    setCoffees((currentCoffees) =>
      currentCoffees.map((coffee) =>
        coffee.id === form.coffeeId
          ? {
              ...coffee,
              score: Math.max(0, Math.min(100, coffee.score + getVerdictDelta(form.verdict))),
              reviews: [review, ...coffee.reviews],
            }
          : coffee,
      ),
    );
    setActiveCoffeeId(form.coffeeId);
    setForm((currentForm) => ({ ...currentForm, note: "", photoUrl: "" }));
    event.currentTarget.reset();
  }

  return (
    <main className="album-page-scrollbar h-dvh overflow-y-auto bg-[#fff8e6] text-[#4a2e28] [background-image:radial-gradient(circle_at_12%_18%,rgba(255,199,211,0.28)_0_80px,transparent_81px),radial-gradient(circle_at_88%_72%,rgba(190,233,221,0.36)_0_120px,transparent_121px),linear-gradient(90deg,rgba(121,76,55,0.04)_1px,transparent_1px),linear-gradient(rgba(121,76,55,0.035)_1px,transparent_1px)] [background-size:auto,auto,42px_42px,42px_42px]">
      <ContentTabsHeader activeTab="coffee" />

      <section className="relative mx-auto max-w-[1280px] px-4 pb-12 pt-8 sm:px-6">
        <div aria-hidden="true" className="absolute right-10 top-56 hidden h-22 w-22 rotate-[12deg] rounded-full border-[2.5px] border-[#5b3a30]/35 bg-[#bee9dd]/55 lg:block" />

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

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.3fr]">
          <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start" aria-label="咖啡排名榜">
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
            <ReviewComposer coffees={rankedCoffees} form={form} onFormChange={setForm} onPhotoSelect={handlePhotoSelect} onSubmit={handleSubmit} />
          </aside>

          <section className="space-y-6" aria-label="咖啡详情与评价记录">
            <article className="overflow-hidden rounded-[1.65rem] border-[2px] border-[#5b3a30] bg-[#fffdf2] shadow-[8px_8px_0_rgba(91,58,48,0.1)]">
              <div className="grid min-h-[24rem] lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-[21rem] overflow-hidden border-b-[2.5px] border-[#5b3a30] bg-[#fffaf0] lg:border-b-0 lg:border-r-[2.5px]">
                  <CoffeePhoto coffee={activeCoffee} photoUrl={activeCoffee.reviews.find((review) => review.photoUrl)?.photoUrl} />
                  <div className="absolute left-4 top-4 rotate-[-2deg] rounded-full border-2 border-[#5b3a30] bg-[#ffb9c8] px-4 py-2 text-sm font-black text-[#6a3c34] shadow-[3px_3px_0_rgba(91,58,48,0.12)]">
                    #{rankedCoffees.findIndex((coffee) => coffee.id === activeCoffee.id) + 1} / {activeCoffee.rankLabel}
                  </div>
                </div>
                <div className="p-5 sm:p-7">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b56f72]">selected cup</p>
                  <h2 className="mt-2 text-[1.9rem] font-black leading-tight tracking-tight text-[#4a2e28] [text-shadow:1px_1px_0_#fff7df] sm:text-[2.55rem]">
                    {activeCoffee.name}
                  </h2>
                  <p className="mt-3 inline-flex rounded-full border-2 border-[#5b3a30] bg-[#ffe8a8] px-3 py-1 text-xs font-black text-[#6a3c34] shadow-[2px_2px_0_rgba(91,58,48,0.08)]">{activeCoffee.temperature}</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-[0.72fr_1fr]">
                    <div className="rounded-[1.2rem] border-2 border-[#5b3a30] bg-[#fffaf0] p-4 shadow-[3px_3px_0_rgba(91,58,48,0.08)]">
                      <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#b56f72]">score</p>
                      <p className="mt-1 text-5xl font-black leading-none text-[#d67a8f]">{activeCoffee.score.toFixed(0)}</p>
                    </div>
                    <div className="rounded-[1.2rem] border-2 border-[#5b3a30] bg-[#fffaf0] p-4 shadow-[3px_3px_0_rgba(91,58,48,0.08)]">
                      <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#b56f72]">why</p>
                      <p className="mt-2 text-sm font-bold leading-7 text-[#765247]">{activeCoffee.flavor}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-[1.2rem] border-2 border-[#5b3a30] bg-[#fff1f4] p-4 shadow-[3px_3px_0_rgba(91,58,48,0.08)]">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#b56f72]">小提醒</p>
                    <p className="mt-2 text-sm font-black leading-7 text-[#765247]">{activeCoffee.warning}</p>
                  </div>
                </div>
              </div>
            </article>

            <div className="rounded-[1.45rem] border-[2px] border-[#5b3a30] bg-[#fffdf2]/94 p-4 shadow-[8px_8px_0_rgba(91,58,48,0.1)] sm:p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b56f72]">review wall</p>
                  <h2 className="text-xl font-black tracking-tight text-[#4a2e28]">{activeCoffee.name} 的多次评价</h2>
                </div>
                <span className="rounded-full border-2 border-[#5b3a30] bg-[#ffe8a8] px-3 py-1 text-xs font-black text-[#765247] shadow-[2px_2px_0_rgba(91,58,48,0.08)]">{activeCoffee.reviews.length} 条记录</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {activeCoffee.reviews.map((review, index) => (
                  <article className={`overflow-hidden rounded-[1.15rem] border-[2px] border-[#5b3a30] bg-[#fffaf0] shadow-[5px_5px_0_rgba(91,58,48,0.1)] ${index % 2 === 0 ? "rotate-[-0.35deg]" : "rotate-[0.35deg]"}`} key={review.id}>
                    <div className="h-42 border-b-[2.5px] border-[#5b3a30]">
                      <CoffeePhoto coffee={activeCoffee} photoUrl={review.photoUrl} />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#b56f72]">{review.date}</p>
                          <p className="mt-1 text-sm font-black text-[#4a2e28]">{review.author}</p>
                        </div>
                        <span className={`rounded-full border-2 px-3 py-1 text-xs font-black shadow-[2px_2px_0_rgba(91,58,48,0.08)] ${verdictStyle[review.verdict]}`}>{review.verdict}</span>
                      </div>
                      <p className="mt-3 text-sm font-bold leading-7 text-[#765247]">{review.note}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
