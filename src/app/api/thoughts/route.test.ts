import { beforeEach, describe, expect, it } from "vitest";
import { thoughts } from "@/data/thoughts";
import { resetStoredThoughts, upsertStoredThought } from "@/features/thoughts/repository";
import { GET } from "./route";

describe("/api/thoughts", () => {
  beforeEach(async () => {
    await resetStoredThoughts();
  });

  it("returns fallback thought data when storage is empty", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      thoughts,
    });
  });

  it("returns stored thought data when storage has records", async () => {
    await upsertStoredThought({
      id: "thought-db-001",
      title: "数据库里的碎碎念",
      slug: "thought-in-db",
      description: "先用一条真实数据打通接口读取。",
      body: "这条内容来自数据库接口返回。",
      tags: ["数据库", "接口"],
      visibility: "public",
      status: "published",
      createdAt: "2026-05-26",
      sortOrder: 1,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      thoughts: [
        {
          id: "thought-db-001",
          title: "数据库里的碎碎念",
          slug: "thought-in-db",
          description: "先用一条真实数据打通接口读取。",
          body: "这条内容来自数据库接口返回。",
          tags: ["数据库", "接口"],
          visibility: "public",
          status: "published",
          createdAt: "2026-05-26",
          sortOrder: 1,
        },
      ],
    });
  });
});
