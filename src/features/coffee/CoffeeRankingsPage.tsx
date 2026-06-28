"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, Flame, ImagePlus, MessageSquareText, Plus, Trophy, Zap } from "lucide-react";
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
    gradient: "from-[#fff3c7] via-[#f2d38b] to-[#7c4b27]",
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
    gradient: "from-[#dff7ef] via-[#9ed9c6] to-[#1f6b5a]",
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
    gradient: "from-[#fff9e7] via-[#f1c987] to-[#b56a31]",
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
    gradient: "from-[#ffe1ae] via-[#ff9f45] to-[#9f3a1d]",
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
    gradient: "from-[#f2d7b0] via-[#9b5a33] to-[#2a1610]",
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
  夯: "bg-[#ff4f2e] text-[#fff8de] shadow-[0_0_22px_rgba(255,79,46,0.42)]",
  稳: "bg-[#f3c447] text-[#2b160b]",
  待观察: "bg-[#8fd6c3] text-[#102d25]",
  拉: "bg-[#34201a] text-[#ffe6b0]",
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
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgba(255,255,255,0.72)_0_9%,transparent_10%),radial-gradient(circle_at_70%_78%,rgba(255,255,255,0.22)_0_18%,transparent_19%)]" />
      <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-b-[2.2rem] rounded-t-[0.85rem] border-[3px] border-[#2d1a12]/75 bg-white/35 shadow-[inset_0_-20px_0_rgba(45,26,18,0.18)]" />
      <div aria-hidden="true" className="absolute left-[58%] top-[44%] h-10 w-10 rounded-full border-[3px] border-[#2d1a12]/65" />
      <span className="absolute bottom-4 left-4 rounded-full bg-[#2d1a12]/82 px-3 py-1 text-[0.7rem] font-black uppercase tracking-[0.12em] text-[#fff4ce]">No Photo</span>
    </div>
  );
}

function CoffeeRankCard({ coffee, index, isActive, onSelect }: { coffee: CoffeeItem; index: number; isActive: boolean; onSelect: (coffeeId: string) => void }) {
  const latestReview = coffee.reviews[0];

  return (
    <button
      aria-pressed={isActive}
      className={`group relative w-full overflow-hidden rounded-[1.45rem] border-[2.5px] p-4 text-left transition duration-300 ${
        isActive
          ? "-translate-y-1 border-[#2a1710] bg-[#fff7df] shadow-[9px_9px_0_rgba(42,23,16,0.2)]"
          : "border-[#2a1710]/55 bg-[#fff1bf]/72 shadow-[4px_4px_0_rgba(42,23,16,0.09)] hover:-translate-y-0.5 hover:border-[#2a1710]"
      }`}
      onClick={() => onSelect(coffee.id)}
      type="button"
    >
      <div aria-hidden="true" className={`absolute inset-y-0 right-0 w-24 bg-gradient-to-br ${coffee.gradient} opacity-50 transition group-hover:opacity-70`} />
      <div className="relative flex items-start gap-3">
        <span className="grid h-13 w-13 shrink-0 place-items-center rounded-[1rem] border-[2.5px] border-[#2a1710] bg-[#ff4f2e] text-2xl font-black text-[#fff8de] shadow-[4px_4px_0_rgba(42,23,16,0.18)]">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[1.35rem] font-black leading-none tracking-tight text-[#2a1710]">{coffee.name}</h2>
            <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-black ${verdictStyle[latestReview.verdict]}`}>{coffee.rankLabel}</span>
          </div>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-[#8b4d25]">{coffee.alias}</p>
          <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-[#654034]">{latestReview.note}</p>
        </div>
        <div className="relative z-10 text-right">
          <p className="text-[2rem] font-black leading-none text-[#2a1710]">{coffee.score.toFixed(0)}</p>
          <p className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-[#8b4d25]">points</p>
        </div>
      </div>
    </button>
  );
}

function ReviewComposer({ coffees, form, onFormChange, onPhotoSelect, onSubmit }: { coffees: CoffeeItem[]; form: ReviewFormState; onFormChange: (form: ReviewFormState) => void; onPhotoSelect: (event: ChangeEvent<HTMLInputElement>) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="rounded-[1.6rem] border-[2.5px] border-[#2a1710] bg-[#2a1710] p-4 text-[#fff4ce] shadow-[10px_10px_0_rgba(255,79,46,0.24)] sm:p-5" onSubmit={onSubmit}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffb54d]">new log</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight">再审一杯</h2>
        </div>
        <Plus aria-hidden="true" className="h-7 w-7 text-[#ff4f2e]" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1.1fr_0.85fr]">
        <label className="space-y-1 text-sm font-black">
          选择咖啡
          <select className="mt-1 w-full rounded-[1rem] border-2 border-[#8a5b40] bg-[#fff4ce] px-3 py-2.5 text-sm font-black text-[#2a1710] outline-none transition focus:border-[#ff4f2e]" onChange={(event) => onFormChange({ ...form, coffeeId: event.currentTarget.value })} value={form.coffeeId}>
            {coffees.map((coffee) => (
              <option key={coffee.id} value={coffee.id}>
                {coffee.name} / {coffee.alias}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-black">
          本次判定
          <select className="mt-1 w-full rounded-[1rem] border-2 border-[#8a5b40] bg-[#fff4ce] px-3 py-2.5 text-sm font-black text-[#2a1710] outline-none transition focus:border-[#ff4f2e]" onChange={(event) => onFormChange({ ...form, verdict: event.currentTarget.value as CoffeeReview["verdict"] })} value={form.verdict}>
            <option value="夯">夯：愿意复购</option>
            <option value="稳">稳：不会出错</option>
            <option value="待观察">待观察：看当天</option>
            <option value="拉">拉：下次慎点</option>
          </select>
        </label>
      </div>

      <label className="mt-4 block text-sm font-black">
        评论
        <textarea className="mt-1 min-h-28 w-full resize-none rounded-[1rem] border-2 border-[#8a5b40] bg-[#fff4ce] px-3 py-3 text-sm font-bold leading-6 text-[#2a1710] outline-none transition placeholder:text-[#8a5b40]/70 focus:border-[#ff4f2e]" onChange={(event) => onFormChange({ ...form, note: event.currentTarget.value })} placeholder="例如：这一杯像不像今日续命燃料？甜度、咖啡感、踩雷点都写在这里。" value={form.note} />
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block rounded-[1rem] border-2 border-dashed border-[#d59158] bg-[#3a2318] px-3 py-3 text-sm font-black text-[#fff4ce] transition hover:border-[#ff4f2e]">
          <span className="flex items-center gap-2">
            <ImagePlus aria-hidden="true" className="h-4 w-4 text-[#ffb54d]" />
            上传本次照片
          </span>
          <input accept="image/*" className="sr-only" onChange={onPhotoSelect} type="file" />
          <span className="mt-1 block truncate text-xs font-semibold text-[#d7b990]">{form.photoUrl ? "已选择照片，保存后会出现在评价墙。" : "可选：先放本地预览，不打断记录手感。"}</span>
        </label>
        <button className="rounded-[1rem] border-2 border-[#2a1710] bg-[#ff4f2e] px-5 py-3 text-sm font-black text-[#fff8de] shadow-[0_5px_0_rgba(255,181,77,0.58)] transition hover:-translate-y-0.5 hover:bg-[#ff673e]" type="submit">
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
    <main className="album-page-scrollbar h-dvh overflow-y-auto bg-[#160d09] text-[#2a1710] [background-image:radial-gradient(circle_at_14%_8%,rgba(255,79,46,0.34)_0_120px,transparent_121px),radial-gradient(circle_at_86%_30%,rgba(255,181,77,0.26)_0_160px,transparent_161px),linear-gradient(135deg,rgba(255,244,206,0.05)_25%,transparent_25%,transparent_50%,rgba(255,244,206,0.05)_50%,rgba(255,244,206,0.05)_75%,transparent_75%,transparent)] [background-size:auto,auto,32px_32px]">
      <ContentTabsHeader activeTab="coffee" />

      <section className="relative mx-auto max-w-[1280px] px-4 pb-16 pt-10 sm:px-6 lg:pt-14">
        <div aria-hidden="true" className="absolute left-4 top-20 hidden h-40 w-40 rounded-full border-[22px] border-[#ff4f2e]/25 lg:block" />
        <div aria-hidden="true" className="absolute right-8 top-44 hidden h-28 w-28 rotate-12 rounded-[2rem] bg-[#ffb54d]/25 lg:block" />

        <div className="relative overflow-hidden rounded-[2rem] border-[3px] border-[#2a1710] bg-[#fff4ce] p-5 shadow-[12px_12px_0_rgba(255,79,46,0.32)] sm:p-8">
          <div aria-hidden="true" className="absolute inset-0 opacity-45 [background-image:linear-gradient(90deg,rgba(42,23,16,0.09)_1px,transparent_1px),linear-gradient(rgba(42,23,16,0.07)_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="relative grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border-2 border-[#2a1710] bg-[#ff4f2e] px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-[#fff8de] shadow-[4px_4px_0_rgba(42,23,16,0.18)]">
                <Zap aria-hidden="true" className="h-4 w-4" />
                cotti dependency board
              </p>
              <h1 className="mt-5 max-w-3xl text-[3.15rem] font-black leading-[0.9] tracking-[-0.07em] text-[#2a1710] sm:text-[5.2rem]" style={{ fontFamily: '"Arial Black", "Impact", "Hiragino Sans GB", sans-serif' }}>
                咖啡推荐
              </h1>
              <p className="mt-5 max-w-2xl text-base font-bold leading-8 text-[#654034] sm:text-lg">
                库迪咖啡私人审判台：按「夯 → 稳 → 待观察 → 拉」记录真实续命体验。每杯咖啡可以被反复评价，照片和评论会沉淀成一条越来越偏执的咖啡因证词链。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-[1.25rem] border-[2.5px] border-[#2a1710] bg-[#2a1710] p-4 text-[#fff4ce] shadow-[5px_5px_0_rgba(42,23,16,0.14)]">
                <Trophy aria-hidden="true" className="mb-3 h-6 w-6 text-[#ffb54d]" />
                <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#d7b990]">top one</p>
                <p className="mt-1 text-xl font-black">{hottestCoffee.name}</p>
              </div>
              <div className="rounded-[1.25rem] border-[2.5px] border-[#2a1710] bg-[#ffb54d] p-4 shadow-[5px_5px_0_rgba(42,23,16,0.14)]">
                <MessageSquareText aria-hidden="true" className="mb-3 h-6 w-6" />
                <p className="text-[0.68rem] font-black uppercase tracking-[0.18em]">reviews</p>
                <p className="mt-1 text-3xl font-black">{totalReviews}</p>
              </div>
              <div className="rounded-[1.25rem] border-[2.5px] border-[#2a1710] bg-[#ff4f2e] p-4 text-[#fff8de] shadow-[5px_5px_0_rgba(42,23,16,0.14)]">
                <Flame aria-hidden="true" className="mb-3 h-6 w-6" />
                <p className="text-[0.68rem] font-black uppercase tracking-[0.18em]">scale</p>
                <p className="mt-1 text-xl font-black">夯到拉</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
          <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start" aria-label="咖啡排名榜">
            <div className="rounded-[1.7rem] border-[2.5px] border-[#2a1710] bg-[#f6dfaa] p-4 shadow-[10px_10px_0_rgba(42,23,16,0.22)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8b4d25]">ranking</p>
                  <h2 className="text-2xl font-black tracking-tight">夯拉排行榜</h2>
                </div>
                <span className="rounded-full border-2 border-[#2a1710] bg-[#fff4ce] px-3 py-1 text-xs font-black">实时按分排序</span>
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
            <article className="overflow-hidden rounded-[2rem] border-[3px] border-[#2a1710] bg-[#fff4ce] shadow-[12px_12px_0_rgba(255,181,77,0.2)]">
              <div className="grid min-h-[24rem] lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-[21rem] overflow-hidden border-b-[3px] border-[#2a1710] lg:border-b-0 lg:border-r-[3px]">
                  <CoffeePhoto coffee={activeCoffee} photoUrl={activeCoffee.reviews.find((review) => review.photoUrl)?.photoUrl} />
                  <div className="absolute left-4 top-4 rounded-full border-2 border-[#2a1710] bg-[#ff4f2e] px-4 py-2 text-sm font-black text-[#fff8de] shadow-[4px_4px_0_rgba(42,23,16,0.18)]">
                    #{rankedCoffees.findIndex((coffee) => coffee.id === activeCoffee.id) + 1} / {activeCoffee.rankLabel}
                  </div>
                </div>
                <div className="p-5 sm:p-7">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8b4d25]">selected cup</p>
                  <h2 className="mt-2 text-[2.55rem] font-black leading-none tracking-[-0.05em] text-[#2a1710] sm:text-[4rem]" style={{ fontFamily: '"Arial Black", "Impact", "Hiragino Sans GB", sans-serif' }}>
                    {activeCoffee.name}
                  </h2>
                  <p className="mt-3 inline-flex rounded-full border-2 border-[#2a1710] bg-[#ffb54d] px-3 py-1 text-sm font-black">{activeCoffee.temperature}</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-[0.75fr_1fr]">
                    <div className="rounded-[1.2rem] border-2 border-[#2a1710] bg-[#2a1710] p-4 text-[#fff4ce]">
                      <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#d7b990]">score</p>
                      <p className="mt-1 text-6xl font-black leading-none text-[#ffb54d]">{activeCoffee.score.toFixed(0)}</p>
                    </div>
                    <div className="rounded-[1.2rem] border-2 border-[#2a1710] bg-[#fffaf0] p-4">
                      <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8b4d25]">why</p>
                      <p className="mt-2 text-sm font-bold leading-7 text-[#5e3b2f]">{activeCoffee.flavor}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-[1.2rem] border-2 border-[#2a1710] bg-[#ffe2d8] p-4">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8b4d25]">risk memo</p>
                    <p className="mt-2 text-sm font-black leading-7 text-[#5e2e24]">{activeCoffee.warning}</p>
                  </div>
                </div>
              </div>
            </article>

            <div className="rounded-[1.7rem] border-[2.5px] border-[#2a1710] bg-[#f6dfaa] p-4 shadow-[10px_10px_0_rgba(42,23,16,0.18)] sm:p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8b4d25]">review wall</p>
                  <h2 className="text-2xl font-black tracking-tight">{activeCoffee.name} 的多次评价</h2>
                </div>
                <span className="rounded-full border-2 border-[#2a1710] bg-[#fff4ce] px-3 py-1 text-xs font-black">{activeCoffee.reviews.length} 条记录</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {activeCoffee.reviews.map((review) => (
                  <article className="overflow-hidden rounded-[1.35rem] border-[2.5px] border-[#2a1710] bg-[#fffaf0] shadow-[5px_5px_0_rgba(42,23,16,0.12)]" key={review.id}>
                    <div className="h-42 border-b-[2.5px] border-[#2a1710]">
                      <CoffeePhoto coffee={activeCoffee} photoUrl={review.photoUrl} />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8b4d25]">{review.date}</p>
                          <p className="mt-1 text-sm font-black text-[#2a1710]">{review.author}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${verdictStyle[review.verdict]}`}>{review.verdict}</span>
                      </div>
                      <p className="mt-3 text-sm font-bold leading-7 text-[#5e3b2f]">{review.note}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {["夯：复购优先级拉满", "稳：工作日安全牌", "拉：记录下来避免重蹈覆辙"].map((label) => (
                <div className="rounded-[1.25rem] border-[2.5px] border-[#2a1710] bg-[#2a1710] p-4 text-[#fff4ce] shadow-[6px_6px_0_rgba(255,79,46,0.18)]" key={label}>
                  <Camera aria-hidden="true" className="mb-3 h-6 w-6 text-[#ffb54d]" />
                  <p className="text-sm font-black leading-6">{label}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
