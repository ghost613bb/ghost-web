import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

vi.mock("./AlbumFormDialog", () => ({
  AlbumFormDialog: () => null,
}));

vi.mock("./AlbumPhotoUploadDialog", () => ({
  AlbumPhotoUploadDialog: () => null,
}));

const albumFixture: Album = {
  id: "album-001",
  title: "我的相册",
  description: "记录光影和猫咪。",
  photoCount: 3,
  visibility: "public",
  status: "published",
  createdAt: "2023-07-31",
  sortOrder: 1,
};

const photoFixtures: AlbumPhoto[] = [
  {
    id: "photo-001",
    albumId: "album-001",
    uploadedAt: "2023-07-31 / 10:00",
    note: "第一张照片",
    imageUrl: "/uploads/albums/photo-001.png",
    imagePosition: "center center",
  },
  {
    id: "photo-002",
    albumId: "album-001",
    uploadedAt: "2023-07-31 / 10:05",
    note: "第二张照片",
    imageUrl: "/uploads/albums/photo-002.png",
    imagePosition: "center center",
  },
  {
    id: "photo-003",
    albumId: "album-001",
    uploadedAt: "2023-07-31 / 10:10",
    note: "第三张照片",
    imageUrl: "/uploads/albums/photo-003.png",
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
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      if (String(input) === "/api/admin/session") {
        return {
          ok: true,
          json: async () => ({ authenticated: false }),
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

  it("opens a photo locally and updates the URL without router.push", async () => {
    render(
      <AlbumWorkspacePageView
        initialActiveAlbum={albumFixture}
        initialActivePhoto={null}
        initialAlbums={[albumFixture]}
        initialPhotos={photoFixtures}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /第二张照片/ }));

    expect(screen.getByRole("dialog", { name: "照片详情弹窗" })).toBeInTheDocument();
    expect(screen.getByLabelText("照片大图，上传于 2023-07-31 / 10:05")).toBeInTheDocument();
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

  it("replays same-album photo history on popstate and falls back to router.push for another album", async () => {
    render(
      <AlbumWorkspacePageView
        initialActiveAlbum={albumFixture}
        initialActivePhoto={photoFixtures[1]}
        initialAlbums={[albumFixture]}
        initialPhotos={photoFixtures}
      />,
    );

    act(() => {
      window.history.pushState({}, "", "/album?albumId=album-001&photoId=photo-001");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(screen.getByLabelText("照片大图，上传于 2023-07-31 / 10:00")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();

    act(() => {
      window.history.pushState({}, "", "/album?albumId=album-002&photoId=photo-999");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(pushMock).toHaveBeenCalledWith("/album?albumId=album-002&photoId=photo-999");
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
      expect(imageSources).toContain("/uploads/albums/photo-001.png");
      expect(imageSources).toContain("/uploads/albums/photo-003.png");
    });
  });
});
