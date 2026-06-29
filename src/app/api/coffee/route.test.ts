import { describe, expect, it, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/features/coffee/service", () => ({
  getCoffeePageData: vi.fn(async () => ({
    coffees: [{ id: "coffee-1", name: "生椰拿铁", reviews: [], score: 98 }],
    dataSource: "static",
  })),
}));

describe("/api/coffee", () => {
  it("returns coffee page data", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      coffees: [{ id: "coffee-1", name: "生椰拿铁", score: 98 }],
      dataSource: "static",
    });
  });
});
