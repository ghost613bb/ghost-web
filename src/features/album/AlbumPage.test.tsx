import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Album } from "./types";
import { AlbumPageView } from "./AlbumPage";

describe("AlbumPageView", () => {
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

  it("edits an album from the more menu and updates the card", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        album: {
          ...album,
          title: "编辑后的相册",
          description: "新的相册描述",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AlbumPageView initialAlbums={[album]} />);

    fireEvent.click(screen.getByRole("button", { name: /更多/i }));
    fireEvent.click(screen.getByRole("button", { name: "编辑相册" }));

    const titleInput = await screen.findByLabelText("相册名称");
    const noteInput = screen.getByLabelText("备注/留言");

    fireEvent.change(titleInput, { target: { value: "编辑后的相册" } });
    fireEvent.change(noteInput, { target: { value: "新的相册描述" } });
    fireEvent.click(screen.getByRole("button", { name: "保存修改" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/albums/album-001",
        expect.objectContaining({
          method: "PATCH",
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("编辑后的相册")).toBeInTheDocument();
      expect(screen.getByText("新的相册描述")).toBeInTheDocument();
    });
  });

  it("deletes an album from the more menu after confirmation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AlbumPageView initialAlbums={[album]} />);

    fireEvent.click(screen.getByRole("button", { name: /更多/i }));
    fireEvent.click(screen.getByRole("button", { name: "删除相册" }));
    fireEvent.click(await screen.findByRole("button", { name: "确认删除" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/albums/album-001", { method: "DELETE" });
    });

    await waitFor(() => {
      expect(screen.queryByText("我的相册")).not.toBeInTheDocument();
    });
  });

  it("keeps the delete dialog open and shows the API error when delete fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "删除失败，请稍后再试" }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AlbumPageView initialAlbums={[album]} />);

    fireEvent.click(screen.getByRole("button", { name: /更多/i }));
    fireEvent.click(screen.getByRole("button", { name: "删除相册" }));
    fireEvent.click(await screen.findByRole("button", { name: "确认删除" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/albums/album-001", { method: "DELETE" });
    });

    expect(await screen.findByText("删除失败，请稍后再试")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "确认删除" })).toBeInTheDocument();
    expect(screen.getByText("我的相册")).toBeInTheDocument();
  });

  it("positions the more menu above the trigger when there is not enough space below", async () => {
    const originalInnerHeight = window.innerHeight;
    const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

    try {
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: 640,
      });

      HTMLElement.prototype.getBoundingClientRect = vi.fn(function (this: HTMLElement) {
        if (this.getAttribute("aria-haspopup") === "menu") {
          return {
            bottom: 620,
            height: 32,
            left: 0,
            right: 80,
            top: 588,
            width: 80,
            x: 0,
            y: 588,
            toJSON: () => ({}),
          };
        }

        if (this.textContent?.includes("编辑相册") && this.textContent?.includes("删除相册")) {
          return {
            bottom: 760,
            height: 140,
            left: 0,
            right: 152,
            top: 620,
            width: 152,
            x: 0,
            y: 620,
            toJSON: () => ({}),
          };
        }

        return originalGetBoundingClientRect.call(this);
      });

      render(<AlbumPageView initialAlbums={[album]} />);

      fireEvent.click(screen.getByRole("button", { name: /更多/i }));

      const menu = screen.getByText("编辑相册").closest("div") as HTMLDivElement;

      await waitFor(() => {
        expect(menu.className).toContain("bottom-");
        expect(menu.className).not.toContain("top-[calc(100%+0.45rem)]");
      });
    } finally {
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: originalInnerHeight,
      });
      HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    }
  });

  it("limits the menu height when neither side has enough space", async () => {
    const originalInnerHeight = window.innerHeight;
    const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

    try {
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: 200,
      });

      HTMLElement.prototype.getBoundingClientRect = vi.fn(function (this: HTMLElement) {
        if (this.getAttribute("aria-haspopup") === "menu") {
          return {
            bottom: 140,
            height: 32,
            left: 0,
            right: 80,
            top: 108,
            width: 80,
            x: 0,
            y: 108,
            toJSON: () => ({}),
          };
        }

        if (this.textContent?.includes("编辑相册") && this.textContent?.includes("删除相册")) {
          return {
            bottom: 320,
            height: 180,
            left: 0,
            right: 152,
            top: 140,
            width: 152,
            x: 0,
            y: 140,
            toJSON: () => ({}),
          };
        }

        return originalGetBoundingClientRect.call(this);
      });

      render(<AlbumPageView initialAlbums={[album]} />);

      fireEvent.click(screen.getByRole("button", { name: /更多/i }));

      const menu = screen.getByText("编辑相册").closest("div") as HTMLDivElement;

      await waitFor(() => {
        expect(menu.style.maxHeight).toBe("100px");
      });
    } finally {
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: originalInnerHeight,
      });
      HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    }
  });
});
