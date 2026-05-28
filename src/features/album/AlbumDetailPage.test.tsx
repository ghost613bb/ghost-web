import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Album } from "./types";
import { AlbumDetailPageView } from "./AlbumDetailPage";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("AlbumDetailPageView", () => {
  const album: Album = {
    id: "album-001",
    title: "我的相册",
    description: "原始描述",
    photoCount: 22,
    visibility: "public",
    status: "published",
    createdAt: "2023-07-31",
    sortOrder: 1,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockReset();
  });

  it("edits an album from the detail actions, uploads a new cover, and updates the page", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        album: {
          ...album,
          title: "编辑后的相册",
          description: "新的相册描述",
          coverImage: "/uploads/albums/album-001-detail-cover.png",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AlbumDetailPageView album={album} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit Album" }));

    const titleInput = await screen.findByLabelText("相册名称");
    const noteInput = screen.getByLabelText("备注/留言");
    const coverInput = screen.getByLabelText("上传本地封面");
    const coverFile = new File(["detail-cover"], "detail-cover.png", { type: "image/png" });

    fireEvent.change(titleInput, { target: { value: "编辑后的相册" } });
    fireEvent.change(noteInput, { target: { value: "新的相册描述" } });
    fireEvent.change(coverInput, { target: { files: [coverFile] } });
    fireEvent.click(screen.getByRole("button", { name: "保存修改" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/albums/album-001",
        expect.objectContaining({
          method: "PATCH",
          body: expect.any(FormData),
        }),
      );
    });

    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const formData = requestInit.body as FormData;

    expect(formData.get("title")).toBe("编辑后的相册");
    expect(formData.get("description")).toBe("新的相册描述");
    expect(formData.get("coverFileName")).toBe("detail-cover.png");
    expect(formData.get("coverFile")).toBeInstanceOf(File);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "编辑后的相册" })).toBeInTheDocument();
      expect(screen.getByText("新的相册描述")).toBeInTheDocument();
    });

    expect(screen.getByAltText("编辑后的相册封面背景")).toHaveAttribute("src", "/uploads/albums/album-001-detail-cover.png");
  });

  it("deletes an album from the detail actions and returns to album list", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AlbumDetailPageView album={album} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete Album" }));
    fireEvent.click(await screen.findByRole("button", { name: "确认删除" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/albums/album-001", { method: "DELETE" });
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/album");
    });
  });

  it("keeps the delete dialog open and shows the API error when delete fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "删除失败，请稍后再试" }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AlbumDetailPageView album={album} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete Album" }));
    fireEvent.click(await screen.findByRole("button", { name: "确认删除" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/albums/album-001", { method: "DELETE" });
    });

    expect(await screen.findByText("删除失败，请稍后再试")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "确认删除" })).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
    expect(screen.getByText("我的相册")).toBeInTheDocument();
  });
});
