import { Resend } from "resend";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type MuyuPayload = {
  message?: unknown;
  page?: unknown;
  reason?: unknown;
  website?: unknown;
};

const maxMessageLength = 280;
const maxPageLength = 120;
const maxReasonLength = 60;
const rateLimitWindowMs = 10 * 60 * 1000;
const maxRequestsPerWindow = 3;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    return origin === new URL(request.url).origin;
  } catch {
    return true;
  }
}

function getClientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(clientKey: string) {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(clientKey);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(clientKey, { count: 1, resetAt: now + rateLimitWindowMs });
    return false;
  }

  if (bucket.count >= maxRequestsPerWindow) {
    return true;
  }

  bucket.count += 1;
  return false;
}

function normalizeOptionalString(value: unknown, maxLength: number) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error("木鱼参数不合法");
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length > maxLength) {
    throw new Error("木鱼参数太长了");
  }

  return trimmedValue || undefined;
}

function getMailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MUYU_FROM_EMAIL;
  const to = process.env.MUYU_TO_EMAIL;

  if (!apiKey || !from || !to) {
    return null;
  }

  return { apiKey, from, to };
}

function buildMailText({ clientKey, message, page, reason }: { clientKey: string; message?: string; page?: string; reason?: string }) {
  return ["有人在网站上敲了一下木鱼。", "", `页面：${page ?? "未知页面"}`, `原因：${reason ?? "未注明"}`, `留言：${message ?? "没有留言，只有咚的一声。"}`, `来源：${clientKey}`].join("\n");
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "木鱼只收本站传来的声音" }, { status: 403 });
  }

  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return NextResponse.json({ error: "木鱼刚刚被敲过啦，等一小会儿再试" }, { status: 429 });
  }

  try {
    const payload = (await request.json()) as MuyuPayload;
    const honeypot = normalizeOptionalString(payload.website, 80);

    if (honeypot) {
      return NextResponse.json({ ok: true });
    }

    const message = normalizeOptionalString(payload.message, maxMessageLength);
    const page = normalizeOptionalString(payload.page, maxPageLength);
    const reason = normalizeOptionalString(payload.reason, maxReasonLength);
    const mailConfig = getMailConfig();

    if (!mailConfig) {
      return NextResponse.json({ error: "木鱼声暂时没送出去，但作者已经在路上了" }, { status: 503 });
    }

    const resend = new Resend(mailConfig.apiKey);
    const result = await resend.emails.send({
      from: mailConfig.from,
      to: mailConfig.to,
      subject: "有人敲木鱼提醒你看网站",
      text: buildMailText({ clientKey, message, page, reason }),
    });

    if (result.error) {
      console.warn(`木鱼邮件发送失败：${result.error.message}`);
      return NextResponse.json({ error: "木鱼声暂时没送出去，但作者已经在路上了" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "木鱼参数不合法" }, { status: 400 });
  }
}
