import { NextResponse } from "next/server";
import {
  deleteSupabasePlaylistCollection,
  requireSupabasePlaylistWriteEnv,
  updateSupabasePlaylistCollection,
} from "@/features/playlists/repository";
import { requireAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

const collectionAccentClasses = ["bg-[#fde2e7]", "bg-[#fff2c7]", "bg-[#f8cfd5]", "bg-[#e5f0ff]", "bg-[#fff4d8]", "bg-[#e6dcff]"];

type RouteContext = {
  params: Promise<{ collectionId: string }> | { collectionId: string };
};

function parseString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function getCollectionId(context: RouteContext) {
  const params = await context.params;
  return params.collectionId.trim();
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    requireSupabasePlaylistWriteEnv();

    const unauthorizedResponse = requireAdminRequest(request, "无权限编辑歌单");

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const collectionId = await getCollectionId(context);
    const payload = (await request.json()) as Record<string, unknown>;
    const title = parseString(payload.title);
    const description = parseString(payload.description);
    const emoji = parseString(payload.emoji) || "🎵";
    const accentClass = parseString(payload.accentClass) || collectionAccentClasses[0];

    if (!collectionId) {
      return NextResponse.json({ error: "缺少歌单 ID" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "请输入歌单名称" }, { status: 400 });
    }

    if (title.length > 60) {
      return NextResponse.json({ error: "歌单名称不能超过 60 个字符" }, { status: 400 });
    }

    if (description.length > 160) {
      return NextResponse.json({ error: "歌单描述不能超过 160 个字符" }, { status: 400 });
    }

    if (emoji.length > 16) {
      return NextResponse.json({ error: "歌单图标不能超过 16 个字符" }, { status: 400 });
    }

    if (!collectionAccentClasses.includes(accentClass)) {
      return NextResponse.json({ error: "请选择有效的歌单主题色" }, { status: 400 });
    }

    const collection = await updateSupabasePlaylistCollection({
      accentClass,
      description,
      emoji,
      id: collectionId,
      title,
    });

    return NextResponse.json({ collection });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "编辑歌单失败" }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    requireSupabasePlaylistWriteEnv();

    const unauthorizedResponse = requireAdminRequest(request, "无权限删除歌单");

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const collectionId = await getCollectionId(context);

    if (!collectionId) {
      return NextResponse.json({ error: "缺少歌单 ID" }, { status: 400 });
    }

    await deleteSupabasePlaylistCollection(collectionId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "删除歌单失败" }, { status: 400 });
  }
}
