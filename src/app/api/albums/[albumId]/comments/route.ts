import { NextResponse } from "next/server";
import { createAlbumComment, listAlbumComments } from "@/features/album/service";
import { parseCreateAlbumComment } from "@/features/album/validation";
import { requireAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ albumId: string }> | { albumId: string };
};

async function getAlbumId(context: RouteContext) {
  const params = await context.params;
  return params.albumId.trim();
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const albumId = await getAlbumId(context);

    if (!albumId) {
      return NextResponse.json({ error: "缺少相册 ID" }, { status: 400 });
    }

    const comments = await listAlbumComments(albumId);
    return NextResponse.json({ comments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "读取相册评论失败";
    return NextResponse.json({ error: message }, { status: message === "相册不存在" ? 404 : 400 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const unauthorizedResponse = requireAdminRequest(request, "无权限新增相册评论");

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const albumId = await getAlbumId(context);

    if (!albumId) {
      return NextResponse.json({ error: "缺少相册 ID" }, { status: 400 });
    }

    const comment = await createAlbumComment(albumId, parseCreateAlbumComment(await request.json()));
    return NextResponse.json({ comment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "新增相册评论失败";
    return NextResponse.json({ error: message }, { status: message === "相册不存在" ? 404 : 400 });
  }
}
