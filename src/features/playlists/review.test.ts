import { afterEach, describe, expect, it, vi } from "vitest";
import { generatePlaylistShortReview, normalizePlaylistShortReview } from "./review";

describe("normalizePlaylistShortReview", () => {
  it("cleans quotes, prefix, spaces, and trailing punctuation", () => {
    expect(normalizePlaylistShortReview("“短音评：夜色  轻轻落下。”")).toBe("夜色轻轻落下");
  });
});

describe("generatePlaylistShortReview", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns a generated review", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: "星光落进耳机" } }] }), {
        status: 200,
      }),
    );

    await expect(generatePlaylistShortReview({ artist: "Kui Kui", title: "予星" })).resolves.toEqual({ review: "星光落进耳机" });
  });

  it("falls back when the API key is missing", async () => {
    await expect(generatePlaylistShortReview({ artist: "小雪", title: "doll" })).resolves.toMatchObject({
      review: "小雪 的耳机片段",
      warning: expect.stringContaining("DEEPSEEK_API_KEY"),
    });
  });
});
