import { describe, expect, it } from "vitest";
import { buildSupabaseImageTransformUrl } from "./supabaseImageTransforms";

describe("buildSupabaseImageTransformUrl", () => {
  it("builds a Supabase render image URL from a public object URL", () => {
    expect(
      buildSupabaseImageTransformUrl("https://example.supabase.co/storage/v1/object/public/album-assets/album-001/cover/raw.png", {
        quality: 72,
        width: 480,
      }),
    ).toBe("https://example.supabase.co/storage/v1/render/image/public/album-assets/album-001/cover/raw.png?width=480&quality=72");
  });

  it("keeps existing query parameters and appends transform options", () => {
    expect(
      buildSupabaseImageTransformUrl("https://example.supabase.co/storage/v1/object/public/album-assets/raw.png?download=1", {
        quality: 82,
        width: 1600,
      }),
    ).toBe("https://example.supabase.co/storage/v1/render/image/public/album-assets/raw.png?download=1&width=1600&quality=82");
  });

  it("returns null for non Supabase public object URLs", () => {
    expect(buildSupabaseImageTransformUrl("/uploads/albums/raw.png", { quality: 72, width: 480 })).toBeNull();
  });
});
