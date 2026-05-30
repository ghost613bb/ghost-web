import { beforeEach, describe, expect, it } from "vitest";
import { thoughts } from "@/data/thoughts";
import { resetStoredThoughts, upsertStoredThought } from "./repository";
import { createThought, getLatestThought, getThoughtBySlug, listThoughts } from "./service";

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
      body: "这条内容来自数据库，不再直接依赖本地数组。",
      tags: ["数据库", "最小闭环"],
      visibility: "public",
      status: "published",
      createdAt: "2026-05-25",
      sortOrder: 1,
    });
  });

  it("creates a stored thought", async () => {
    await createThought({
      id: "thought-db-002",
      title: "新写入的碎碎念",
      slug: "new-thought",
      body: "先把最小写入链路跑通。",
      tags: ["写入", "service"],
      visibility: "public",
      status: "published",
      createdAt: "2026-05-26",
      sortOrder: 2,
    });

    await expect(listThoughts()).resolves.toEqual([
      {
        id: "thought-db-002",
        title: "新写入的碎碎念",
        slug: "new-thought",
        body: "先把最小写入链路跑通。",
        tags: ["写入", "service"],
        visibility: "public",
        status: "published",
        createdAt: "2026-05-26",
        sortOrder: 2,
      },
    ]);
  });

  it("gets a stored thought by slug", async () => {
    await upsertStoredThought({
      id: "thought-db-003",
      title: "详情页里的碎碎念",
      slug: "detail-thought",
      body: "详情页应该能拿到完整正文。",
      tags: ["详情页"],
      visibility: "public",
      status: "published",
      createdAt: "2026-05-27",
      sortOrder: 3,
    });

    await expect(getThoughtBySlug("detail-thought")).resolves.toEqual({
      id: "thought-db-003",
      title: "详情页里的碎碎念",
      slug: "detail-thought",
      body: "详情页应该能拿到完整正文。",
      tags: ["详情页"],
      visibility: "public",
      status: "published",
      createdAt: "2026-05-27",
      sortOrder: 3,
    });
  });

  it("falls back to local thoughts when getting a thought by slug", async () => {
    await expect(getThoughtBySlug("glowing-town")).resolves.toEqual(thoughts[0]);
  });

  it("returns null when no thought matches the slug", async () => {
    await expect(getThoughtBySlug("missing-thought")).resolves.toBeNull();
  });
});
