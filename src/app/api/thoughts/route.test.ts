import { beforeEach, describe, expect, it, vi } from "vitest";

const serviceState = vi.hoisted(() => ({
  createThought: vi.fn(),
  listThoughts: vi.fn(),
}));

vi.mock("@/features/thoughts/service", () => serviceState);

import { GET, POST } from "./route";

const thought = {
  id: "thought-db-002",
  title: "通过接口创建的碎碎念",
  slug: "created-by-api",
  body: "先把 thoughts 的读写接口一起打通。",
  bodyText: "先把 thoughts 的读写接口一起打通。",
  visibility: "public" as const,
  status: "published" as const,
  createdAt: "2026-05-26",
  publishedAt: "2026-05-26",
  pinned: false,
  sortOrder: 2,
  paperBackgroundImageUrl: "/thought-backgrounds/candy-waves.jpg",
  paperBackgroundOpacity: 45,
};

describe("/api/thoughts", () => {
  beforeEach(() => {
    serviceState.createThought.mockReset();
    serviceState.listThoughts.mockReset();
    serviceState.listThoughts.mockResolvedValue([]);
  });

  it("returns thought data from the service", async () => {
    serviceState.listThoughts.mockResolvedValue([thought]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ thoughts: [thought] });
  });

  it("creates a new thought", async () => {
    serviceState.createThought.mockResolvedValue(thought);
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
    expect(data).toEqual({ thought });
    expect(serviceState.createThought).toHaveBeenCalledWith(expect.objectContaining({ id: "thought-db-002", title: "通过接口创建的碎碎念" }));
  });

  it("returns 503 when the thought data source is not configured", async () => {
    serviceState.createThought.mockRejectedValue(new Error("碎碎念数据源未配置"));
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
          visibility: "public",
          status: "published",
        }),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({ error: "碎碎念数据源未配置" });
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
