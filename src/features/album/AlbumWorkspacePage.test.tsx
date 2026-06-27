import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Album, AlbumPhoto } from "./types";
import { AlbumWorkspacePageView } from "./AlbumWorkspacePage";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/features/content-modules/components/ContentTabsHeader", () => ({
  ContentTabsHeader: () => <div data-testid="content-tabs-header" />,
}));

vi.mock("./albumImageVariants", () => ({
  createAlbumCoverImageVariants: vi.fn(async (file: File) => ({
    displayFile: new File(["cover-display"], `display-${file.name}`, { type: "image/webp" }),
    thumbnailFile: new File(["cover-thumbnail"], `thumbnail-${file.name}`, { type: "image/webp" }),
  })),
  createAlbumPhotoImageVariants: vi.fn(async (file: File) => ({
    displayFile: new File(["photo-display"], `display-${file.name}`, { type: "image/webp" }),
    thumbnailFile: new File(["photo-thumbnail"], `thumbnail-${file.name}`, { type: "image/webp" }),
  })),
}));

vi.mock("./AlbumFormDialog", () => ({
  AlbumFormDialog: () => null,
}));

vi.mock("./AlbumPhotoUploadDialog", () => ({
  AlbumPhotoUploadDialog: ({ onClose, onSubmit, title }: { onClose: () => void; onSubmit: (payload: { note: string; photoFile?: File }) => Promise<void>; title: string }) => (
    <div aria-label={title} role="dialog">
      <button onClick={() => void onSubmit({ note: "新照片", photoFile: new File(["photo"], "new-photo.png", { type: "image/png" }) })} type="button">
        提交上传照片
      </button>
      <button onClick={onClose} type="button">
        关闭上传照片
      </button>
    </div>
  ),
}));

const albumFixture: Album = {
  id: "album-001",
  title: "我的相册",
  description: "记录光影和猫咪。",
  coverImage: "/uploads/albums/cover-original.png",
  coverDisplayImage: "/uploads/albums/cover-display.webp",
  coverThumbnailImage: "/uploads/albums/cover-thumbnail.webp",
  photoCount: 3,
  visibility: "public",
  status: "published",
  createdAt: "2023-07-31",
  sortOrder: 1,
};

const secondAlbumFixture: Album = {
  id: "album-002",
  title: "第二本相册",
  description: "另一组照片。",
  coverImage: "/uploads/albums/cover-002-original.png",
  coverDisplayImage: "/uploads/albums/cover-002-display.webp",
  coverThumbnailImage: "/uploads/albums/cover-002-thumbnail.webp",
  photoCount: 1,
  visibility: "public",
  status: "published",
  createdAt: "2023-08-01",
  sortOrder: 2,
};

const photoFixtures: AlbumPhoto[] = [
  {
    id: "photo-001",
    albumId: "album-001",
    uploadedAt: "2023-07-31 / 10:00",
    note: "第一张照片",
    imageUrl: "/uploads/albums/photo-001.png",
    displayUrl: "/uploads/albums/photo-001-display.webp",
    thumbnailUrl: "/uploads/albums/photo-001-thumbnail.webp",
    imagePosition: "center center",
  },
  {
    id: "photo-002",
    albumId: "album-001",
    uploadedAt: "2023-07-31 / 10:05",
    note: "第二张照片",
    imageUrl: "/uploads/albums/photo-002.png",
    displayUrl: "/uploads/albums/photo-002-display.webp",
    thumbnailUrl: "/uploads/albums/photo-002-thumbnail.webp",
    imagePosition: "center center",
  },
  {
    id: "photo-003",
    albumId: "album-001",
    uploadedAt: "2023-07-31 / 10:10",
    note: "第三张照片",
    imageUrl: "/uploads/albums/photo-003.png",
    displayUrl: "/uploads/albums/photo-003-display.webp",
    thumbnailUrl: "/uploads/albums/photo-003-thumbnail.webp",
    imagePosition: "center center",
  },
];

const secondAlbumPhotos: AlbumPhoto[] = [
  {
    id: "photo-010",
    albumId: "album-002",
    uploadedAt: "2023-08-01 / 09:30",
    note: "第二本的照片",
    imageUrl: "/uploads/albums/photo-010.png",
    displayUrl: "/uploads/albums/photo-010-display.webp",
    thumbnailUrl: "/uploads/albums/photo-010-thumbnail.webp",
    imagePosition: "center center",
  },
];

describe("AlbumWorkspacePageView", () => {
  const imageSources: string[] = [];
  const originalImage = globalThis.Image;

  beforeEach(() => {
    pushMock.mockClear();
    imageSources.length = 0;
    window.history.replaceState({}, "", "/album?albumId=album-001");
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      if (String(input) === "/api/admin/session") {
        return {
          ok: true,
          json: async () => ({ authenticated: true }),
        } as Response;
      }

      if (String(input) === "/api/albums/album-002/photos") {
        return {
          ok: true,
          json: async () => ({ photos: secondAlbumPhotos }),
        } as Response;
      }

      if (String(input) === "/api/albums/album-001/photos" && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            album: { ...albumFixture, photoCount: 4 },
            photo: {
              id: "photo-004",
              albumId: "album-001",
              uploadedAt: "2023-07-31 / 10:15",
              note: "新照片",
              imageUrl: "/uploads/albums/photo-004.png",
              displayUrl: "/uploads/albums/photo-004-display.webp",
              thumbnailUrl: "/uploads/albums/photo-004-thumbnail.webp",
              imagePosition: "center center",
            },
            photos: [
              ...photoFixtures,
              {
                id: "photo-004",
                albumId: "album-001",
                uploadedAt: "2023-07-31 / 10:15",
                note: "新照片",
                imageUrl: "/uploads/albums/photo-004.png",
                displayUrl: "/uploads/albums/photo-004-display.webp",
                thumbnailUrl: "/uploads/albums/photo-004-thumbnail.webp",
                imagePosition: "center center",
              },
            ],
          }),
        } as Response;
      }

      if (String(input) === "/api/albums/album-001" && init?.method === "DELETE") {
        return {
          ok: true,
          json: async () => ({ success: true }),
        } as Response;
      }

      throw new Error(`Unexpected fetch: ${String(input)}`);
    });

    class MockImage {
      set src(value: string) {
        imageSources.push(value);
      }
    }

    vi.stubGlobal("Image", MockImage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    globalThis.Image = originalImage;
  });

  it("renders grid photos as lazy img elements and opens a photo locally without router.push", async () => {
    render(
      <AlbumWorkspacePageView
        initialActiveAlbum={albumFixture}
        initialActivePhoto={null}
        initialAlbums={[albumFixture]}
        initialPhotos={photoFixtures}
      />,
    );

    const coverImage = screen.getByRole("img", { name: "我的相册封面" });
    expect(coverImage).toHaveAttribute("src", "/uploads/albums/cover-thumbnail.webp");
    expect(coverImage).toHaveAttribute("loading", "lazy");
    expect(coverImage).toHaveAttribute("decoding", "async");

    const heroImage = screen.getByRole("img", { name: "我的相册封面背景" });
    expect(heroImage).toHaveAttribute("src", "/uploads/albums/cover-display.webp");
    expect(heroImage).toHaveAttribute("decoding", "async");
    expect(heroImage).toHaveAttribute("fetchpriority", "high");

    const previewImage = screen.getByRole("img", { name: "照片预览，上传于 2023-07-31 / 10:05" });
    expect(previewImage).toHaveAttribute("src", "/uploads/albums/photo-002-thumbnail.webp");
    expect(previewImage).toHaveAttribute("loading", "lazy");
    expect(previewImage).toHaveAttribute("decoding", "async");
    expect(previewImage).toHaveStyle({ objectPosition: "center center" });

    fireEvent.click(screen.getByRole("button", { name: /第二张照片/ }));

    expect(screen.getByRole("dialog", { name: "照片详情弹窗" })).toBeInTheDocument();
    const detailImage = screen.getByLabelText("照片大图，上传于 2023-07-31 / 10:05").querySelector("img");
    expect(detailImage).toHaveAttribute("src", "/uploads/albums/photo-002-display.webp");
    expect(window.location.search).toBe("?albumId=album-001&photoId=photo-002");
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("navigates to adjacent photos locally via button and keyboard", async () => {
    render(
      <AlbumWorkspacePageView
        initialActiveAlbum={albumFixture}
        initialActivePhoto={photoFixtures[0]}
        initialAlbums={[albumFixture]}
        initialPhotos={photoFixtures}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "下一张" }));

    expect(screen.getByLabelText("照片大图，上传于 2023-07-31 / 10:05")).toBeInTheDocument();
    expect(window.location.search).toBe("?albumId=album-001&photoId=photo-002");
    expect(pushMock).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "ArrowRight" });

    expect(screen.getByLabelText("照片大图，上传于 2023-07-31 / 10:10")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "下一张" })).toBeDisabled();
    expect(window.location.search).toBe("?albumId=album-001&photoId=photo-003");
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("closes the lightbox locally and removes photoId from the URL", async () => {
    render(
      <AlbumWorkspacePageView
        initialActiveAlbum={albumFixture}
        initialActivePhoto={photoFixtures[1]}
        initialAlbums={[albumFixture]}
        initialPhotos={photoFixtures}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "照片详情弹窗" })).not.toBeInTheDocument();
    });
    expect(window.location.search).toBe("?albumId=album-001");
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("switches albums locally and reuses cached photos on revisit", async () => {
    render(
      <AlbumWorkspacePageView
        initialActiveAlbum={albumFixture}
        initialActivePhoto={null}
        initialAlbums={[albumFixture, secondAlbumFixture]}
        initialPhotos={photoFixtures}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /第二本相册/ }));

    await waitFor(() => {
      expect(screen.getAllByRole("heading", { level: 2, name: "第二本相册" }).length).toBeGreaterThan(0);
    });
    expect(screen.getByText("Photos (1)")).toBeInTheDocument();
    expect(window.location.search).toBe("?albumId=album-002");
    expect(pushMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /我的相册/ }));

    await waitFor(() => {
      expect(screen.getAllByRole("heading", { level: 2, name: "我的相册" }).length).toBeGreaterThan(0);
    });
    expect(screen.getByText("Photos (3)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /第二本相册/ }));

    await waitFor(() => {
      expect(screen.getAllByRole("heading", { level: 2, name: "第二本相册" }).length).toBeGreaterThan(0);
    });

    const albumTwoFetchCalls = vi.mocked(globalThis.fetch).mock.calls.filter(([input]) => String(input) === "/api/albums/album-002/photos");
    expect(albumTwoFetchCalls).toHaveLength(1);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("replays cross-album history locally and falls back to router.push for a missing album", async () => {
    render(
      <AlbumWorkspacePageView
        initialActiveAlbum={albumFixture}
        initialActivePhoto={null}
        initialAlbums={[albumFixture, secondAlbumFixture]}
        initialPhotos={photoFixtures}
      />,
    );

    act(() => {
      window.history.pushState({}, "", "/album?albumId=album-002&photoId=photo-010");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    await waitFor(() => {
      expect(screen.getAllByRole("heading", { level: 2, name: "第二本相册" }).length).toBeGreaterThan(0);
    });
    expect(screen.getByRole("dialog", { name: "照片详情弹窗" })).toBeInTheDocument();
    expect(screen.getByLabelText("照片大图，上传于 2023-08-01 / 09:30")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();

    act(() => {
      window.history.pushState({}, "", "/album?albumId=album-999&photoId=photo-999");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(pushMock).toHaveBeenCalledWith("/album?albumId=album-999&photoId=photo-999");
  });

  it("keeps the upload album selected and appends the new photo after upload succeeds", async () => {
    render(
      <AlbumWorkspacePageView
        initialActiveAlbum={albumFixture}
        initialActivePhoto={null}
        initialAlbums={[albumFixture, secondAlbumFixture]}
        initialPhotos={photoFixtures}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "上传照片" })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "上传照片" }));
    expect(screen.getByRole("dialog", { name: "上传照片" })).toBeInTheDocument();
    expect(screen.getByText("Photos (3)")).toBeInTheDocument();
    expect(screen.getByText("第一张照片")).toBeInTheDocument();
    expect(screen.getByText("第二张照片")).toBeInTheDocument();
    expect(screen.getByText("第三张照片")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "提交上传照片" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "上传照片" })).not.toBeInTheDocument();
    });
    expect(screen.getAllByRole("heading", { level: 2, name: "我的相册" }).length).toBeGreaterThan(0);
    expect(screen.getByText("Photos (4)")).toBeInTheDocument();
    expect(screen.getByText("新照片")).toBeInTheDocument();
    expect(window.location.search).toBe("?albumId=album-001");
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("keeps the URL-selected album when initial props refresh with the default album", async () => {
    window.history.replaceState({}, "", "/album?albumId=album-002");
    const { rerender } = render(
      <AlbumWorkspacePageView
        initialActiveAlbum={secondAlbumFixture}
        initialActivePhoto={null}
        initialAlbums={[albumFixture, secondAlbumFixture]}
        initialPhotos={secondAlbumPhotos}
      />,
    );

    expect(screen.getAllByRole("heading", { level: 2, name: "第二本相册" }).length).toBeGreaterThan(0);

    rerender(
      <AlbumWorkspacePageView
        initialActiveAlbum={albumFixture}
        initialActivePhoto={null}
        initialAlbums={[albumFixture, secondAlbumFixture]}
        initialPhotos={photoFixtures}
      />,
    );

    expect(screen.getAllByRole("heading", { level: 2, name: "第二本相册" }).length).toBeGreaterThan(0);
    expect(window.location.search).toBe("?albumId=album-002");
  });

  it("keeps the uploading album selected when initial props refresh after upload", async () => {
    window.history.replaceState({}, "", "/album?albumId=album-001");
    const { rerender } = render(
      <AlbumWorkspacePageView
        initialActiveAlbum={albumFixture}
        initialActivePhoto={null}
        initialAlbums={[albumFixture, secondAlbumFixture]}
        initialPhotos={photoFixtures}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "上传照片" })).toBeEnabled();
    });
    fireEvent.click(screen.getByRole("button", { name: "上传照片" }));
    fireEvent.click(screen.getByRole("button", { name: "提交上传照片" }));

    await waitFor(() => {
      expect(screen.getByText("Photos (4)")).toBeInTheDocument();
    });

    rerender(
      <AlbumWorkspacePageView
        initialActiveAlbum={secondAlbumFixture}
        initialActivePhoto={null}
        initialAlbums={[albumFixture, secondAlbumFixture]}
        initialPhotos={secondAlbumPhotos}
      />,
    );

    expect(screen.getAllByRole("heading", { level: 2, name: "我的相册" }).length).toBeGreaterThan(0);
    expect(window.location.search).toBe("?albumId=album-001");
  });

  it("shows the album photo count while an uncached album is loading", async () => {
    let resolvePhotos: (value: Response) => void = () => undefined;
    vi.mocked(globalThis.fetch).mockImplementation(async (input) => {
      if (String(input) === "/api/admin/session") {
        return {
          ok: true,
          json: async () => ({ authenticated: true }),
        } as Response;
      }

      if (String(input) === "/api/albums/album-002/photos") {
        return new Promise<Response>((resolve) => {
          resolvePhotos = resolve;
        });
      }

      throw new Error(`Unexpected fetch: ${String(input)}`);
    });

    render(
      <AlbumWorkspacePageView
        initialActiveAlbum={albumFixture}
        initialActivePhoto={null}
        initialAlbums={[albumFixture, secondAlbumFixture]}
        initialPhotos={photoFixtures}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /第二本相册/ }));

    expect(window.location.search).toBe("?albumId=album-002");
    expect(await screen.findByText("正在加载这个相册的照片")).toBeInTheDocument();
    expect(screen.getByText("Photos (1)")).toBeInTheDocument();
    expect(screen.queryByText("这个相册还没有照片")).not.toBeInTheDocument();

    await act(async () => {
      resolvePhotos({
        ok: true,
        json: async () => ({ photos: secondAlbumPhotos }),
      } as Response);
    });

    await waitFor(() => {
      expect(screen.getByText("Photos (1)")).toBeInTheDocument();
    });
  });

  it("preloads adjacent images for the active photo", async () => {
    render(
      <AlbumWorkspacePageView
        initialActiveAlbum={albumFixture}
        initialActivePhoto={photoFixtures[1]}
        initialAlbums={[albumFixture]}
        initialPhotos={photoFixtures}
      />,
    );

    await waitFor(() => {
      expect(imageSources).toContain("/uploads/albums/photo-001-display.webp");
      expect(imageSources).toContain("/uploads/albums/photo-003-display.webp");
    });
  });

  it("deletes the current album locally without router.push and switches to the next album", async () => {
    render(
      <AlbumWorkspacePageView
        initialActiveAlbum={albumFixture}
        initialActivePhoto={null}
        initialAlbums={[albumFixture, secondAlbumFixture]}
        initialDeleteAlbumCandidate={albumFixture}
        initialPhotos={photoFixtures}
      />,
    );

    const dialog = screen.getByRole("heading", { level: 2, name: "删除相册" }).closest("div");
    expect(dialog).not.toBeNull();

    fireEvent.click(within(dialog as HTMLElement).getByRole("button", { name: "确认删除" }));

    await waitFor(() => {
      expect(screen.queryByText("我的相册")).not.toBeInTheDocument();
    });

    expect(screen.getAllByRole("heading", { level: 2, name: "第二本相册" }).length).toBeGreaterThan(0);
    expect(screen.getByText("Photos (1)")).toBeInTheDocument();
    expect(window.location.search).toBe("?albumId=album-002");
    expect(pushMock).not.toHaveBeenCalled();
  });
});
