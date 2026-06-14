import { beforeEach, describe, expect, it } from "vitest";
import { thoughts } from "@/data/thoughts";
import { resetStoredThoughts, upsertStoredThought } from "./repository";
import { createThought, deleteThought, getLatestThought, getThoughtBySlug, listThoughts } from "./service";

describe("thoughts service", () => {
  beforeEach(async () => {
    await resetStoredThoughts();
  });

  it("falls back to local thoughts when storage is empty", async () => {
    await expect(listThoughts()).resolves.toEqual(thoughts);
  });

  it("returns the latest stored thought before fallback thoughts when storage has data", async () => {
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

    await expect(getLatestThought()).resolves.toEqual(
      expect.objectContaining({
        id: "thought-db-001",
        title: "数据库里的碎碎念",
        slug: "thought-in-db",
        body: "这条内容来自数据库，不再直接依赖本地数组。",
        bodyText: "这条内容来自数据库，不再直接依赖本地数组。",
        tags: ["数据库", "最小闭环"],
        visibility: "public",
        status: "published",
        createdAt: "2026-05-25",
        publishedAt: "2026-05-25",
        pinned: false,
        sortOrder: 1,
      }),
    );
    await expect(listThoughts()).resolves.toHaveLength(thoughts.length + 1);
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

    const storedThoughts = await listThoughts();
    expect(storedThoughts).toContainEqual(
      expect.objectContaining({
        id: "thought-db-002",
        title: "新写入的碎碎念",
        slug: "new-thought",
        body: "先把最小写入链路跑通。",
        bodyText: "先把最小写入链路跑通。",
        tags: ["写入", "service"],
        visibility: "public",
        status: "published",
        createdAt: "2026-05-26",
        publishedAt: "2026-05-26",
        pinned: false,
        sortOrder: 2,
      }),
    );
    expect(storedThoughts).toHaveLength(thoughts.length + 1);
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
      paperBackgroundImageUrl: "/thought-backgrounds/candy-waves.jpg",
      paperBackgroundOpacity: 45,
    });

    await expect(getThoughtBySlug("detail-thought")).resolves.toEqual(
      expect.objectContaining({
        id: "thought-db-003",
        title: "详情页里的碎碎念",
        slug: "detail-thought",
        body: "详情页应该能拿到完整正文。",
        bodyText: "详情页应该能拿到完整正文。",
        tags: ["详情页"],
        visibility: "public",
        status: "published",
        createdAt: "2026-05-27",
        publishedAt: "2026-05-27",
        pinned: false,
        sortOrder: 3,
        paperBackgroundImageUrl: "/thought-backgrounds/candy-waves.jpg",
        paperBackgroundOpacity: 45,
      }),
    );
  });

  it("falls back to local thoughts when getting a thought by slug", async () => {
    await expect(getThoughtBySlug("glowing-town")).resolves.toEqual(thoughts[0]);
  });

  it("returns null when no thought matches the slug", async () => {
    await expect(getThoughtBySlug("missing-thought")).resolves.toBeNull();
  });

  it("overrides a fallback thought with a stored thought using the same id", async () => {
    await upsertStoredThought({
      ...thoughts[0],
      body: "编辑后的本地碎碎念。",
      title: "编辑后的标题",
    });

    const nextThoughts = await listThoughts();

    expect(nextThoughts).toContainEqual(
      expect.objectContaining({
        ...thoughts[0],
        body: "编辑后的本地碎碎念。",
        bodyText: "编辑后的本地碎碎念。",
        title: "编辑后的标题",
      }),
    );
    expect(nextThoughts.filter((thought) => thought.id === thoughts[0].id)).toHaveLength(1);
    expect(nextThoughts).toHaveLength(thoughts.length);
  });

  it("deletes a stored thought", async () => {
    await createThought({
      id: "thought-db-delete",
      title: "待删除碎碎念",
      slug: "delete-stored-thought",
      body: "这条内容会被删除。",
      tags: ["删除"],
      visibility: "public",
      status: "published",
      createdAt: "2026-05-28",
      sortOrder: 4,
    });

    await expect(deleteThought("thought-db-delete")).resolves.toBe(true);
    expect((await listThoughts()).some((thought) => thought.id === "thought-db-delete")).toBe(false);
  });

  it("hides a fallback thought through delete without hiding other fallback thoughts", async () => {
    await expect(deleteThought(thoughts[0].id)).resolves.toBe(true);

    const nextThoughts = await listThoughts();

    expect(nextThoughts.some((thought) => thought.id === thoughts[0].id)).toBe(false);
    expect(nextThoughts.some((thought) => thought.id === thoughts[1].id)).toBe(true);
    await expect(getThoughtBySlug(thoughts[0].slug)).resolves.toBeNull();
  });

  it("returns false when deleting a missing thought", async () => {
    await expect(deleteThought("missing-thought")).resolves.toBe(false);
  });
});
