import type { CreateAlbumInput, CreateAlbumPhotoInput, UpdateAlbumPhotoInput } from "./types";

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

  if (album.coverDisplayImage !== undefined && album.coverDisplayImage !== null && typeof album.coverDisplayImage !== "string") {
    throw new Error("album 参数不合法");
  }

  if (album.coverThumbnailImage !== undefined && album.coverThumbnailImage !== null && typeof album.coverThumbnailImage !== "string") {
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
    coverDisplayImage: album.coverDisplayImage ?? undefined,
    coverThumbnailImage: album.coverThumbnailImage ?? undefined,
  };
}

export function parseCreateAlbumPhoto(body: unknown): CreateAlbumPhotoInput {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new Error("请求体必须是对象");
  }

  const photo = body as Partial<CreateAlbumPhotoInput>;

  if (photo.id !== undefined && photo.id !== null && typeof photo.id !== "string") {
    throw new Error("photo 参数不合法");
  }

  if (photo.note !== undefined && photo.note !== null && typeof photo.note !== "string") {
    throw new Error("photo 参数不合法");
  }

  if (typeof photo.imageUrl !== "string" || photo.imageUrl.trim().length === 0) {
    throw new Error("请先选择照片");
  }

  if (photo.displayUrl !== undefined && photo.displayUrl !== null && typeof photo.displayUrl !== "string") {
    throw new Error("photo 参数不合法");
  }

  if (photo.thumbnailUrl !== undefined && photo.thumbnailUrl !== null && typeof photo.thumbnailUrl !== "string") {
    throw new Error("photo 参数不合法");
  }

  if (photo.imagePosition !== undefined && photo.imagePosition !== null && typeof photo.imagePosition !== "string") {
    throw new Error("photo 参数不合法");
  }

  return {
    id: photo.id?.trim() || undefined,
    note: photo.note?.trim() || undefined,
    imageUrl: photo.imageUrl.trim(),
    displayUrl: photo.displayUrl?.trim() || undefined,
    thumbnailUrl: photo.thumbnailUrl?.trim() || undefined,
    imagePosition: photo.imagePosition?.trim() || undefined,
  };
}

export function parseUpdateAlbumPhoto(body: unknown): UpdateAlbumPhotoInput {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new Error("请求体必须是对象");
  }

  const photo = body as Partial<UpdateAlbumPhotoInput>;

  if (photo.note !== undefined && photo.note !== null && typeof photo.note !== "string") {
    throw new Error("photo 参数不合法");
  }

  return {
    note: photo.note?.trim() || undefined,
  };
}
