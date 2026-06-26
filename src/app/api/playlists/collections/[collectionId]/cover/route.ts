import { NextResponse } from "next/server";
import {
  requireSupabasePlaylistWriteEnv,
  updateSupabasePlaylistCollection,
  uploadSupabasePlaylistAsset,
} from "@/features/playlists/repository";
import { parsePlaylistCollectionFields, validatePlaylistCollectionCoverFile } from "@/features/playlists/collection-validation";
import { buildPlaylistCollectionCoverPath } from "@/features/storage/paths";
import { requireAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ collectionId: string }>;
};

async function getCollectionId(context: RouteContext) {
  const params = await context.params;
  return params.collectionId.trim();
}

export async function POST(request: Request, context: RouteContext) {
  try {
    requireSupabasePlaylistWriteEnv();

    const unauthorizedResponse = requireAdminRequest(request, "无权限修改歌单封面");

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const collectionId = await getCollectionId(context);

    if (!collectionId) {
      return NextResponse.json({ error: "缺少歌单 ID" }, { status: 400 });
    }

    const formData = await request.formData();
    const { accentClass, description, emoji, title } = parsePlaylistCollectionFields(Object.fromEntries(formData.entries()));
    const coverFile = validatePlaylistCollectionCoverFile(formData.get("coverFile"), { required: true });

    if (!coverFile) {
      return NextResponse.json({ error: "请先选择歌单封面图片" }, { status: 400 });
    }

    const buffer = Buffer.from(await coverFile.file.arrayBuffer());
    const coverImageSrc = await uploadSupabasePlaylistAsset({
      buffer,
      contentType: coverFile.file.type,
      path: buildPlaylistCollectionCoverPath(collectionId, coverFile.extension),
    });

    const collection = await updateSupabasePlaylistCollection({
      accentClass,
      coverImageSrc,
      description,
      emoji,
      id: collectionId,
      title,
    });

    return NextResponse.json({ collection });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "修改歌单封面失败" }, { status: 400 });
  }
}
