import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, GET, POST } from "./route";

function buildPostRequest(token: string) {
  return {
    json: async () => ({ token }),
  } as Request;
}

function buildGetRequest(cookie?: string) {
  return {
    headers: new Headers(cookie ? { cookie } : {}),
  } as Request;
}

describe("/api/admin/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PLAYLIST_IMPORT_ADMIN_TOKEN", "test-token");
    vi.stubEnv("ADMIN_SESSION_SECRET", "session-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects a wrong admin token", async () => {
    const response = await POST(buildPostRequest("wrong-token"));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "管理 Token 不正确" });
  });

  it("creates and reads an admin session", async () => {
    const loginResponse = await POST(buildPostRequest("test-token"));
    const loginData = await loginResponse.json();
    const cookie = loginResponse.headers.get("set-cookie") ?? "";

    expect(loginResponse.status).toBe(200);
    expect(loginData).toEqual({ authenticated: true });
    expect(cookie).toContain("playlist_admin_session=");
    expect(cookie).toContain("HttpOnly");

    const sessionResponse = await GET(buildGetRequest(cookie));
    const sessionData = await sessionResponse.json();

    expect(sessionData).toEqual({ authenticated: true });
  });

  it("rejects tampered session cookies", async () => {
    const response = await GET(buildGetRequest("playlist_admin_session=tampered.value"));
    const data = await response.json();

    expect(data).toEqual({ authenticated: false });
  });

  it("clears an admin session", async () => {
    const response = await DELETE();
    const data = await response.json();
    const cookie = response.headers.get("set-cookie") ?? "";

    expect(data).toEqual({ authenticated: false });
    expect(cookie).toContain("playlist_admin_session=");
    expect(cookie).toContain("Max-Age=0");
  });
});
