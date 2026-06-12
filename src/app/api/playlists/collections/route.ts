import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  getNextSupabasePlaylistCollectionSortOrder,
  insertSupabasePlaylistCollection,
  requireSupabasePlaylistWriteEnv,
} from "@/features/playlists/repository";
import { requireAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

const collectionAccentClasses = ["bg-[#fde2e7]", "bg-[#fff2c7]", "bg-[#f8cfd5]", "bg-[#e5f0ff]", "bg-[#fff4d8]", "bg-[#e6dcff]"];

function slugifyCollectionTitle(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 36) || "collection";
}

function parseString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    requireSupabasePlaylistWriteEnv();

    const unauthorizedResponse = requireAdminRequest(request, "无权限新增歌单");

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const title = parseString(payload.title);
    const description = parseString(payload.description);
    const emoji = parseString(payload.emoji) || "🎵";
    const accentClass = parseString(payload.accentClass) || collectionAccentClasses[0];

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

    const sortOrder = await getNextSupabasePlaylistCollectionSortOrder();
    const id = `collection-${slugifyCollectionTitle(title)}-${randomUUID().slice(0, 8)}`;
    const collection = await insertSupabasePlaylistCollection({
      accentClass,
      description,
      emoji,
      id,
      sortOrder,
      title,
    });

    return NextResponse.json({ collection });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "新增歌单失败" }, { status: 400 });
  }
}
