import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Album } from "./types";
import { AlbumFormDialog } from "./AlbumFormDialog";

describe("AlbumFormDialog", () => {
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
  });

  it("submits title, description, and cover file for edit mode", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <AlbumFormDialog
        album={album}
        heading="编辑相册"
        onClose={vi.fn()}
        onSubmit={onSubmit}
        submitErrorMessage="编辑相册失败"
        submitLabel="保存修改"
      />,
    );

    const titleInput = screen.getByLabelText("相册名称");
    const noteInput = screen.getByLabelText("备注/留言");
    const coverInput = screen.getByLabelText("上传本地封面");
    const coverFile = new File(["shared-cover"], "shared-cover.png", { type: "image/png" });

    fireEvent.change(titleInput, { target: { value: "编辑后的相册" } });
    fireEvent.change(noteInput, { target: { value: "新的相册描述" } });
    fireEvent.change(coverInput, { target: { files: [coverFile] } });
    fireEvent.click(screen.getByRole("button", { name: "保存修改" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: "编辑后的相册",
        description: "新的相册描述",
        coverFile,
      });
    });
  });

  it("removes emoji ornaments and shows a delete action in edit mode", () => {
    const onDelete = vi.fn();

    render(
      <AlbumFormDialog
        album={album}
        heading="编辑相册"
        onClose={vi.fn()}
        onDelete={onDelete}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        submitErrorMessage="编辑相册失败"
        submitLabel="保存修改"
      />,
    );

    expect(screen.getByRole("button", { name: "删除相册" })).toBeInTheDocument();
    expect(screen.queryByText("🌥️")).not.toBeInTheDocument();
    expect(screen.queryByText("⭐")).not.toBeInTheDocument();
    expect(screen.queryByText("🐱")).not.toBeInTheDocument();
    expect(screen.queryByText("😊")).not.toBeInTheDocument();
    expect(screen.queryByText("💙")).not.toBeInTheDocument();
    expect(screen.queryByText("❤️")).not.toBeInTheDocument();
    expect(screen.queryByText("🐾")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "删除相册" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
