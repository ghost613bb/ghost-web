import type { CreateAlbumInput } from "./types";

export function parseCreateAlbum(body: unknown): CreateAlbumInput {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new Error("请求体必须是对象");
  }

  const album = body as Partial<CreateAlbumInput>;

  if (typeof album.title !== "string" || album.title.trim().length === 0) {
    throw new Error("请先填写相册名称");
  }

  if (album.description !== undefined && album.description !== null && typeof album.description !== "string") {
    throw new Error("album 参数不合法");
  }

  if (album.coverImage !== undefined && album.coverImage !== null && typeof album.coverImage !== "string") {
    throw new Error("album 参数不合法");
  }

  if (album.id !== undefined && album.id !== null && typeof album.id !== "string") {
    throw new Error("album 参数不合法");
  }

  return {
    id: album.id?.trim() || undefined,
    title: album.title.trim(),
    description: album.description?.trim() || undefined,
    coverImage: album.coverImage ?? undefined,
  };
}
