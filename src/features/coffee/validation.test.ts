import { describe, expect, it } from "vitest";
import { assertCoffeePhotoFile, parseCreateCoffeeReview } from "./validation";

describe("coffee validation", () => {
  it("parses a valid coffee review payload", () => {
    expect(
      parseCreateCoffeeReview({
        coffeeName: " 生椰拿铁 ",
        reminder: " 下午三点后别喝 ",
        score: "98",
        temperature: " 冰 / 少糖 ",
        verdict: "夯",
        why: " 椰香很厚 ",
      }),
    ).toEqual({
      coffeeId: undefined,
      coffeeName: "生椰拿铁",
      photoUrl: undefined,
      reminder: "下午三点后别喝",
      score: 98,
      temperature: "冰 / 少糖",
      verdict: "夯",
      why: "椰香很厚",
    });
  });

  it("rejects invalid score and verdict", () => {
    expect(() =>
      parseCreateCoffeeReview({
        coffeeName: "生椰拿铁",
        score: "101",
        verdict: "很好",
        why: "椰香很厚",
      }),
    ).toThrow("评分必须在 0-100 之间");

    expect(() =>
      parseCreateCoffeeReview({
        coffeeName: "生椰拿铁",
        score: "98",
        verdict: "很好",
        why: "椰香很厚",
      }),
    ).toThrow("本次判定不合法");
  });

  it("rejects empty required fields", () => {
    expect(() => parseCreateCoffeeReview({ coffeeName: "", score: "98", verdict: "夯", why: "椰香很厚" })).toThrow("请先填写咖啡名称");
    expect(() => parseCreateCoffeeReview({ coffeeName: "生椰拿铁", score: "98", verdict: "夯", why: "" })).toThrow("请输入 why");
  });

  it("validates coffee photo files", () => {
    expect(() => assertCoffeePhotoFile(new File(["png"], "coffee.png", { type: "image/png" }))).not.toThrow();
    expect(() => assertCoffeePhotoFile(new File(["gif"], "coffee.gif", { type: "image/gif" }))).toThrow("咖啡照片仅支持 JPG、PNG 或 WebP");
  });
});
