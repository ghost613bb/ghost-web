import { beforeEach, describe, expect, it } from "vitest";
import { resetDisplayModes } from "@/features/module-display-mode/service";
import { GET, PATCH } from "./route";

describe("/api/admin/display-modes", () => {
  beforeEach(async () => {
    await resetDisplayModes();
  });
  it("returns the current display modes", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      modes: {
        about: "real",
        album: "real",
        coffee: "real",
        message: "real",
        playlists: "real",
        thoughts: "real",
        todo: "real",
      },
    });
  });

  it("updates a module display mode", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/admin/display-modes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moduleId: "thoughts",
          displayMode: "demo",
        }),
      }),
    );

    const data = await response.json();
    const nextResponse = await GET();
    const nextData = await nextResponse.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      modes: {
        about: "real",
        album: "real",
        coffee: "real",
        message: "real",
        playlists: "real",
        thoughts: "demo",
        todo: "real",
      },
    });
    expect(nextData.modes.thoughts).toBe("demo");
  });

  it("rejects invalid display modes", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/admin/display-modes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moduleId: "thoughts",
          displayMode: "hidden",
        }),
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "displayMode 只能是 real 或 demo",
    });
  });

  it("rejects malformed json body", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/admin/display-modes", {
        method: "PATCH",
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
    const response = await PATCH(
      new Request("http://localhost/api/admin/display-modes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify("demo"),
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "请求体必须是对象",
    });
  });

  it("rejects unknown module ids", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/admin/display-modes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moduleId: "museum",
          displayMode: "demo",
        }),
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "moduleId 不合法",
    });
  });
});
