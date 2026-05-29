import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AlbumPhoto } from "@/data/albumPhotos";
import type { Album } from "./types";
import { AlbumPhotoDetailPageView } from "./AlbumPhotoDetailPage";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("AlbumPhotoDetailPageView", () => {
  const album: Album = {
    id: "album-001",
    title: "我的相册",
    description: "原始描述",
    photoCount: 2,
    visibility: "public",
    status: "published",
    createdAt: "2023-07-31",
    sortOrder: 1,
  };
  const photo: AlbumPhoto = {
    id: "photo-001",
    albumId: "album-001",
    title: "Sleepy head...",
    uploadedAt: "Oct 24, 2023 / 4:30",
    note: "短备注",
    imageUrl: "/album-cover-placeholder.jpeg",
    imagePosition: "center 18%",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockReset();
  });

  it("edits the current photo note from the detail page", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        photo: {
          ...photo,
          note: "更新后的详情页备注",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AlbumPhotoDetailPageView album={album} nextPhotoId="photo-002" photo={photo} previousPhotoId={null} />);

    fireEvent.click(screen.getByRole("button", { name: "编辑备注" }));

    const noteInput = await screen.findByLabelText("照片备注");

    fireEvent.change(noteInput, { target: { value: "更新后的详情页备注" } });
    fireEvent.click(screen.getByRole("button", { name: "保存修改" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/albums/album-001/photos/photo-001",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            title: "Sleepy head...",
            note: "更新后的详情页备注",
          }),
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("更新后的详情页备注")).toBeInTheDocument();
    });
    expect(screen.queryByRole("dialog", { name: "编辑备注" })).not.toBeInTheDocument();
  });

  it("deletes the current photo and navigates to the next photo", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        album: {
          ...album,
          photoCount: 1,
        },
        photos: [],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AlbumPhotoDetailPageView album={album} nextPhotoId="photo-002" photo={photo} previousPhotoId={null} />);

    fireEvent.click(screen.getByRole("button", { name: "删除照片" }));
    fireEvent.click(await screen.findByRole("button", { name: "确认删除照片" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/albums/album-001/photos/photo-001", { method: "DELETE" });
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/album/album-001/photo-002");
    });
  });

  it("updates the displayed photo when route navigation provides a new photo", () => {
    const secondPhoto: AlbumPhoto = {
      ...photo,
      id: "photo-002",
      title: "第二张照片",
      note: "第二张的备注内容",
      uploadedAt: "Oct 25, 2023 / 4:30",
      imagePosition: "center 40%",
    };
    const { rerender } = render(<AlbumPhotoDetailPageView album={album} nextPhotoId="photo-002" photo={photo} previousPhotoId={null} />);

    rerender(<AlbumPhotoDetailPageView album={album} nextPhotoId={null} photo={secondPhoto} previousPhotoId="photo-001" />);

    expect(screen.getByRole("heading", { level: 1, name: "第二张照片" })).toBeInTheDocument();
    expect(screen.getByText("第二张的备注内容")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "第二张照片大图" })).toHaveStyle({ backgroundPosition: "center 40%" });
  });

  it("keeps the note area height stable between photos", () => {
    render(<AlbumPhotoDetailPageView album={album} nextPhotoId="photo-002" photo={photo} previousPhotoId={null} />);

    expect(screen.getByLabelText("照片备注内容")).toHaveClass("h-[180px]", "overflow-y-auto");
  });
});
