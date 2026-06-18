import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE } from "./route";

vi.mock("@/features/album/service", () => ({
  deleteAlbumComment: vi.fn(async () => undefined),
}));

function buildRequest(token = "test-token") {
  return {
    headers: new Headers({ "x-playlist-import-token": token }),
    method: "DELETE",
  } as Request;
}

function buildContext(albumId = "album-001", commentId = "album-comment-001") {
  return { params: { albumId, commentId } };
}

describe("/api/albums/[albumId]/comments/[commentId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PLAYLIST_IMPORT_ADMIN_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects comment deletion without admin auth", async () => {
    const response = await DELETE(buildRequest(""), buildContext());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "无权限删除相册评论" });
  });

  it("deletes a comment", async () => {
    const service = await import("@/features/album/service");
    const response = await DELETE(buildRequest(), buildContext("album-007", "album-comment-007"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true });
    expect(service.deleteAlbumComment).toHaveBeenCalledWith("album-007", "album-comment-007");
  });
});
