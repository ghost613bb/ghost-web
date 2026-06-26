import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  getNextSupabasePlaylistCollectionSortOrder,
  insertSupabasePlaylistCollection,
  requireSupabasePlaylistWriteEnv,
  uploadSupabasePlaylistAsset,
} from "@/features/playlists/repository";
import {
  parsePlaylistCollectionFields,
  slugifyCollectionTitle,
  validatePlaylistCollectionCoverFile,
} from "@/features/playlists/collection-validation";
import { buildPlaylistCollectionCoverPath } from "@/features/storage/paths";
import { requireAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    requireSupabasePlaylistWriteEnv();

    const unauthorizedResponse = requireAdminRequest(request, "无权限新增歌单");

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const isMultipart = request.headers.get("content-type")?.includes("multipart/form-data") ?? false;
    const formData = isMultipart ? await request.formData() : null;
    const payload = formData ? Object.fromEntries(formData.entries()) : ((await request.json()) as Record<string, unknown>);
    const { accentClass, description, emoji, title } = parsePlaylistCollectionFields(payload);
    const coverFile = formData ? validatePlaylistCollectionCoverFile(formData.get("coverFile")) : null;
    const sortOrder = await getNextSupabasePlaylistCollectionSortOrder();
    const id = `collection-${slugifyCollectionTitle(title)}-${randomUUID().slice(0, 8)}`;
    let coverImageSrc: string | undefined;

    if (coverFile) {
      coverImageSrc = await uploadSupabasePlaylistAsset({
        buffer: Buffer.from(await coverFile.file.arrayBuffer()),
        contentType: coverFile.file.type,
        path: buildPlaylistCollectionCoverPath(id, coverFile.extension),
      });
    }

    const collection = await insertSupabasePlaylistCollection({
      accentClass,
      coverImageSrc,
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
