import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Album } from "@/features/album/types";
import AboutPage from "./about/page";
import AlbumDetailPage from "./album/[albumId]/page";
import AlbumPhotoDetailPage from "./album/[albumId]/[photoId]/page";
import AlbumPage from "./album/page";
import CoffeePage from "./coffee/page";
import MessagePage from "./message/page";
import PlaylistsPage from "./playlists/page";
import ThoughtsPage from "./thoughts/page";
import ThoughtDetailPage from "./thoughts/[slug]/page";
import NewThoughtPage from "./thoughts/new/page";
import TodoPage from "./todo/page";
import { thoughts } from "@/data/thoughts";
import { resetDisplayModes, updateDisplayMode } from "@/features/module-display-mode/service";
import { resetStoredAlbums, upsertStoredAlbum, upsertStoredAlbumPhoto } from "@/features/album/repository";
import * as albumService from "@/features/album/service";
import { resetStoredThoughts } from "@/features/thoughts/repository";

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
  };
});

vi.mock("@tiptap/react", () => {
  const chain = {
    focus: () => chain,
    run: () => true,
    setColor: () => chain,
    setImage: () => chain,
    setParagraph: () => chain,
    setVideo: () => chain,
    toggleBlockquote: () => chain,
    toggleBold: () => chain,
    toggleBulletList: () => chain,
    toggleOrderedList: () => chain,
    toggleTaskList: () => chain,
    toggleHeading: () => chain,
    toggleItalic: () => chain,
    toggleStrike: () => chain,
    toggleUnderline: () => chain,
    undo: () => chain,
    unsetColor: () => chain,
  };

  return {
    EditorContent: () => <div aria-label="富文本编辑区" />,
    useEditor: () => ({
      can: () => ({ undo: () => false }),
      chain: () => chain,
      isActive: () => false,
    }),
    useEditorState: () => ({
      canUndo: false,
      isBlockquote: false,
      isBold: false,
      isBulletList: false,
      isH1: false,
      isH2: false,
      isH3: false,
      isH4: false,
      isH5: false,
      isH6: false,
      isItalic: false,
      isOrderedList: false,
      isStrike: false,
      isTaskList: false,
      isUnderline: false,
    }),
  };
});

vi.mock("@tiptap/starter-kit", () => ({ default: { configure: () => ({}) } }));

type JsonResponse = {
  json: () => Promise<unknown>;
  ok: boolean;
};

const albumServiceFallbackAlbum: Album = {
  id: "album-001",
  title: "我的相册",
  description: "诗注：小妞写，图片，女孩子的碎片收藏。",
  photoCount: 22,
  visibility: "public",
  status: "published",
  createdAt: "2023-07-31",
  sortOrder: 1,
};

describe("content module pages", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T10:00:00.000Z"));
    vi.spyOn(albumService, "getAlbumById").mockImplementation(async (id) => (id === "album-001" ? albumServiceFallbackAlbum : null));
    await resetDisplayModes();
    await resetStoredAlbums();
    await resetStoredThoughts();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders the about page heading", async () => {
    render(await AboutPage());

    expect(screen.getByRole("heading", { level: 1, name: "心情日记" })).toBeInTheDocument();
  });

  it("renders the about demo page in demo mode", async () => {
    await updateDisplayMode("about", "demo");

    render(await AboutPage());

    expect(screen.getByRole("heading", { level: 1, name: "心情日记-演示模式" })).toBeInTheDocument();
    expect(screen.getByText("这是心情日记模块的基础演示内容。")).toBeInTheDocument();
  });

  it("renders the album page heading", async () => {
    render(await AlbumPage());

    expect(screen.getByRole("heading", { level: 1, name: "个人相册" })).toBeInTheDocument();
  });

  it("opens the create album dialog from the header action", async () => {
    render(await AlbumPage());

    const backHomeLink = screen.getByRole("link", { name: "返回首页小镇" });
    const createAlbumButton = screen.getByRole("button", { name: "新建相册" });

    expect(createAlbumButton).toBeInTheDocument();
    expect(backHomeLink).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "上传" })).not.toBeInTheDocument();
    expect(screen.queryByText("先用静态卡片搭一版轻量结构，后续再替换真实封面。")).not.toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveClass("album-page-scrollbar", "h-dvh", "overflow-y-auto");
    expect(screen.getAllByRole("article")).toHaveLength(7);
    expect(screen.getAllByText("更多")).toHaveLength(7);
    expect(screen.getByText("照片7个")).toBeInTheDocument();
    expect(screen.getByText("诗注：小妞写，图片，女孩子的碎片收藏。")).toBeInTheDocument();
    expect(screen.getByText("荷注：小妞呀，图片，新收进来的封面占位练习。")).toBeInTheDocument();
    expect(screen.getAllByRole("article")[0]).toHaveClass("min-h-[288px]", "sm:min-h-[304px]", "p-3");
    expect(backHomeLink).toHaveClass("rounded-[1rem]", "border-2", "bg-[#f8cfd5]", "px-3.5", "py-1", "text-sm", "font-black");
    expect(createAlbumButton).toHaveClass("rounded-[1rem]", "border-2", "bg-[#f8cfd5]", "px-3.5", "py-1", "text-sm", "font-black");
    expect(backHomeLink.closest("header")).toContainElement(createAlbumButton);
    expect(backHomeLink.parentElement).toHaveClass("py-4.5");
    const firstAlbumCard = screen.getAllByRole("article")[0];
    const firstAlbumDetailLink = firstAlbumCard.querySelector("a[href='/album/album-001']") as HTMLElement;
    const firstAlbumCover = firstAlbumDetailLink.firstElementChild as HTMLElement;
    expect(firstAlbumDetailLink).not.toBeNull();
    expect(firstAlbumCover).toHaveClass("h-48", "sm:h-52");
    expect(firstAlbumCover.querySelector("img")).not.toBeNull();
    expect(firstAlbumCover.querySelector("span")).toBeNull();
    expect(screen.getAllByRole("heading", { level: 2, name: "我的相册" })[0]).toHaveClass("text-[1.2rem]");
    expect(screen.getByText("照片7个")).toHaveClass("text-[11px]");
    expect(screen.getAllByRole("button", { name: /更多/ })[0]).toHaveClass("px-2", "py-1", "gap-1");
    expect(screen.getAllByText("更多")[0]).toHaveClass("sr-only");

    fireEvent.click(createAlbumButton);

    const createAlbumDialog = screen.getByRole("dialog", { name: "新建相册" });
    const createAlbumTitle = screen.getByRole("heading", { level: 2, name: "新建相册" });

    expect(createAlbumDialog).toBeInTheDocument();
    expect(createAlbumDialog).toHaveClass("max-w-[640px]", "px-5", "py-5", "sm:px-8", "sm:py-7");
    expect(createAlbumTitle).toHaveClass("text-[1.95rem]", "sm:text-[2.75rem]");
    expect(screen.getByRole("textbox", { name: "相册名称" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "备注/留言" })).toBeInTheDocument();
    expect(screen.getByText("封面上传")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "点击上传" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "封面预览占位" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "取消" }));

    expect(screen.queryByRole("dialog", { name: "新建相册" })).not.toBeInTheDocument();
  });

  it("uses the album detail link as the visible card container", async () => {
    render(await AlbumPage());

    const firstAlbumDetailLink = screen.getAllByLabelText("我的相册详情")[0];
    const firstAlbumTitle = screen.getAllByRole("heading", { level: 2, name: "我的相册" })[0];
    const firstAlbumCover = screen.getAllByAltText("我的相册封面")[0];

    expect(firstAlbumDetailLink).toContainElement(firstAlbumTitle);
    expect(firstAlbumDetailLink).toContainElement(firstAlbumCover);
  });

  it("creates a stored album card with a selected local cover image", async () => {
    vi.useRealTimers();

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        album: {
          id: "album-created-001",
          title: "夏日收藏夹",
          description: "把傍晚和风景先放进这里。",
          coverImage: "/uploads/albums/summer-cover.png",
          photoCount: 0,
          visibility: "public",
          status: "published",
          createdAt: "2026-05-26",
          sortOrder: 1,
        },
      }),
    } satisfies JsonResponse);

    render(await AlbumPage());

    fireEvent.click(screen.getByRole("button", { name: "新建相册" }));

    const coverFile = new File(["cover"], "summer-cover.png", { type: "image/png" });

    fireEvent.change(screen.getByRole("textbox", { name: "相册名称" }), { target: { value: "夏日收藏夹" } });
    fireEvent.change(screen.getByRole("textbox", { name: "备注/留言" }), { target: { value: "把傍晚和风景先放进这里。" } });
    fireEvent.change(screen.getByLabelText("上传本地封面"), { target: { files: [coverFile] } });

    await waitFor(() => {
      expect(screen.queryByRole("img", { name: "封面预览占位" })).not.toBeInTheDocument();
      expect(screen.getByAltText("封面本地预览")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/albums",
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        }),
      );
      expect(screen.queryByRole("dialog", { name: "新建相册" })).not.toBeInTheDocument();
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    expect(request?.body).toBeInstanceOf(FormData);

    const formData = request?.body as FormData;
    expect(formData.get("title")).toBe("夏日收藏夹");
    expect(formData.get("description")).toBe("把傍晚和风景先放进这里。");
    expect(formData.get("coverFileName")).toBe("summer-cover.png");
    expect(screen.getAllByRole("article")).toHaveLength(8);
    expect(screen.getByRole("heading", { level: 2, name: "夏日收藏夹" })).toBeInTheDocument();
    expect(screen.getByText("把傍晚和风景先放进这里。")).toBeInTheDocument();
    expect(screen.getAllByText("照片0个").length).toBeGreaterThan(0);
    expect(screen.getByText("创建日期： 2026-05-26")).toBeInTheDocument();
    expect(screen.getByLabelText("夏日收藏夹详情")).toHaveAttribute("href", "/album/album-created-001");
    expect(screen.queryByText("summer-cover.png")).not.toBeInTheDocument();
    expect(screen.getByAltText("夏日收藏夹封面")).toHaveAttribute("src", "/uploads/albums/summer-cover.png");
  });

  it("blocks submit when the album name is empty", async () => {
    render(await AlbumPage());

    fireEvent.click(screen.getByRole("button", { name: "新建相册" }));
    fireEvent.change(screen.getByRole("textbox", { name: "备注/留言" }), { target: { value: "只写备注不该创建成功。" } });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(screen.getByText("请先填写相册名称")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "新建相册" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(7);
  });

  it("renders stored albums before fallback cards", async () => {
    await upsertStoredAlbum({
      id: "album-db-001",
      title: "数据库相册",
      description: "这张封面应该来自持久化数据。",
      coverImage: "/uploads/albums/db-cover.png",
      photoCount: 3,
      visibility: "public",
      status: "published",
      createdAt: "2026-05-20",
      sortOrder: 1,
    });

    vi.spyOn(albumService, "getAlbumById").mockImplementation(async (id) =>
      id === "album-db-001"
        ? {
            id: "album-db-001",
            title: "数据库相册",
            description: "这张封面应该来自持久化数据。",
            coverImage: "/uploads/albums/db-cover.png",
            photoCount: 3,
            visibility: "public",
            status: "published",
            createdAt: "2026-05-20",
            sortOrder: 1,
          }
        : id === "album-001"
          ? albumServiceFallbackAlbum
          : null,
    );

    render(await AlbumPage());

    expect(screen.getByRole("heading", { level: 2, name: "数据库相册" })).toBeInTheDocument();
    expect(screen.getByAltText("数据库相册封面")).toHaveAttribute("src", "/uploads/albums/db-cover.png");
    expect(screen.getAllByRole("article")).toHaveLength(8);

    const storedDetailPage = render(await AlbumDetailPage({ params: Promise.resolve({ albumId: "album-db-001" }) }));

    const storedDetailCover = screen.getByRole("img", { name: "数据库相册封面背景" });
    expect(storedDetailCover).toHaveAttribute("src", "/uploads/albums/db-cover.png");
    expect(storedDetailCover).toHaveClass("absolute", "inset-0", "h-full", "w-full", "object-cover");
    expect(storedDetailPage.container.querySelectorAll("article img")).toHaveLength(1);
  });

  it("renders the album detail page for a collection route", async () => {
    const detailPage = render(await AlbumDetailPage({ params: Promise.resolve({ albumId: "album-001" }) }));

    const uploadPhotosButton = screen.getByRole("button", { name: "Upload Photos" });
    const editAlbumButton = screen.getByRole("button", { name: "Edit Album" });
    const deleteAlbumButton = screen.getByRole("button", { name: "Delete Album" });

    expect(screen.getByRole("heading", { level: 1, name: "我的相册" })).toBeInTheDocument();
    expect(screen.getByText("Created: 2023-07-31")).toBeInTheDocument();
    expect(screen.getByText("诗注：小妞写，图片，女孩子的碎片收藏。")).toBeInTheDocument();
    const detailCover = screen.getByRole("img", { name: "我的相册封面背景" });
    expect(detailCover).toHaveAttribute("src", "/album-cover-placeholder.jpeg");
    expect(detailCover).toHaveClass("absolute", "inset-0", "h-full", "w-full", "object-cover");
    expect(detailPage.container.querySelectorAll("article img")).toHaveLength(1);
    expect(uploadPhotosButton).toBeInTheDocument();
    expect(editAlbumButton).toBeInTheDocument();
    expect(deleteAlbumButton).toBeInTheDocument();
    expect(uploadPhotosButton.querySelector("svg")).not.toBeNull();
    expect(editAlbumButton.querySelector("svg")).not.toBeNull();
    expect(deleteAlbumButton.querySelector("svg")).not.toBeNull();
    expect(screen.getByText("Photos (7) - Sorted by Date")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(8);
    expect(screen.getAllByText("Sleepy head...")).toHaveLength(7);
    const photoDetailLinks = screen.getAllByRole("link", { name: "查看照片详情" });
    const photoEditButtons = screen.getAllByRole("button", { name: "编辑照片" });
    const photoDeleteButtons = screen.getAllByRole("button", { name: "删除照片" });
    expect(photoDetailLinks).toHaveLength(7);
    expect(photoDetailLinks[0]).toHaveAttribute("href", "/album/album-001/photo-001");
    expect(photoDetailLinks[6]).toHaveAttribute("href", "/album/album-001/photo-007");
    expect(photoEditButtons).toHaveLength(7);
    expect(photoDeleteButtons).toHaveLength(7);
    expect(photoEditButtons[0]?.querySelector("svg")).not.toBeNull();
    expect(photoDeleteButtons[0]?.querySelector("svg")).not.toBeNull();
  });

  it("renders stored uploaded photos on the album detail page", async () => {
    const albumWithStoredPhotos: Album = {
      ...albumServiceFallbackAlbum,
      id: "album-created-001",
      title: "可上传相册",
      photoCount: 1,
      coverImage: "/uploads/albums/album-created-001-cover.png",
      createdAt: "2026-05-28",
    };

    vi.spyOn(albumService, "getAlbumById").mockImplementation(async (id) => (id === "album-created-001" ? albumWithStoredPhotos : null));

    await upsertStoredAlbum(albumWithStoredPhotos);
    await upsertStoredAlbumPhoto(
      {
        id: "album-created-001-photo-001",
        albumId: "album-created-001",
        title: "雨天窗口",
        uploadedAt: "2026-05-28 / 10:00",
        note: "刚上传到新相册的第一张。",
        imageUrl: "/uploads/albums/album-created-001-photo-001-window.png",
        imagePosition: "center center",
      },
      1,
    );

    const detailPage = render(await AlbumDetailPage({ params: Promise.resolve({ albumId: "album-created-001" }) }));

    expect(screen.getByRole("heading", { level: 1, name: "可上传相册" })).toBeInTheDocument();
    expect(screen.getByText("Photos (1) - Sorted by Date")).toBeInTheDocument();
    expect(screen.getByText("雨天窗口")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "查看照片详情" })).toHaveAttribute("href", "/album/album-created-001/album-created-001-photo-001");
    expect(detailPage.container.querySelectorAll("article img")).toHaveLength(1);
  });

  it("renders the first album photo detail page with next navigation only", async () => {
    render(await AlbumPhotoDetailPage({ params: Promise.resolve({ albumId: "album-001", photoId: "photo-001" }) }));

    expect(screen.getByRole("heading", { level: 1, name: "Sleepy head..." })).toBeInTheDocument();
    expect(screen.getByText("Upload Time")).toBeInTheDocument();
    expect(screen.getByText("Oct 24, 2023 / 4:30")).toBeInTheDocument();
    expect(screen.getByText(/和猫咪的下午茶时光/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回相册" })).toHaveAttribute("href", "/album/album-001");
    expect(screen.getByRole("button", { name: "编辑备注" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "删除照片" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "下一张" })).toHaveAttribute("href", "/album/album-001/photo-002");
    expect(screen.getByRole("button", { name: "上一张" })).toBeDisabled();
  });

  it("renders the last album photo detail page with previous navigation only", async () => {
    render(await AlbumPhotoDetailPage({ params: Promise.resolve({ albumId: "album-001", photoId: "photo-007" }) }));

    expect(screen.getByRole("link", { name: "上一张" })).toHaveAttribute("href", "/album/album-001/photo-006");
    expect(screen.getByRole("button", { name: "下一张" })).toBeDisabled();
  });

  it("renders the album demo page in demo mode", async () => {
    await updateDisplayMode("album", "demo");

    render(await AlbumPage());

    expect(screen.getByRole("heading", { level: 1, name: "个人相册-演示模式" })).toBeInTheDocument();
    expect(screen.getByText("这是个人相册模块的基础演示内容。")).toBeInTheDocument();
  });

  it("renders the thoughts display page with album-style header and fallback cards", async () => {
    render(await ThoughtsPage());

    expect(screen.getByRole("main")).toHaveClass("album-page-scrollbar", "h-dvh", "overflow-y-auto", "bg-[#f7f1e8]");
    expect(screen.getByRole("heading", { level: 1, name: "碎碎念" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回首页小镇" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "返回首页小镇" })).toHaveClass("rounded-[1rem]", "border-2", "bg-[#f8cfd5]");
    expect(screen.getByRole("button", { name: "全部" })).toHaveClass("rounded-full", "px-4", "py-2");
    expect(screen.getByRole("searchbox", { name: "搜索碎碎念" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "新建碎碎念" })).toHaveAttribute("href", "/thoughts/new");
    expect(screen.getByRole("link", { name: "新建碎碎念" })).toHaveTextContent("+");
    expect(screen.getByRole("link", { name: "新建碎碎念" })).not.toHaveTextContent("新建碎碎念");
    expect(screen.getByRole("link", { name: "新建碎碎念" })).toHaveClass("fixed", "bottom-6", "right-6", "h-15", "w-15", "rounded-full");
    expect(screen.getAllByRole("article")).toHaveLength(thoughts.length);
    expect(screen.getAllByRole("article")[0].parentElement).toHaveClass("columns-1", "gap-4", "xl:columns-5");
    expect(screen.getAllByRole("heading", { level: 2, name: thoughts[0].title })).toHaveLength(5);
    expect(screen.getAllByText(thoughts[0].body)).toHaveLength(5);
    expect(screen.queryByText("碎碎念小札")).not.toBeInTheDocument();
    expect(screen.queryByText("💌")).not.toBeInTheDocument();
    expect(screen.queryByText("📎")).not.toBeInTheDocument();
    expect(screen.queryByText("🌼")).not.toBeInTheDocument();
    expect(screen.getAllByRole("article")[0]).toHaveClass("mb-4", "break-inside-avoid");
    const firstThoughtTag = screen.getAllByRole("article")[0].querySelector("span") as HTMLElement;
    expect(firstThoughtTag).toHaveTextContent("网站");
    expect(firstThoughtTag).toHaveClass("rounded-full", "bg-[#f7c9d0]", "px-2.5", "py-1");
    expect(firstThoughtTag.parentElement).toHaveClass("flex", "items-center", "justify-between");
    const thoughtImage = screen.getAllByRole("img", { name: "碎碎念配图" })[0];
    expect(thoughtImage).toHaveAttribute("src", "/album-cover-placeholder.jpeg");
    expect(thoughtImage.parentElement).toHaveClass("mb-3", "aspect-[4/5]", "overflow-hidden", "rounded-[1rem]");
    expect(screen.getAllByText(thoughts[0].body)[0]).toHaveClass("line-clamp-2");
    expect(screen.getAllByRole("article")[0]).toHaveClass("rounded-[1.45rem]", "border-[2px]", "bg-white", "shadow-[0_12px_24px_rgba(112,84,84,0.12)]");
  });

  it("filters fallback thoughts by tag", async () => {
    render(await ThoughtsPage());

    expect(screen.getAllByRole("heading", { level: 2, name: thoughts[0].title })).toHaveLength(5);
    expect(screen.getByRole("heading", { level: 2, name: thoughts[1].title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: thoughts[2].title })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "边界感" }));

    expect(screen.queryByRole("heading", { level: 2, name: thoughts[0].title })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: thoughts[1].title })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: thoughts[2].title })).not.toBeInTheDocument();
  });

  it("searches fallback thoughts and shows an empty state when nothing matches", async () => {
    render(await ThoughtsPage());

    const searchbox = screen.getByRole("searchbox", { name: "搜索碎碎念" });

    fireEvent.change(searchbox, { target: { value: "模板站" } });

    expect(screen.getAllByRole("heading", { level: 2, name: thoughts[0].title })).toHaveLength(5);
    expect(screen.queryByRole("heading", { level: 2, name: thoughts[1].title })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: thoughts[2].title })).not.toBeInTheDocument();

    fireEvent.change(searchbox, { target: { value: "没有这条碎碎念" } });

    expect(screen.queryByRole("heading", { level: 2, name: thoughts[0].title })).not.toBeInTheDocument();
    expect(screen.getByText("没有找到相关碎碎念")).toBeInTheDocument();
    expect(screen.getByText("换个关键词，或者先回到全部分类看看。")).toBeInTheDocument();
  });

  it("renders the thoughts demo page in demo mode", async () => {
    await updateDisplayMode("thoughts", "demo");

    render(await ThoughtsPage());

    expect(screen.getByRole("heading", { level: 1, name: "碎碎念（试玩模式）" })).toBeInTheDocument();
    expect(screen.getByText("这是碎碎念模块的试玩版页面。")).toBeInTheDocument();
    expect(screen.getByText("你可以先体验基础编辑交互，但这里不会展示我的真实内容。")).toBeInTheDocument();
  });

  it("renders the thought detail page from a slug", async () => {
    render(await ThoughtDetailPage({ params: Promise.resolve({ slug: "glowing-town" }) }));

    expect(screen.getByRole("link", { name: "返回" })).toHaveAttribute("href", "/thoughts");
    expect(screen.queryByRole("heading", { level: 1, name: thoughts[0].title })).not.toBeInTheDocument();
    expect(screen.getByText(thoughts[0].body)).toBeInTheDocument();
  });

  it("renders the thoughts detail demo page in demo mode", async () => {
    await updateDisplayMode("thoughts", "demo");

    render(await ThoughtDetailPage({ params: Promise.resolve({ slug: "glowing-town" }) }));

    expect(screen.getByRole("heading", { level: 1, name: "碎碎念（试玩模式）" })).toBeInTheDocument();
    expect(screen.getByText("这是碎碎念模块的试玩版页面。")).toBeInTheDocument();
  });

  it("renders the new thought rich text draft page", () => {
    render(<NewThoughtPage />);

    expect(screen.getByRole("heading", { level: 1, name: "新建碎碎念" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回碎碎念" })).toHaveAttribute("href", "/thoughts");
    expect(screen.getByText("当前为富文本编辑体验预览，暂不保存。")).toBeInTheDocument();
    expect(screen.getByLabelText("富文本工具栏")).toBeInTheDocument();
    expect(screen.getByLabelText("新建碎碎念编辑本")).not.toHaveClass("album-page-scrollbar", "overflow-y-auto");
    expect(screen.getByLabelText("新建碎碎念内容滚动区")).not.toHaveClass("album-page-scrollbar", "overflow-y-auto");
    expect(screen.getByLabelText("碎碎念富文本编辑纸张")).toHaveClass("album-page-scrollbar", "h-[545px]", "overflow-y-auto");
    ["撤销", "H1", "H2", "H3", "H4", "H5", "H6", "无序列表", "有序列表", "任务列表", "加粗", "删除线", "斜体", "下划线", "文字颜色", "背景", "附件"].forEach((name) => {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    });
    expect(screen.getByLabelText("上传图片或视频附件")).toHaveAttribute("accept", "image/*,video/*");
    expect(screen.queryByRole("button", { name: "标题" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "列表" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("碎碎念富文本编辑纸张")).toBeInTheDocument();
    expect(screen.queryByLabelText("碎碎念富文本预览纸张")).not.toBeInTheDocument();
    expect(screen.queryByText("本地预览")).not.toBeInTheDocument();
    expect(screen.queryByText("开始写一点今天的小事。")).not.toBeInTheDocument();
  });

  it("renders the playlists page heading", async () => {
    render(await PlaylistsPage());

    expect(screen.getByRole("heading", { level: 1, name: "歌单" })).toBeInTheDocument();
  });

  it("renders the playlists demo page in demo mode", async () => {
    await updateDisplayMode("playlists", "demo");

    render(await PlaylistsPage());

    expect(screen.getByRole("heading", { level: 1, name: "歌单-演示模式" })).toBeInTheDocument();
    expect(screen.getByText("这是歌单模块的基础演示内容。")).toBeInTheDocument();
  });

  it("renders the coffee page heading", async () => {
    render(await CoffeePage());

    expect(screen.getByRole("heading", { level: 1, name: "咖啡推荐" })).toBeInTheDocument();
  });

  it("renders the coffee demo page in demo mode", async () => {
    await updateDisplayMode("coffee", "demo");

    render(await CoffeePage());

    expect(screen.getByRole("heading", { level: 1, name: "咖啡推荐-演示模式" })).toBeInTheDocument();
    expect(screen.getByText("这是咖啡推荐模块的基础演示内容。")).toBeInTheDocument();
  });

  it("renders the todo page heading", async () => {
    render(await TodoPage());

    expect(screen.getByRole("heading", { level: 1, name: "人生todolist" })).toBeInTheDocument();
  });

  it("renders the todo demo page in demo mode", async () => {
    await updateDisplayMode("todo", "demo");

    render(await TodoPage());

    expect(screen.getByRole("heading", { level: 1, name: "人生todolist-演示模式" })).toBeInTheDocument();
    expect(screen.getByText("这是人生todolist模块的基础演示内容。")).toBeInTheDocument();
  });

  it("renders the message page heading", async () => {
    render(await MessagePage());

    expect(screen.getByRole("heading", { level: 1, name: "学习笔记" })).toBeInTheDocument();
  });

  it("renders the message demo page in demo mode", async () => {
    await updateDisplayMode("message", "demo");

    render(await MessagePage());

    expect(screen.getByRole("heading", { level: 1, name: "学习笔记-演示模式" })).toBeInTheDocument();
    expect(screen.getByText("这是学习笔记模块的基础演示内容。")).toBeInTheDocument();
  });
});
