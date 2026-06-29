import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const coffeeServiceState = vi.hoisted(() => ({
  createCoffeeReview: vi.fn(async (input) => ({
    coffee: { id: "coffee-1", name: input.coffeeName, reviews: [], score: input.score },
    coffees: [{ id: "coffee-1", name: input.coffeeName, reviews: [], score: input.score }],
    review: { id: "review-1", note: input.why, photoUrl: input.photoUrl, verdict: input.verdict },
  })),
}));

const storageState = vi.hoisted(() => ({
  uploadStorageObject: vi.fn(async ({ objectPath, scope }) => ({
    objectPath,
    provider: "supabase",
    scope,
    url: `https://cdn.example.com/${objectPath}`,
  })),
}));

vi.mock("@/features/coffee/service", () => ({
  createCoffeeReview: coffeeServiceState.createCoffeeReview,
}));

vi.mock("@/features/storage/service", () => ({
  uploadStorageObject: storageState.uploadStorageObject,
}));

function buildFormRequest(formData: FormData, token = "test-token") {
  return new Request("http://localhost/api/coffee/reviews", {
    body: formData,
    headers: new Headers({ "x-playlist-import-token": token }),
    method: "POST",
  });
}

function buildValidFormData() {
  const formData = new FormData();
  formData.set("coffeeName", "生椰拿铁");
  formData.set("score", "98");
  formData.set("temperature", "冰 / 少糖");
  formData.set("verdict", "夯");
  formData.set("why", "椰香很厚。");
  formData.set("reminder", "下午三点后慎点");

  return formData;
}

describe("/api/coffee/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PLAYLIST_IMPORT_ADMIN_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects requests without admin token", async () => {
    const response = await POST(buildFormRequest(buildValidFormData(), ""));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "无权限记录咖啡评价" });
  });

  it("creates a coffee review", async () => {
    const response = await POST(buildFormRequest(buildValidFormData()));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.coffee).toMatchObject({ name: "生椰拿铁", score: 98 });
    expect(coffeeServiceState.createCoffeeReview).toHaveBeenCalledWith(
      expect.objectContaining({
        coffeeName: "生椰拿铁",
        score: 98,
        verdict: "夯",
        why: "椰香很厚。",
      }),
    );
  });

  it("uploads an optional coffee photo", async () => {
    const formData = buildValidFormData();
    formData.set("photoFile", new Blob(["png"], { type: "image/png" }), "coffee.png");

    const response = await POST(buildFormRequest(formData));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(storageState.uploadStorageObject).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: "image/png",
        objectPath: expect.stringMatching(/^reviews\/review-.*\/blob$/),
        scope: "coffee",
      }),
    );
    expect(data.review.photoUrl).toMatch(/^https:\/\/cdn\.example\.com\/reviews\/review-/);
  });
});
