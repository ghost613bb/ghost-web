import { beforeEach, describe, expect, it } from "vitest";
import { resetStoredAlbums } from "@/features/album/repository";
import { DELETE, PATCH } from "./route";

describe("/api/albums/[albumId]", () => {
  beforeEach(async () => {
    await resetStoredAlbums();
  });

  it("updates fallback album fields and cover through patch multipart form data", async () => {
    const formData = new FormData();
    formData.set("title", "编辑后的相册");
    formData.set("description", "更新后的备注");
    formData.set("coverFileName", "updated-cover.png");
    formData.append("coverFile", new Blob(["updated-cover"], { type: "image/png" }), "updated-cover.png");

    const response = await PATCH(
      new Request("http://localhost/api/albums/album-001", {
        method: "PATCH",
        body: formData,
      }),
      {
        params: Promise.resolve({
          albumId: "album-001",
        }),
      },
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.album).toMatchObject({
      id: "album-001",
      title: "编辑后的相册",
      description: "更新后的备注",
      coverImage: "/uploads/albums/album-001-updated-cover.png",
    });
  });

  it("hides a fallback album through delete", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/albums/album-001", {
        method: "DELETE",
      }),
      {
        params: Promise.resolve({
          albumId: "album-001",
        }),
      },
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });

    const nextResponse = await PATCH(
      new Request("http://localhost/api/albums/album-001", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "重新编辑",
          description: "尝试更新已删除相册",
        }),
      }),
      {
        params: Promise.resolve({
          albumId: "album-001",
        }),
      },
    );

    expect(nextResponse.status).toBe(404);
  });
});
