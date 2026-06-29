import type { CoffeeItem, CoffeeReview, CoffeeVerdict, SelectOption } from "./types";

export const defaultCoffeeGradient = "from-[#fff7d8] via-[#ffd7e0] to-[#d7f2ec]";

export const verdictOptions: SelectOption<CoffeeVerdict>[] = [
  { label: "夯：愿意复购", value: "夯" },
  { label: "稳：不会出错", value: "稳" },
  { label: "待观察：看当天", value: "待观察" },
  { label: "拉：下次慎点", value: "拉" },
];

export const verdictStyle: Record<CoffeeVerdict, string> = {
  夯: "border-[#5b3a30] bg-[#ffb9c8] text-[#5b3a30]",
  稳: "border-[#5b3a30] bg-[#ffe8a8] text-[#5b3a30]",
  待观察: "border-[#5b3a30] bg-[#bee9dd] text-[#36584f]",
  拉: "border-[#5b3a30] bg-[#d9c1ad] text-[#5b3a30]",
};

export const initialCoffees: CoffeeItem[] = [
  {
    id: "coconut-latte",
    name: "生椰拿铁",
    score: 98,
    temperature: "冰 / 少糖",
    flavor: "椰香很厚，咖啡感不怂，像把人从工位上拎起来重启。",
    warning: "下午三点后喝会把夜晚变成第二个白天。",
    reviews: [
      {
        id: "review-coconut-1",
        date: "06.25 10:18",
        note: "今天的椰香在线，入口像一口奶油色电池，精神条直接回满。",
        verdict: "夯",
      },
      {
        id: "review-coconut-2",
        date: "06.27 14:06",
        note: "加冰之后甜度刚好，适合周会前强行恢复人类语言能力。",
        verdict: "夯",
      },
    ],
  },
  {
    id: "raw-coconut-americano",
    name: "生椰美式",
    score: 91,
    temperature: "冰 / 无糖 / 不许摇太散",
    flavor: "前调清爽，后调有一点椰子水的甜，适合需要理智但不想受苦的时候。",
    warning: "状态差时会觉得它太直给。",
    reviews: [
      {
        id: "review-americano-1",
        date: "06.20 09:47",
        note: "像给脑子开了一扇窗，适合早上第一杯。",
        verdict: "稳",
      },
    ],
  },
  {
    id: "cheese-latte",
    name: "厚乳拿铁",
    score: 86,
    temperature: "热 / 半糖 / 加班备用",
    flavor: "奶感很厚，咖啡被包住了，像穿毛衣的工作日。",
    warning: "连喝两天会腻，需要美式解围。",
    reviews: [
      {
        id: "review-cheese-1",
        date: "06.18 19:32",
        note: "夜里写东西时很安慰，但没有生椰那种上头感。",
        verdict: "稳",
      },
    ],
  },
  {
    id: "orange-americano",
    name: "橙C美式",
    score: 73,
    temperature: "冰 / 默认糖 / 只在想换口味时点",
    flavor: "果酸很亮，咖啡存在感被橙子推到墙角，快乐但不够日常。",
    warning: "空腹喝像把胃交给随机数。",
    reviews: [
      {
        id: "review-orange-1",
        date: "06.13 16:45",
        note: "第一口很开心，第八口开始想念正常咖啡。",
        verdict: "待观察",
      },
    ],
  },
  {
    id: "brown-sugar-latte",
    name: "黑糖拿铁",
    score: 58,
    temperature: "冰 / 少糖也甜 / 慎点",
    flavor: "黑糖香很抢，像喝了一杯披着咖啡外套的甜品。",
    warning: "需要强咖啡因时不要被它骗。",
    reviews: [
      {
        id: "review-brown-1",
        date: "06.11 12:24",
        note: "不是难喝，是它不承担咖啡应该承担的责任。",
        verdict: "拉",
      },
    ],
  },
];

export function cloneInitialCoffees(): CoffeeItem[] {
  return initialCoffees.map((coffee) => ({
    ...coffee,
    reviews: coffee.reviews.map((review: CoffeeReview) => ({ ...review })),
  }));
}
