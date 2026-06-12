import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

const adminSessionCookieName = "playlist_admin_session";
const adminSessionMaxAgeSeconds = 60 * 60 * 24 * 7;
const adminSessionScope = "playlist-admin";

type AdminSessionPayload = {
  exp: number;
  iat: number;
  scope: typeof adminSessionScope;
  version: 1;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getAdminToken() {
  return process.env.PLAYLIST_IMPORT_ADMIN_TOKEN;
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? getAdminToken();
}

function signPayload(encodedPayload: string) {
  const secret = getSessionSecret();

  if (!secret) {
    return null;
  }

  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function isAdminTokenValid(token: string) {
  const expectedToken = getAdminToken();

  return Boolean(expectedToken && token && safeEqual(token, expectedToken));
}

function createAdminSessionValue() {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    exp: now + adminSessionMaxAgeSeconds,
    iat: now,
    scope: adminSessionScope,
    version: 1,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  if (!signature) {
    throw new Error("管理会话需要配置 PLAYLIST_IMPORT_ADMIN_TOKEN");
  }

  return `${encodedPayload}.${signature}`;
}

function isAdminSessionValueValid(value: string | undefined) {
  if (!value) {
    return false;
  }

  const [encodedPayload, signature, ...extraParts] = value.split(".");

  if (!encodedPayload || !signature || extraParts.length > 0) {
    return false;
  }

  const expectedSignature = signPayload(encodedPayload);

  if (!expectedSignature || !safeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<AdminSessionPayload>;
    const now = Math.floor(Date.now() / 1000);

    return payload.scope === adminSessionScope && payload.version === 1 && typeof payload.exp === "number" && payload.exp > now;
  } catch {
    return false;
  }
}

function isSameOriginRequest(request: Request) {
  const method = (request.method ?? "GET").toUpperCase();

  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return true;
  }

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

function getCookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = cookieHeader.split(";").map((item) => item.trim());
  const cookiePrefix = `${name}=`;
  const cookie = cookies.find((item) => item.startsWith(cookiePrefix));

  return cookie ? decodeURIComponent(cookie.slice(cookiePrefix.length)) : undefined;
}

export function createAdminSessionResponse() {
  const response = NextResponse.json({ authenticated: true });

  response.cookies.set(adminSessionCookieName, createAdminSessionValue(), {
    httpOnly: true,
    maxAge: adminSessionMaxAgeSeconds,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export function clearAdminSessionResponse() {
  const response = NextResponse.json({ authenticated: false });

  response.cookies.set(adminSessionCookieName, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export function isAdminRequest(request: Request) {
  const headerToken = request.headers.get("x-playlist-import-token") ?? "";

  if (isAdminTokenValid(headerToken)) {
    return true;
  }

  return isAdminSessionValueValid(getCookieValue(request, adminSessionCookieName));
}

export function requireAdminRequest(request: Request, message = "无权限执行管理操作") {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "管理操作来源不合法" }, { status: 403 });
  }

  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: message }, { status: 401 });
  }

  return null;
}

export function verifyAdminLoginToken(token: string) {
  return isAdminTokenValid(token);
}

export function getAdminSessionState(request: NextRequest | Request) {
  return { authenticated: isAdminRequest(request) };
}
