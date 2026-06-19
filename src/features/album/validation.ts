import type { CreateAlbumCommentInput, CreateAlbumInput, CreateAlbumPhotoInput, UpdateAlbumPhotoInput } from "./types";

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

export function parseCreateAlbumPhoto(body: unknown): CreateAlbumPhotoInput {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new Error("请求体必须是对象");
  }

  const photo = body as Partial<CreateAlbumPhotoInput>;

  if (photo.title !== undefined && photo.title !== null && typeof photo.title !== "string") {
    throw new Error("photo 参数不合法");
  }

  if (photo.note !== undefined && photo.note !== null && typeof photo.note !== "string") {
    throw new Error("photo 参数不合法");
  }

  if (typeof photo.imageUrl !== "string" || photo.imageUrl.trim().length === 0) {
    throw new Error("请先选择照片");
  }

  if (photo.imagePosition !== undefined && photo.imagePosition !== null && typeof photo.imagePosition !== "string") {
    throw new Error("photo 参数不合法");
  }

  return {
    title: photo.title?.trim() || undefined,
    note: photo.note?.trim() || undefined,
    imageUrl: photo.imageUrl.trim(),
    imagePosition: photo.imagePosition?.trim() || undefined,
  };
}

export function parseUpdateAlbumPhoto(body: unknown): UpdateAlbumPhotoInput {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new Error("请求体必须是对象");
  }

  const photo = body as Partial<UpdateAlbumPhotoInput>;

  if (typeof photo.title !== "string" || photo.title.trim().length === 0) {
    throw new Error("请先填写照片标题");
  }

  if (photo.note !== undefined && photo.note !== null && typeof photo.note !== "string") {
    throw new Error("photo 参数不合法");
  }

  return {
    title: photo.title.trim(),
    note: photo.note?.trim() || undefined,
  };
}

export function parseCreateAlbumComment(body: unknown): CreateAlbumCommentInput {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new Error("请求体必须是对象");
  }

  const comment = body as Partial<CreateAlbumCommentInput>;
  const author = typeof comment.author === "string" ? comment.author.trim() : "";
  const content = typeof comment.content === "string" ? comment.content.trim() : "";

  if (!author) {
    throw new Error("请先生成昵称");
  }

  if (author.length > 40) {
    throw new Error("昵称不能超过 40 个字符");
  }

  if (!content) {
    throw new Error("请输入评论内容");
  }

  if (content.length > 280) {
    throw new Error("评论内容不能超过 280 个字符");
  }

  return {
    author,
    content,
  };
}
