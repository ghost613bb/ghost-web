import { NextResponse } from "next/server";
import {
  requireSupabasePlaylistWriteEnv,
  updateSupabasePlaylistCollection,
  uploadSupabasePlaylistAsset,
} from "@/features/playlists/repository";
import { requireAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

const maxCoverSize = 5 * 1024 * 1024;
const supportedCoverTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

type RouteContext = {
  params: Promise<{ collectionId: string }> | { collectionId: string };
};

async function getCollectionId(context: RouteContext) {
  const params = await context.params;
  return params.collectionId.trim();
}

function isUploadedFile(value: FormDataEntryValue): value is File {
  return typeof value !== "string" && typeof value.arrayBuffer === "function" && typeof value.name === "string" && typeof value.size === "number";
}

function parseString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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
    const coverFile = formData.get("coverFile");
    const title = parseString(formData.get("title"));
    const description = parseString(formData.get("description"));
    const emoji = parseString(formData.get("emoji")) || "🎵";
    const accentClass = parseString(formData.get("accentClass"));

    if (!isUploadedFile(coverFile)) {
      return NextResponse.json({ error: "请先选择歌单封面图片" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "缺少歌单标题" }, { status: 400 });
    }

    if (!accentClass) {
      return NextResponse.json({ error: "缺少歌单主题色" }, { status: 400 });
    }

    if (coverFile.size === 0) {
      return NextResponse.json({ error: "歌单封面文件为空" }, { status: 400 });
    }

    if (coverFile.size > maxCoverSize) {
      return NextResponse.json({ error: "歌单封面不能超过 5MB" }, { status: 400 });
    }

    const extension = supportedCoverTypes.get(coverFile.type);

    if (!extension) {
      return NextResponse.json({ error: "歌单封面仅支持 JPG、PNG 或 WebP" }, { status: 400 });
    }

    const buffer = Buffer.from(await coverFile.arrayBuffer());
    const coverImageSrc = await uploadSupabasePlaylistAsset({
      buffer,
      contentType: coverFile.type,
      path: `collection-covers/${collectionId}.${extension}`,
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
