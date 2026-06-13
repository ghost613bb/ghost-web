import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  ensureSupabasePlaylistSong,
  insertSupabasePlaylistNote,
  requireSupabasePlaylistWriteEnv,
} from "@/features/playlists/repository";
import { requireAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ songId: string }> | { songId: string };
};

function parseString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function getSongId(context: RouteContext) {
  const params = await context.params;
  return params.songId.trim();
}

export async function POST(request: Request, context: RouteContext) {
  try {
    requireSupabasePlaylistWriteEnv();

    const unauthorizedResponse = requireAdminRequest(request, "无权限新增歌曲评论");

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const songId = await getSongId(context);
    const payload = (await request.json()) as Record<string, unknown>;
    const author = parseString(payload.author) || "Name";
    const avatar = "🎧";
    const content = parseString(payload.content);

    if (!songId) {
      return NextResponse.json({ error: "缺少歌曲 ID" }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "请输入评论内容" }, { status: 400 });
    }

    if (content.length > 280) {
      return NextResponse.json({ error: "评论内容不能超过 280 个字符" }, { status: 400 });
    }

    if (author.length > 40) {
      return NextResponse.json({ error: "昵称不能超过 40 个字符" }, { status: 400 });
    }

    if (avatar.length > 16) {
      return NextResponse.json({ error: "头像不能超过 16 个字符" }, { status: 400 });
    }

    await ensureSupabasePlaylistSong(songId);

    const note = await insertSupabasePlaylistNote({
      author,
      avatar,
      content,
      id: `note-${randomUUID()}`,
      songId,
    });

    return NextResponse.json({ note });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "新增歌曲评论失败" }, { status: 400 });
  }
}
