import { NextResponse } from "next/server";
import {
  ensureSupabasePlaylistCollection,
  moveSupabasePlaylistCollectionSongs,
  removeSupabasePlaylistCollectionSongs,
  getSupabasePlaylistCollectionSongIds,
  requireSupabasePlaylistWriteEnv,
} from "@/features/playlists/repository";
import { requireAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

const maxManagedSongs = 100;

type RouteContext = {
  params: Promise<{ collectionId: string }>;
};

function parseString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseSongIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(new Set(value.map(parseString).filter(Boolean)));
}

async function getCollectionId(context: RouteContext) {
  const params = await context.params;
  return params.collectionId.trim();
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    requireSupabasePlaylistWriteEnv();

    const unauthorizedResponse = requireAdminRequest(request, "无权限管理歌单歌曲");

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const collectionId = await getCollectionId(context);
    const payload = (await request.json()) as Record<string, unknown>;
    const action = parseString(payload.action);
    const songIds = parseSongIds(payload.songIds);

    if (!collectionId) {
      return NextResponse.json({ error: "缺少歌单 ID" }, { status: 400 });
    }

    if (action !== "remove" && action !== "move") {
      return NextResponse.json({ error: "请选择有效的批量操作" }, { status: 400 });
    }

    if (songIds.length === 0) {
      return NextResponse.json({ error: "请选择要管理的歌曲" }, { status: 400 });
    }

    if (songIds.length > maxManagedSongs) {
      return NextResponse.json({ error: `一次最多管理 ${maxManagedSongs} 首歌` }, { status: 400 });
    }

    await ensureSupabasePlaylistCollection(collectionId);

    if (action === "remove") {
      const removedSongIds = await removeSupabasePlaylistCollectionSongs(collectionId, songIds);
      const sourceSongIds = await getSupabasePlaylistCollectionSongIds(collectionId);

      return NextResponse.json({
        action,
        collectionId,
        ok: true,
        removedSongIds,
        sourceSongIds,
      });
    }

    const targetCollectionId = parseString(payload.targetCollectionId);

    if (!targetCollectionId) {
      return NextResponse.json({ error: "请选择目标歌单" }, { status: 400 });
    }

    if (targetCollectionId === collectionId) {
      return NextResponse.json({ error: "请选择另一个目标歌单" }, { status: 400 });
    }

    await ensureSupabasePlaylistCollection(targetCollectionId);

    const result = await moveSupabasePlaylistCollectionSongs({
      songIds,
      sourceCollectionId: collectionId,
      targetCollectionId,
    });

    return NextResponse.json({
      action,
      ok: true,
      sourceCollectionId: collectionId,
      targetCollectionId,
      ...result,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "管理歌单歌曲失败" }, { status: 400 });
  }
}
