import { describe, expect, it } from "vitest";
import { GET, PATCH } from "./route";

describe("/api/admin/display-modes", () => {
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
      moduleId: "thoughts",
      displayMode: "demo",
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
