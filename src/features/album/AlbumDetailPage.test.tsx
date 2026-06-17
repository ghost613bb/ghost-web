import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Album } from "./types";
import { AlbumDetailPageView } from "./AlbumDetailPage";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

function mockAlbumDetailFetch(handler?: (input: RequestInfo | URL, init?: RequestInit) => unknown | Promise<unknown>, authenticated = true) {
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
  const initialPhotos = [
    {
      id: "photo-001",
      albumId: "album-001",
      title: "Sleepy head...",
      uploadedAt: "Oct 24, 2023 / 4:30",
      note: "原始备注",
      imageUrl: "/album-cover-placeholder.jpeg",
      imagePosition: "center 18%",
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockReset();
  });

  it("shows locked management state before admin unlock", async () => {
    mockAlbumDetailFetch(undefined, false);

    render(<AlbumDetailPageView album={album} initialPhotos={initialPhotos} />);

    expect(await screen.findByText("未解锁")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload Photos" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Edit Album" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete Album" })).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "编辑照片" })[0]).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "删除照片" })[0]).toBeDisabled();
  });

  it("unlocks admin management from the album detail page", async () => {
    const fetchMock = mockAlbumDetailFetch(undefined, false);

    render(<AlbumDetailPageView album={album} initialPhotos={initialPhotos} />);

    await screen.findByText("未解锁");
    fireEvent.change(screen.getByLabelText("管理 Token"), { target: { value: "test-token" } });
    fireEvent.click(screen.getByRole("button", { name: "解锁管理" }));

    expect(await screen.findByText("已解锁")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload Photos" })).not.toBeDisabled();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/session",
      expect.objectContaining({
        body: JSON.stringify({ token: "test-token" }),
        credentials: "same-origin",
        method: "POST",
      }),
    );
  });

  it("edits an album from the detail actions, uploads a new cover, and updates the page", async () => {
    const fetchMock = mockAlbumDetailFetch(async (input) => {
      if (String(input) === "/api/albums/album-001") {
        return {
          ok: true,
          json: async () => ({
            album: {
              ...album,
              title: "编辑后的相册",
              description: "新的相册描述",
              coverImage: "/uploads/albums/album-001-detail-cover.png",
            },
          }),
        };
      }
    });

    render(<AlbumDetailPageView album={album} initialPhotos={initialPhotos} />);

    await screen.findByText("已解锁");
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
    expect(formData.get("coverFileName")).toBe("detail-cover.png");
    expect(formData.get("coverFile")).toBeInstanceOf(File);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "编辑后的相册" })).toBeInTheDocument();
      expect(screen.getByText("新的相册描述")).toBeInTheDocument();
    });

    expect(screen.getByAltText("编辑后的相册封面背景")).toHaveAttribute("src", "/uploads/albums/album-001-detail-cover.png");
  });

  it("uses the rendered photo list length for the photo count", async () => {
    mockAlbumDetailFetch();
    render(<AlbumDetailPageView album={album} initialPhotos={initialPhotos} />);

    expect(screen.getByText("Photos (1) - Sorted by Date")).toBeInTheDocument();
    expect(screen.queryByText("Photos (22) - Sorted by Date")).not.toBeInTheDocument();
    expect(await screen.findByText("已解锁")).toBeInTheDocument();
  });

  it("uploads photos from the detail actions and adds them to the page", async () => {
    const photoFile = new File(["detail-photo"], "detail-photo.png", { type: "image/png" });
    const fetchMock = mockAlbumDetailFetch(async (input) => {
      if (String(input) === "/api/albums/album-001/photos") {
        return {
          ok: true,
          json: async () => ({
            album: {
              ...album,
              photoCount: 2,
            },
            photos: [
              {
                id: "photo-001",
                albumId: "album-001",
                title: "Sleepy head...",
                uploadedAt: "Oct 24, 2023 / 4:30",
                note: "原始备注",
                imageUrl: "/album-cover-placeholder.jpeg",
                imagePosition: "center 18%",
              },
              {
                id: "photo-008",
                albumId: "album-001",
                title: "detail-photo",
                uploadedAt: "2026-05-28 / 10:00",
                note: "新上传的照片",
                imageUrl: "/uploads/albums/album-001-photo-008-detail-photo.png",
                imagePosition: "center center",
              },
            ],
          }),
        };
      }
    });

    render(<AlbumDetailPageView album={album} initialPhotos={initialPhotos} />);

    await screen.findByText("已解锁");
    fireEvent.click(screen.getByRole("button", { name: "Upload Photos" }));

    const titleInput = await screen.findByLabelText("照片标题");
    const noteInput = screen.getByLabelText("照片备注");
    const fileInput = screen.getByLabelText("上传照片文件");

    fireEvent.change(titleInput, { target: { value: "detail-photo" } });
    fireEvent.change(noteInput, { target: { value: "新上传的照片" } });
    fireEvent.change(fileInput, { target: { files: [photoFile] } });
    fireEvent.click(screen.getByRole("button", { name: "上传照片" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/albums/album-001/photos",
        expect.objectContaining({
          credentials: "same-origin",
          method: "POST",
          body: expect.any(FormData),
        }),
      );
    });

    const requestCall = findFetchCall(fetchMock, "/api/albums/album-001/photos", "POST");
    const requestInit = requestCall?.[1] as RequestInit | undefined;
    const formData = requestInit?.body as FormData;

    expect(formData.get("title")).toBe("detail-photo");
    expect(formData.get("note")).toBe("新上传的照片");
    expect(formData.get("photoFileName")).toBe("detail-photo.png");
    expect(formData.get("photoFile")).toBeInstanceOf(File);

    await waitFor(() => {
      expect(screen.getByText("Photos (2) - Sorted by Date")).toBeInTheDocument();
      expect(screen.getByText("detail-photo")).toBeInTheDocument();
    });
  });

  it("edits a photo from its card action and updates the page", async () => {
    const fetchMock = mockAlbumDetailFetch(async (input) => {
      if (String(input) === "/api/albums/album-001/photos/photo-001") {
        return {
          ok: true,
          json: async () => ({
            photo: {
              ...initialPhotos[0],
              title: "改名后的照片",
              note: "更新后的备注",
            },
          }),
        };
      }
    });

    render(<AlbumDetailPageView album={album} initialPhotos={initialPhotos} />);

    await screen.findByText("已解锁");
    fireEvent.click(screen.getAllByRole("button", { name: "编辑照片" })[0]);

    const titleInput = await screen.findByLabelText("照片标题");
    const noteInput = screen.getByLabelText("照片备注");

    fireEvent.change(titleInput, { target: { value: "改名后的照片" } });
    fireEvent.change(noteInput, { target: { value: "更新后的备注" } });
    fireEvent.click(screen.getByRole("button", { name: "保存修改" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/albums/album-001/photos/photo-001",
        expect.objectContaining({
          credentials: "same-origin",
          method: "PATCH",
          body: JSON.stringify({
            title: "改名后的照片",
            note: "更新后的备注",
          }),
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("改名后的照片")).toBeInTheDocument();
    });
    expect(screen.getByText("Photos (1) - Sorted by Date")).toBeInTheDocument();
  });

  it("deletes a photo from its card action and updates the page count", async () => {
    const fetchMock = mockAlbumDetailFetch(async (input) => {
      if (String(input) === "/api/albums/album-001/photos/photo-001") {
        return {
          ok: true,
          json: async () => ({
            album: {
              ...album,
              photoCount: 0,
            },
            photos: [],
          }),
        };
      }
    });

    render(<AlbumDetailPageView album={album} initialPhotos={initialPhotos} />);

    await screen.findByText("已解锁");
    fireEvent.click(screen.getAllByRole("button", { name: "删除照片" })[0]);
    fireEvent.click(await screen.findByRole("button", { name: "确认删除照片" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/albums/album-001/photos/photo-001", { credentials: "same-origin", method: "DELETE" });
    });

    await waitFor(() => {
      expect(screen.queryByText("Sleepy head...")).not.toBeInTheDocument();
      expect(screen.getByText("Photos (0) - Sorted by Date")).toBeInTheDocument();
    });
  });

  it("deletes an album from the detail actions and returns to album list", async () => {
    const fetchMock = mockAlbumDetailFetch(async (input) => {
      if (String(input) === "/api/albums/album-001") {
        return { ok: true, json: async () => ({ success: true }) };
      }
    });

    render(<AlbumDetailPageView album={album} initialPhotos={initialPhotos} />);

    await screen.findByText("已解锁");
    fireEvent.click(screen.getByRole("button", { name: "Delete Album" }));
    fireEvent.click(await screen.findByRole("button", { name: "确认删除" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/albums/album-001", { credentials: "same-origin", method: "DELETE" });
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/album");
    });
  });

  it("keeps the delete dialog open and shows the API error when delete fails", async () => {
    const fetchMock = mockAlbumDetailFetch(async (input) => {
      if (String(input) === "/api/albums/album-001") {
        return { ok: false, json: async () => ({ error: "删除失败，请稍后再试" }) };
      }
    });

    render(<AlbumDetailPageView album={album} initialPhotos={initialPhotos} />);

    await screen.findByText("已解锁");
    fireEvent.click(screen.getByRole("button", { name: "Delete Album" }));
    fireEvent.click(await screen.findByRole("button", { name: "确认删除" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/albums/album-001", { credentials: "same-origin", method: "DELETE" });
    });

    expect(await screen.findByText("删除失败，请稍后再试")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "确认删除" })).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
    expect(screen.getByText("我的相册")).toBeInTheDocument();
  });

  it("shows a clear message when photo upload hits admin auth", async () => {
    const fetchMock = mockAlbumDetailFetch(async (input) => {
      if (String(input) === "/api/albums/album-001/photos") {
        return { ok: false, json: async () => ({ error: "无权限上传照片" }) };
      }
    });

    render(<AlbumDetailPageView album={album} initialPhotos={initialPhotos} />);

    await screen.findByText("已解锁");
    fireEvent.click(screen.getByRole("button", { name: "Upload Photos" }));

    const fileInput = await screen.findByLabelText("上传照片文件");
    fireEvent.change(fileInput, { target: { files: [new File(["detail-photo"], "detail-photo.png", { type: "image/png" })] } });
    fireEvent.click(screen.getByRole("button", { name: "上传照片" }));

    expect(await screen.findByText("请先解锁管理")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/albums/album-001/photos",
      expect.objectContaining({ credentials: "same-origin", method: "POST" }),
    );
  });
});
