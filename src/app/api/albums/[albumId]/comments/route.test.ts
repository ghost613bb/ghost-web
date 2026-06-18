import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

vi.mock("@/features/album/service", () => ({
  createAlbumComment: vi.fn(async (albumId, input) => ({
    albumId,
    author: input.author ?? "Name",
    avatar: "📷",
    content: input.content,
    id: "album-comment-001",
    time: "06/18 10:05",
  })),
  listAlbumComments: vi.fn(async (albumId) => [
    {
      albumId,
      author: "Name",
      avatar: "📷",
      content: "第一条评论",
      id: "album-comment-001",
      time: "06/18 10:05",
    },
  ]),
}));

function buildGetContext(albumId = "album-001") {
  return { params: { albumId } };
}

function buildPostRequest(payload: unknown, token = "test-token") {
  return {
    headers: new Headers({ "x-playlist-import-token": token }),
    json: async () => payload,
  } as Request;
}

describe("/api/albums/[albumId]/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PLAYLIST_IMPORT_ADMIN_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns comments for an album", async () => {
    const response = await GET(new Request("http://localhost/api/albums/album-001/comments"), buildGetContext());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      comments: [
        {
          albumId: "album-001",
          author: "Name",
          avatar: "📷",
          content: "第一条评论",
          id: "album-comment-001",
          time: "06/18 10:05",
        },
      ],
    });
  });

  it("rejects comment creation without admin permission", async () => {
    const response = await POST(buildPostRequest({ content: "hello" }, ""), buildGetContext());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "无权限新增相册评论" });
  });

  it("rejects empty comments", async () => {
    const response = await POST(buildPostRequest({ content: "   " }), buildGetContext());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "请输入评论内容" });
  });

  it("creates a comment for the route album id", async () => {
    const service = await import("@/features/album/service");
    const response = await POST(buildPostRequest({ author: "Ranima", content: "想把夏天留在这里。" }), buildGetContext("album-007"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.comment).toMatchObject({
      albumId: "album-007",
      author: "Ranima",
      avatar: "📷",
      content: "想把夏天留在这里。",
    });
    expect(service.createAlbumComment).toHaveBeenCalledWith("album-007", {
      author: "Ranima",
      content: "想把夏天留在这里。",
    });
  });
});
