import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Album } from "./types";
import { AlbumPageView } from "./AlbumPage";

function mockAlbumPageFetch(handler?: (input: RequestInfo | URL, init?: RequestInit) => unknown | Promise<unknown>, authenticated = true) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input) === "/api/admin/session") {
      const method = init?.method ?? "GET";

      if (method === "POST") {
        return { ok: true, json: async () => ({ authenticated: true }) };
      }

      if (method === "DELETE") {
        return { ok: true, json: async () => ({ authenticated: false }) };
      }

      return { ok: true, json: async () => ({ authenticated }) };
    }

    return (await handler?.(input, init)) ?? { ok: true, json: async () => ({}) };
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function findFetchCall(fetchMock: ReturnType<typeof vi.fn>, url: string, method?: string) {
  return fetchMock.mock.calls.find(([input, init]) => String(input) === url && (!method || (init as RequestInit | undefined)?.method === method));
}

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

  it("renders the shared diary tabs header and album action bar", async () => {
    mockAlbumPageFetch();

    render(<AlbumPageView initialAlbums={[album]} />);

    const navigation = screen.getByRole("navigation", { name: "内容页导航" });

    expect(navigation).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回首页小镇" })).toHaveAttribute("href", "/");
    expect(within(navigation).getByText("个人相册")).toHaveClass("rounded-full", "bg-[#ffb9c8]");
    expect(screen.getByRole("button", { name: "新建相册" })).toBeInTheDocument();
    expect(await screen.findByText("已解锁")).toBeInTheDocument();
  });

  it("shows locked management state before admin unlock", async () => {
    mockAlbumPageFetch(undefined, false);

    render(<AlbumPageView initialAlbums={[album]} />);

    expect(await screen.findByText("未解锁")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "新建相册" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /更多/i })).toBeDisabled();
  });

  it("unlocks admin management from the album page", async () => {
    const fetchMock = mockAlbumPageFetch(undefined, false);

    render(<AlbumPageView initialAlbums={[album]} />);

    await screen.findByText("未解锁");
    fireEvent.change(screen.getByLabelText("管理 Token"), { target: { value: "test-token" } });
    fireEvent.click(screen.getByRole("button", { name: "解锁管理" }));

    expect(await screen.findByText("已解锁")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "新建相册" })).not.toBeDisabled();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/session",
      expect.objectContaining({
        body: JSON.stringify({ token: "test-token" }),
        credentials: "same-origin",
        method: "POST",
      }),
    );
  });

  it("edits an album from the more menu, uploads a new cover, and updates the card", async () => {
    const fetchMock = mockAlbumPageFetch(async (input) => {
      if (String(input) === "/api/albums/album-001") {
        return {
          ok: true,
          json: async () => ({
            album: {
              ...album,
              title: "编辑后的相册",
              description: "新的相册描述",
              coverImage: "/uploads/albums/album-001-replacement-cover.png",
            },
          }),
        };
      }
    });

    render(<AlbumPageView initialAlbums={[album]} />);

    await screen.findByText("已解锁");
    fireEvent.click(screen.getByRole("button", { name: /更多/i }));
    fireEvent.click(screen.getByRole("button", { name: "编辑相册" }));

    const titleInput = await screen.findByLabelText("相册名称");
    const noteInput = screen.getByLabelText("备注/留言");
    const coverInput = screen.getByLabelText("上传本地封面");
    const coverFile = new File(["replacement-cover"], "replacement-cover.png", { type: "image/png" });

    fireEvent.change(titleInput, { target: { value: "编辑后的相册" } });
    fireEvent.change(noteInput, { target: { value: "新的相册描述" } });
    fireEvent.change(coverInput, { target: { files: [coverFile] } });
    fireEvent.click(screen.getByRole("button", { name: "保存修改" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/albums/album-001",
        expect.objectContaining({
          credentials: "same-origin",
          method: "PATCH",
          body: expect.any(FormData),
        }),
      );
    });

    const requestCall = findFetchCall(fetchMock, "/api/albums/album-001", "PATCH");
    const requestInit = requestCall?.[1] as RequestInit | undefined;
    const formData = requestInit?.body as FormData;

    expect(formData.get("title")).toBe("编辑后的相册");
    expect(formData.get("description")).toBe("新的相册描述");
    expect(formData.get("coverFileName")).toBe("replacement-cover.png");
    expect(formData.get("coverFile")).toBeInstanceOf(File);

    await waitFor(() => {
      expect(screen.getByText("编辑后的相册")).toBeInTheDocument();
      expect(screen.getByText("新的相册描述")).toBeInTheDocument();
      expect(screen.queryByText("album-001-replacement-cover.png")).not.toBeInTheDocument();
    });
  });

  it("deletes an album from the more menu after confirmation", async () => {
    const fetchMock = mockAlbumPageFetch(async (input) => {
      if (String(input) === "/api/albums/album-001") {
        return { ok: true, json: async () => ({ success: true }) };
      }
    });

    render(<AlbumPageView initialAlbums={[album]} />);

    await screen.findByText("已解锁");
    fireEvent.click(screen.getByRole("button", { name: /更多/i }));
    fireEvent.click(screen.getByRole("button", { name: "删除相册" }));
    fireEvent.click(await screen.findByRole("button", { name: "确认删除" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/albums/album-001", { credentials: "same-origin", method: "DELETE" });
    });

    await waitFor(() => {
      expect(screen.queryByText("我的相册")).not.toBeInTheDocument();
    });
  });

  it("keeps the delete dialog open and shows the API error when delete fails", async () => {
    const fetchMock = mockAlbumPageFetch(async (input) => {
      if (String(input) === "/api/albums/album-001") {
        return { ok: false, json: async () => ({ error: "删除失败，请稍后再试" }) };
      }
    });

    render(<AlbumPageView initialAlbums={[album]} />);

    await screen.findByText("已解锁");
    fireEvent.click(screen.getByRole("button", { name: /更多/i }));
    fireEvent.click(screen.getByRole("button", { name: "删除相册" }));
    fireEvent.click(await screen.findByRole("button", { name: "确认删除" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/albums/album-001", { credentials: "same-origin", method: "DELETE" });
    });

    expect(await screen.findByText("删除失败，请稍后再试")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "确认删除" })).toBeInTheDocument();
    expect(screen.getByText("我的相册")).toBeInTheDocument();
  });

  it("shows a clear message when album creation hits admin auth", async () => {
    const fetchMock = mockAlbumPageFetch(async (input) => {
      if (String(input) === "/api/albums") {
        return { ok: false, json: async () => ({ error: "无权限新增相册" }) };
      }
    });

    render(<AlbumPageView initialAlbums={[album]} />);

    await screen.findByText("已解锁");
    fireEvent.click(screen.getByRole("button", { name: "新建相册" }));
    fireEvent.change(screen.getByLabelText("相册名称"), { target: { value: "夏日收藏夹" } });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(await screen.findByText("请先解锁管理")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/albums",
      expect.objectContaining({ credentials: "same-origin", method: "POST" }),
    );
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

      mockAlbumPageFetch();
      render(<AlbumPageView initialAlbums={[album]} />);

      await screen.findByText("已解锁");
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

      mockAlbumPageFetch();
      render(<AlbumPageView initialAlbums={[album]} />);

      await screen.findByText("已解锁");
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
