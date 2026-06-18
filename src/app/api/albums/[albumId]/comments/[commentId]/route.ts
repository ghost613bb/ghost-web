import { NextResponse } from "next/server";
import { deleteAlbumComment } from "@/features/album/service";
import { requireAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ albumId: string; commentId: string }> | { albumId: string; commentId: string };
};

async function getRouteParams(context: RouteContext) {
  const params = await context.params;
  return {
    albumId: params.albumId.trim(),
    commentId: params.commentId.trim(),
  };
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const unauthorizedResponse = requireAdminRequest(request, "无权限删除相册评论");

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const { albumId, commentId } = await getRouteParams(context);

    if (!albumId || !commentId) {
      return NextResponse.json({ error: "缺少评论 ID" }, { status: 400 });
    }

    await deleteAlbumComment(albumId, commentId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "删除相册评论失败";
    return NextResponse.json({ error: message }, { status: message === "相册不存在" || message === "评论不存在" ? 404 : 400 });
  }
}
