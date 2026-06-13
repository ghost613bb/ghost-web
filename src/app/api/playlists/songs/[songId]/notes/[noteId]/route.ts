import { NextResponse } from "next/server";
import {
  deleteSupabasePlaylistNote,
  requireSupabasePlaylistWriteEnv,
  updateSupabasePlaylistNote,
} from "@/features/playlists/repository";
import { requireAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ noteId: string; songId: string }> | { noteId: string; songId: string };
};

function parseString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function getRouteParams(context: RouteContext) {
  const params = await context.params;
  return {
    noteId: params.noteId.trim(),
    songId: params.songId.trim(),
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    requireSupabasePlaylistWriteEnv();

    const unauthorizedResponse = requireAdminRequest(request, "无权限编辑歌曲评论");

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const { noteId, songId } = await getRouteParams(context);
    const payload = (await request.json()) as Record<string, unknown>;
    const author = parseString(payload.author) || "Name";
    const avatar = "🎧";
    const content = parseString(payload.content);

    if (!songId || !noteId) {
      return NextResponse.json({ error: "缺少评论 ID" }, { status: 400 });
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

    const note = await updateSupabasePlaylistNote({
      author,
      avatar,
      content,
      noteId,
      songId,
    });

    return NextResponse.json({ note });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "编辑歌曲评论失败" }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    requireSupabasePlaylistWriteEnv();

    const unauthorizedResponse = requireAdminRequest(request, "无权限删除歌曲评论");

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const { noteId, songId } = await getRouteParams(context);

    if (!songId || !noteId) {
      return NextResponse.json({ error: "缺少评论 ID" }, { status: 400 });
    }

    await deleteSupabasePlaylistNote({ noteId, songId });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "删除歌曲评论失败" }, { status: 400 });
  }
}
