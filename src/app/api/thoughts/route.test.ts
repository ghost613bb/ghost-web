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
          description: "这是最小 POST 写入测试。",
          body: "先把 thoughts 的读写接口一起打通。",
          tags: ["接口", "写入"],
          visibility: "public",
          status: "published",
          createdAt: "2026-05-26",
          sortOrder: 2,
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
        description: "这是最小 POST 写入测试。",
        body: "先把 thoughts 的读写接口一起打通。",
        tags: ["接口", "写入"],
        visibility: "public",
        status: "published",
        createdAt: "2026-05-26",
        sortOrder: 2,
      },
    });

    const nextResponse = await GET();
    const nextData = await nextResponse.json();

    expect(nextData).toEqual({
      thoughts: [
        {
          id: "thought-db-002",
          title: "通过接口创建的碎碎念",
          slug: "created-by-api",
          description: "这是最小 POST 写入测试。",
          body: "先把 thoughts 的读写接口一起打通。",
          tags: ["接口", "写入"],
          visibility: "public",
          status: "published",
          createdAt: "2026-05-26",
          sortOrder: 2,
        },
      ],
    });
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
