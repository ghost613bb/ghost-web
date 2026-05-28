import { beforeEach, describe, expect, it } from "vitest";
import { resetStoredAlbums } from "@/features/album/repository";
import { DELETE, PATCH } from "./route";

describe("/api/albums/[albumId]", () => {
  beforeEach(async () => {
    await resetStoredAlbums();
  });

  it("updates fallback album fields through patch", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/albums/album-001", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "编辑后的相册",
          description: "更新后的备注",
        }),
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
