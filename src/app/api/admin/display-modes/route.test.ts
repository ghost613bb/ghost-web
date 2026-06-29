import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetDisplayModes } from "@/features/module-display-mode/service";
import { GET, PATCH } from "./route";

function buildPatchRequest(body: unknown, token = "test-token") {
  return new Request("http://localhost/api/admin/display-modes", {
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "x-playlist-import-token": token,
    },
    method: "PATCH",
  });
}

describe("/api/admin/display-modes", () => {
  beforeEach(async () => {
    vi.stubEnv("PLAYLIST_IMPORT_ADMIN_TOKEN", "test-token");
    await resetDisplayModes();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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

  it("rejects unauthorized display mode updates", async () => {
    const response = await PATCH(buildPatchRequest({ moduleId: "album", displayMode: "demo" }, ""));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "无权限更新展示模式" });
  });

  it("updates a module display mode", async () => {
    const response = await PATCH(buildPatchRequest({ moduleId: "album", displayMode: "demo" }));

    const data = await response.json();
    const nextResponse = await GET();
    const nextData = await nextResponse.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      modes: {
        about: "real",
        album: "demo",
        coffee: "real",
        message: "real",
        playlists: "real",
        thoughts: "real",
        todo: "real",
      },
    });
    expect(nextData.modes.album).toBe("demo");
  });

  it("rejects invalid display modes", async () => {
    const response = await PATCH(buildPatchRequest({ moduleId: "album", displayMode: "hidden" }));

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "displayMode 只能是 real 或 demo",
    });
  });

  it("rejects malformed json body", async () => {
    const response = await PATCH(buildPatchRequest("{"));

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "请求体必须是合法 JSON",
    });
  });

  it("rejects non-object json body", async () => {
    const response = await PATCH(buildPatchRequest(JSON.stringify("demo")));

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "请求体必须是对象",
    });
  });

  it("rejects unknown module ids", async () => {
    const response = await PATCH(buildPatchRequest({ moduleId: "museum", displayMode: "demo" }));

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "moduleId 不合法",
    });
  });
});
