import { beforeEach, describe, expect, it, vi } from "vitest";

const resendState = vi.hoisted(() => ({
  send: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function () {
    return {
      emails: {
        send: resendState.send,
      },
    };
  }),
}));

import { POST } from "./route";

let requestIndex = 0;

function buildRequest(body: object, init?: RequestInit) {
  requestIndex += 1;
  return new Request("http://localhost/api/contact/muyu", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "http://localhost",
      "x-forwarded-for": `127.0.0.${requestIndex}`,
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
    ...init,
  });
}

describe("/api/contact/muyu", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("MUYU_FROM_EMAIL", "Muyu <muyu@example.com>");
    vi.stubEnv("MUYU_TO_EMAIL", "author@example.com");
    resendState.send.mockReset();
    resendState.send.mockResolvedValue({ data: { id: "email-001" }, error: null, headers: null });
  });

  it("sends a muyu reminder email", async () => {
    const response = await POST(buildRequest({ message: "服务器睡着了", page: "/thoughts", reason: "read-error", website: "" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true });
    expect(resendState.send).toHaveBeenCalledWith(expect.objectContaining({
      from: "Muyu <muyu@example.com>",
      to: "author@example.com",
      subject: "有人敲木鱼提醒你看网站",
    }));
  });

  it("rejects cross-origin requests", async () => {
    const response = await POST(buildRequest({ message: "hello" }, { headers: { origin: "https://evil.example" } }));
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toEqual({ error: "木鱼只收本站传来的声音" });
    expect(resendState.send).not.toHaveBeenCalled();
  });

  it("quietly accepts honeypot submissions without sending email", async () => {
    const response = await POST(buildRequest({ message: "hello", website: "bot" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true });
    expect(resendState.send).not.toHaveBeenCalled();
  });

  it("returns 503 when mail env is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");

    const response = await POST(buildRequest({ message: "hello" }));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({ error: "木鱼声暂时没送出去，但作者已经在路上了" });
  });

  it("rejects overly long messages", async () => {
    const response = await POST(buildRequest({ message: "咚".repeat(281) }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "木鱼参数太长了" });
  });
});
