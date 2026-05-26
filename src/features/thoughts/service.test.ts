import { beforeEach, describe, expect, it } from "vitest";
import { thoughts } from "@/data/thoughts";
import { resetStoredThoughts, upsertStoredThought } from "./repository";
import { getLatestThought, listThoughts } from "./service";

describe("thoughts service", () => {
  beforeEach(async () => {
    await resetStoredThoughts();
  });

  it("falls back to local thoughts when storage is empty", async () => {
    await expect(listThoughts()).resolves.toEqual(thoughts);
  });

  it("returns the latest stored thought when storage has data", async () => {
    await upsertStoredThought({
      id: "thought-db-001",
      title: "数据库里的碎碎念",
      slug: "thought-in-db",
      description: "先用一条真实数据打通页面读取。",
      body: "这条内容来自数据库，不再直接依赖本地数组。",
      tags: ["数据库", "最小闭环"],
      visibility: "public",
      status: "published",
      createdAt: "2026-05-25",
      sortOrder: 1,
    });

    await expect(getLatestThought()).resolves.toEqual({
      id: "thought-db-001",
      title: "数据库里的碎碎念",
      slug: "thought-in-db",
      description: "先用一条真实数据打通页面读取。",
      body: "这条内容来自数据库，不再直接依赖本地数组。",
      tags: ["数据库", "最小闭环"],
      visibility: "public",
      status: "published",
      createdAt: "2026-05-25",
      sortOrder: 1,
    });
  });
});
