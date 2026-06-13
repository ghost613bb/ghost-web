import { NextResponse } from "next/server";
import {
  deleteSupabasePlaylistCollection,
  requireSupabasePlaylistWriteEnv,
  updateSupabasePlaylistCollection,
} from "@/features/playlists/repository";
import { parsePlaylistCollectionFields } from "@/features/playlists/collection-validation";
import { requireAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ collectionId: string }> | { collectionId: string };
};

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
    const { accentClass, description, emoji, title } = parsePlaylistCollectionFields(payload);

    if (!collectionId) {
      return NextResponse.json({ error: "缺少歌单 ID" }, { status: 400 });
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
