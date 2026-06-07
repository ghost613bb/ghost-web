import { beforeEach, describe, expect, it } from "vitest";
import { thoughts } from "@/data/thoughts";
import { resetStoredThoughts, upsertStoredThought } from "@/features/thoughts/repository";
import { GET, POST } from "./route";

describe("/api/thoughts", () => {
  beforeEach(async () => {
    await resetStoredThoughts();
  });

  it("returns fallback thought data when storage is empty", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.thoughts.length).toBeGreaterThan(0);
    expect(data.thoughts).toEqual(expect.arrayContaining([expect.objectContaining({ id: thoughts[0].id })]));
  });

  it("returns stored thought data merged with fallback records", async () => {
    await upsertStoredThought({
      id: "thought-db-001",
      title: "数据库里的碎碎念",
      slug: "thought-in-db",
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
    expect(data.thoughts).toContainEqual({
      id: "thought-db-001",
      title: "数据库里的碎碎念",
      slug: "thought-in-db",
      body: "这条内容来自数据库接口返回。",
      tags: ["数据库", "接口"],
      visibility: "public",
      status: "published",
      createdAt: "2026-05-26",
      sortOrder: 1,
    });
    expect(data.thoughts.length).toBeGreaterThanOrEqual(thoughts.length + 1);
  });

  it("creates a new thought", async () => {
    const response = await POST(
      new Request("http://localhost/api/thoughts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "thought-db-002",
          title: "通过接口创建的碎碎念",
          slug: "created-by-api",
          body: "先把 thoughts 的读写接口一起打通。",
          tags: ["接口", "写入"],
          visibility: "public",
          status: "published",
          createdAt: "2026-05-26",
          sortOrder: 2,
          paperBackgroundImageUrl: "/thought-backgrounds/candy-waves.jpg",
          paperBackgroundOpacity: 45,
        }),
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      thought: {
        id: "thought-db-002",
        title: "通过接口创建的碎碎念",
        slug: "created-by-api",
        body: "先把 thoughts 的读写接口一起打通。",
        tags: ["接口", "写入"],
        visibility: "public",
        status: "published",
        createdAt: "2026-05-26",
        sortOrder: 2,
        paperBackgroundImageUrl: "/thought-backgrounds/candy-waves.jpg",
        paperBackgroundOpacity: 45,
      },
    });

    const nextResponse = await GET();
    const nextData = await nextResponse.json();

    expect(nextData.thoughts).toContainEqual({
      id: "thought-db-002",
      title: "通过接口创建的碎碎念",
      slug: "created-by-api",
      body: "先把 thoughts 的读写接口一起打通。",
      tags: ["接口", "写入"],
      visibility: "public",
      status: "published",
      createdAt: "2026-05-26",
      sortOrder: 2,
      paperBackgroundImageUrl: "/thought-backgrounds/candy-waves.jpg",
      paperBackgroundOpacity: 45,
    });
    expect(nextData.thoughts.length).toBeGreaterThanOrEqual(thoughts.length + 1);
  });

  it("rejects blob paper background urls", async () => {
    const response = await POST(
      new Request("http://localhost/api/thoughts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "thought-db-bg-blob",
          title: "背景异常",
          slug: "invalid-background",
          body: "背景不能保存 blob。",
          tags: ["背景"],
          visibility: "public",
          status: "published",
          paperBackgroundImageUrl: "blob:paper-background",
          paperBackgroundOpacity: 52,
        }),
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "thought 参数不合法" });
  });

  it("rejects invalid paper background opacity", async () => {
    const response = await POST(
      new Request("http://localhost/api/thoughts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "thought-db-bg-opacity",
          title: "背景异常",
          slug: "invalid-background-opacity",
          body: "背景透明度不合法。",
          tags: ["背景"],
          visibility: "public",
          status: "published",
          paperBackgroundImageUrl: "/thought-backgrounds/candy-waves.jpg",
          paperBackgroundOpacity: 101,
        }),
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "thought 参数不合法" });
  });

  it("rejects malformed json body", async () => {
    const response = await POST(
      new Request("http://localhost/api/thoughts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{",
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "请求体必须是合法 JSON",
    });
  });

  it("rejects non-object json body", async () => {
    const response = await POST(
      new Request("http://localhost/api/thoughts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify("thought"),
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "请求体必须是对象",
    });
  });

  it("rejects invalid thought payload", async () => {
    const response = await POST(
      new Request("http://localhost/api/thoughts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "thought-db-003",
          title: "",
          slug: "created-by-api",
          body: "先把 thoughts 的参数校验补上。",
          tags: ["接口", 1],
          visibility: "secret",
          status: "published",
        }),
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "thought 参数不合法",
    });
  });
});
