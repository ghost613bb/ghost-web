import { NextResponse } from "next/server";
import {
  clearAdminSessionResponse,
  createAdminSessionResponse,
  getAdminSessionState,
  verifyAdminLoginToken,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

function parseString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  return NextResponse.json(getAdminSessionState(request));
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const token = parseString(payload.token);

    if (!token) {
      return NextResponse.json({ error: "请输入管理 Token" }, { status: 400 });
    }

    if (!verifyAdminLoginToken(token)) {
      return NextResponse.json({ error: "管理 Token 不正确" }, { status: 401 });
    }

    return createAdminSessionResponse();
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "管理登录失败" }, { status: 400 });
  }
}

export async function DELETE() {
  return clearAdminSessionResponse();
}
