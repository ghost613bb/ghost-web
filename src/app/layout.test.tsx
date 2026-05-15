import { describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/data/site";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "geist-sans" }),
  Geist_Mono: () => ({ variable: "geist-mono" }),
}));

const { metadata } = await import("./layout");

describe("root layout metadata", () => {
  it("uses personal site metadata", () => {
    expect(metadata.title).toEqual({
      default: siteConfig.name,
      template: `%s · ${siteConfig.name}`,
    });
    expect(metadata.description).toBe(siteConfig.description);
  });
});
