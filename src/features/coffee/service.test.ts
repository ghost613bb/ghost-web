import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCoffeeReview, getCoffeePageData } from "./service";
import { resetStoredCoffeeData } from "./repository";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServiceRoleClient: vi.fn(),
  hasSupabaseServiceRoleEnv: vi.fn(() => true),
}));

describe("coffee service", () => {
  beforeEach(async () => {
    await resetStoredCoffeeData();
    vi.setSystemTime(new Date("2026-06-29T09:30:00.000Z"));
  });

  it("falls back to static coffee data when store is empty", async () => {
    const data = await getCoffeePageData();

    expect(data.dataSource).toBe("static");
    expect(data.coffees[0].name).toBe("生椰拿铁");
  });

  it("creates a new coffee from a review submission", async () => {
    const result = await createCoffeeReview({
      coffeeName: "冷萃拿铁",
      reminder: "晚上别点",
      score: 88,
      temperature: "冰 / 无糖",
      verdict: "稳",
      why: "咖啡感很干净。",
    });

    expect(result.coffee).toMatchObject({
      flavor: "咖啡感很干净。",
      name: "冷萃拿铁",
      score: 88,
      temperature: "冰 / 无糖",
      warning: "晚上别点",
    });
    expect(result.review).toMatchObject({ note: "咖啡感很干净。", verdict: "稳" });
    expect(result.coffees.some((coffee) => coffee.name === "冷萃拿铁")).toBe(true);
  });

  it("updates a static coffee when submitting the same name", async () => {
    const result = await createCoffeeReview({
      coffeeName: "生椰拿铁",
      reminder: "午后慎重",
      score: 99,
      temperature: "冰 / 少糖",
      verdict: "夯",
      why: "今天这杯特别稳。",
    });

    expect(result.coffee.id).toBe("coconut-latte");
    expect(result.coffee.score).toBe(99);
    expect(result.coffee.flavor).toBe("今天这杯特别稳。");
    expect(result.coffee.warning).toBe("午后慎重");
    expect(result.coffee.reviews[0]).toMatchObject({ note: "今天这杯特别稳。", score: 99 });
  });
});
