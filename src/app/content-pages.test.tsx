import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { albumCollections } from "@/data/album";
import { getAlbumPhotosByAlbumId } from "@/data/albumPhotos";
import type { Album, AlbumComment } from "@/features/album/types";
import AboutPage from "./about/page";
import AlbumPage from "./album/page";
import CoffeePage from "./coffee/page";
import MessagePage from "./message/page";
import PlaylistsPage from "./playlists/page";
import ThoughtsPage from "./thoughts/page";
import ThoughtDetailPage from "./thoughts/[slug]/page";
import NewThoughtPage from "./thoughts/new/page";
import TodoPage from "./todo/page";
import type { Thought } from "@/features/thoughts/types";
import { resetDisplayModes, updateDisplayMode } from "@/features/module-display-mode/service";
import { resetStoredAlbums, upsertStoredAlbum, upsertStoredAlbumPhoto } from "@/features/album/repository";
import * as albumService from "@/features/album/service";
const mockThoughtServiceState = vi.hoisted(() => ({
  getThoughtBySlug: vi.fn(),
  getThoughtPageData: vi.fn(),
}));

const albumPageDataState = vi.hoisted(() => ({
  getAlbumWorkspaceData: vi.fn(),
}));

vi.mock("@/features/thoughts/service", async () => {
  const actual = await vi.importActual<typeof import("@/features/thoughts/service")>("@/features/thoughts/service");

  return {
    ...actual,
    getThoughtBySlug: mockThoughtServiceState.getThoughtBySlug,
    getThoughtPageData: mockThoughtServiceState.getThoughtPageData,
  };
});

vi.mock("@/features/album/service", async () => {
  const actual = await vi.importActual<typeof import("@/features/album/service")>("@/features/album/service");

  return {
    ...actual,
    getAlbumWorkspaceData: albumPageDataState.getAlbumWorkspaceData,
  };
});

const mockThoughts: Thought[] = [
  {
    id: "thought-001",
    title: "先把网站做成一个会发光的小镇",
    slug: "glowing-town",
    body: "个人网站的第一步，是先让访客知道这里和模板站不一样。后台、数据库和复杂权限都很重要，但第一眼的记忆点会决定我有没有动力继续把它养大。",
    visibility: "public",
    status: "published",
    createdAt: "2026-05-13",
    sortOrder: 1,
  },
  {
    id: "thought-002",
    title: "面试模式存在的原因",
    slug: "interview-mode",
    body: "有些内容不是不能公开，而是不适合在所有场景公开。面试模式不是把自己藏起来，而是给不同访问场景一个更舒服的边界。",
    visibility: "interview_hidden",
    status: "published",
    createdAt: "2026-05-12",
    sortOrder: 2,
  },
];

const mockTiptapState = vi.hoisted(() => ({
  useEditorOptions: undefined as { content?: unknown } | undefined,
}));

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
    useEditor: (options: { content?: unknown }) => {
      mockTiptapState.useEditorOptions = options;
      return {
        can: () => ({ undo: () => false }),
        chain: () => chain,
        isActive: () => false,
        setEditable: () => undefined,
      };
    },
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

function mockAlbumAdminSessionFetch(handler?: (input: RequestInfo | URL, init?: RequestInit) => Promise<unknown> | unknown) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    if (String(input) === "/api/admin/session") {
      return {
        ok: true,
        json: async () => ({ authenticated: true }),
      } satisfies JsonResponse;
    }

    return ((await handler?.(input, init)) ?? {
      ok: true,
      json: async () => ({}),
    }) as JsonResponse;
  });
}

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

const albumFallbackComments: AlbumComment[] = [
  {
    id: "album-comment-001",
    albumId: "album-001",
    author: "Name",
    avatar: "/images/image.png",
    content: "这本相册像一页慢慢展开的夏天。",
    time: "06/18 10:05",
  },
];

describe("content module pages", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T10:00:00.000Z"));
    mockTiptapState.useEditorOptions = undefined;
    vi.spyOn(albumService, "getAlbumById").mockImplementation(async (id) => (id === "album-001" ? albumServiceFallbackAlbum : null));
    albumPageDataState.getAlbumWorkspaceData.mockImplementation(async (albumId?: string, photoId?: string) => {
      const albums = await albumService.listAlbums();
      const activeAlbum = albumId ? await albumService.getAlbumById(albumId) : albums[0] ?? null;
      const photos = activeAlbum ? await albumService.listAlbumPhotos(activeAlbum.id) : [];
      const activePhoto = activeAlbum && photoId ? await albumService.getAlbumPhotoById(activeAlbum.id, photoId) : null;
      const adjacent = activeAlbum && activePhoto ? await albumService.getAdjacentAlbumPhotoIds(activeAlbum.id, activePhoto.id) : { previousPhotoId: null, nextPhotoId: null };

      return {
        activeAlbum,
        activePhoto,
        albumComments: activeAlbum ? albumFallbackComments.filter((comment) => comment.albumId === activeAlbum.id) : [],
        albums,
        dataSource: "available",
        nextPhotoId: adjacent.nextPhotoId,
        photos,
        previousPhotoId: adjacent.previousPhotoId,
      };
    });
    mockThoughtServiceState.getThoughtPageData.mockResolvedValue({ dataSource: "supabase", thoughts: mockThoughts });
    mockThoughtServiceState.getThoughtBySlug.mockImplementation(async (slug) => mockThoughts.find((thought) => thought.slug === slug) ?? null);
    await resetDisplayModes();
    await resetStoredAlbums();
  });

  afterEach(async () => {
    await resetDisplayModes();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders the about page with the shared diary tabs header", async () => {
    render(await AboutPage());

    expect(screen.getByRole("heading", { level: 1, name: "心情日记" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "内容页导航" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回首页小镇" })).toHaveAttribute("href", "/");
    expect(within(screen.getByRole("navigation", { name: "内容页导航" })).getByText("心情日记")).toHaveClass("rounded-full", "bg-[#ffb9c8]");
    expect(screen.getByText("碎碎念")).toBeInTheDocument();
  });

  it("renders the about demo page in demo mode with the shared diary tabs header", async () => {
    await updateDisplayMode("about", "demo");

    render(await AboutPage());

    expect(screen.getByRole("heading", { level: 1, name: "心情日记" })).toBeInTheDocument();
    expect(screen.getByText("心情日记-演示模式")).toBeInTheDocument();
    expect(screen.getByText("这是心情日记模块的基础演示内容。")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "内容页导航" })).toBeInTheDocument();
  });

  it("renders the album page in gallery mode", async () => {
    render(await AlbumPage());

    expect(screen.getAllByRole("heading", { level: 2, name: "我的相册" }).length).toBeGreaterThan(0);
    expect(screen.getByText("Photos (7)")).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "照片详情弹窗" })).not.toBeInTheDocument();
  });

  it("renders a mokugyo notice when album workspace data is unavailable", async () => {
    albumPageDataState.getAlbumWorkspaceData.mockResolvedValueOnce({
      activeAlbum: null,
      activePhoto: null,
      albumComments: [],
      albums: [],
      dataSource: "unavailable",
      nextPhotoId: null,
      photos: [],
      previousPhotoId: null,
      statusReason: "missing-env",
    });

    render(await AlbumPage());

    expect(screen.getByTestId("mokugyo-state-notice")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "服务器还没摆好小碗" })).toBeInTheDocument();
  });

  it("opens the create album dialog from the workspace sidebar action", async () => {
    vi.useRealTimers();
    mockAlbumAdminSessionFetch();
    render(await AlbumPage());

    await screen.findByText("已解锁");
    const backHomeLink = screen.getByRole("link", { name: "返回首页小镇" });
    const createAlbumButton = screen.getByRole("button", { name: "新建相册" });

    expect(createAlbumButton).toBeInTheDocument();
    expect(backHomeLink).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveClass("album-page-scrollbar", "h-dvh", "overflow-y-auto");
    expect(screen.getAllByRole("article").length).toBeGreaterThan(7);
    expect(screen.getByText("Photos (7)")).toBeInTheDocument();
    expect(screen.queryByText("Album Comments")).not.toBeInTheDocument();
    expect(screen.queryByText("Album Context")).not.toBeInTheDocument();
    expect(backHomeLink).toHaveTextContent("Home");
    expect(screen.getByRole("navigation", { name: "内容页导航" })).toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "内容页导航" })).getByText("个人相册")).toHaveClass("rounded-full", "bg-[#ffb9c8]");

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

  it("uses the sidebar album card as the visible selection container", async () => {
    render(await AlbumPage());

    const firstAlbumTitle = screen.getAllByRole("heading", { level: 2, name: "我的相册" })[0];
    const firstAlbumCover = screen.getAllByAltText("我的相册封面")[0];
    const firstAlbumCard = firstAlbumTitle.closest("article");

    expect(firstAlbumCard).toContainElement(firstAlbumTitle);
    expect(firstAlbumCard).toContainElement(firstAlbumCover);
  });

  it("creates a stored album card with a selected local cover image", async () => {
    vi.useRealTimers();

    const fetchMock = mockAlbumAdminSessionFetch(async (input) => {
      if (String(input) === "/api/albums") {
        return {
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
        } satisfies JsonResponse;
      }

      if (String(input) === "/api/albums/album-created-001/comments") {
        return {
          ok: true,
          json: async () => ({
            comment: {
              id: "album-comment-002",
              albumId: "album-created-001",
              author: "Ranima",
              avatar: "/images/image.png",
              content: "把傍晚的风留在这里。",
              time: "06/18 10:06",
            },
          }),
        } satisfies JsonResponse;
      }
    });

    render(await AlbumPage());

    await screen.findByText("已解锁");
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

    const request = fetchMock.mock.calls.find(([input]) => String(input) === "/api/albums")?.[1] as RequestInit | undefined;
    expect(request?.body).toBeInstanceOf(FormData);

    const formData = request?.body as FormData;
    expect(formData.get("title")).toBe("夏日收藏夹");
    expect(formData.get("description")).toBe("把傍晚和风景先放进这里。");
    expect(formData.get("coverFileName")).toBe("summer-cover.png");
    expect(screen.getAllByRole("article").length).toBeGreaterThanOrEqual(8);
    expect(screen.getAllByText("夏日收藏夹").length).toBeGreaterThan(0);
    expect(screen.getAllByText("把傍晚和风景先放进这里。").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Created:/).length).toBeGreaterThan(0);
    expect(screen.getByAltText("夏日收藏夹封面")).toHaveAttribute("src", "/uploads/albums/summer-cover.png");
  });

  it("blocks submit when the album name is empty", async () => {
    vi.useRealTimers();
    mockAlbumAdminSessionFetch();
    render(await AlbumPage());

    await screen.findByText("已解锁");
    fireEvent.click(screen.getByRole("button", { name: "新建相册" }));
    fireEvent.change(screen.getByRole("textbox", { name: "备注/留言" }), { target: { value: "只写备注不该创建成功。" } });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(screen.getByText("请先填写相册名称")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "新建相册" })).toBeInTheDocument();
    expect(screen.getAllByRole("article").length).toBeGreaterThan(7);
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

    render(await AlbumPage());

    expect(screen.getAllByText("数据库相册").length).toBeGreaterThan(0);
    expect(screen.getByAltText("数据库相册封面")).toHaveAttribute("src", "/uploads/albums/db-cover.png");
    expect(screen.getAllByRole("article")).toHaveLength(8);
  });

  it("renders the aggregated album workspace for a collection route", async () => {
    const detailPage = render(await AlbumPage({ searchParams: Promise.resolve({ albumId: "album-001" }) }));

    expect(screen.getAllByRole("heading", { level: 2, name: "我的相册" }).length).toBeGreaterThan(0);
    expect(screen.getByText("诗注：小妞写，图片，女孩子的碎片收藏。")).toBeInTheDocument();
    expect(screen.getAllByText("Created: 2023-07-31")).toHaveLength(1);
    const detailCover = screen.getByRole("img", { name: "我的相册封面背景" });
    expect(detailCover).toHaveAttribute("src", "/album-cover-placeholder.jpeg");
    expect(detailCover).toHaveClass("absolute", "inset-0", "h-full", "w-full", "object-cover");
    expect(detailPage.container.querySelectorAll("article img").length).toBeGreaterThan(1);
    expect(screen.getByRole("button", { name: "上传照片" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "编辑相册" }).length).toBeGreaterThan(0);
    expect(screen.getByText("Photos (7)")).toBeInTheDocument();
    expect(screen.getByText("点击一张照片放大浏览，左右切换会更像翻一本真正的相册。")).toBeInTheDocument();
    expect(screen.getAllByText(/和猫咪的下午茶时光/).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("article").length).toBeGreaterThan(7);
    expect(screen.queryByText("Album Context")).not.toBeInTheDocument();
    expect(screen.queryByText("相册留言")).not.toBeInTheDocument();
  });

  it("renders a mokugyo notice when album detail data is unavailable", async () => {
    albumPageDataState.getAlbumWorkspaceData.mockResolvedValueOnce({
      activeAlbum: null,
      activePhoto: null,
      albumComments: [],
      albums: [],
      dataSource: "unavailable",
      nextPhotoId: null,
      photos: [],
      previousPhotoId: null,
      statusReason: "read-error",
    });

    render(await AlbumPage({ searchParams: Promise.resolve({ albumId: "album-001" }) }));

    expect(screen.getByTestId("mokugyo-state-notice")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "服务器在打瞌睡" })).toBeInTheDocument();
  });

  it("renders stored uploaded photos inside the album workspace", async () => {
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

    const detailPage = render(await AlbumPage({ searchParams: Promise.resolve({ albumId: "album-created-001" }) }));

    expect(screen.getAllByText("可上传相册").length).toBeGreaterThan(0);
    expect(screen.getByText("Photos (1)")).toBeInTheDocument();
    expect(screen.getByText("刚上传到新相册的第一张。")).toBeInTheDocument();
    expect(detailPage.container.querySelectorAll("article img").length).toBeGreaterThanOrEqual(2);
  });

  it("renders a mokugyo notice when album photo detail data is unavailable", async () => {
    albumPageDataState.getAlbumWorkspaceData.mockResolvedValueOnce({
      activeAlbum: null,
      activePhoto: null,
      albumComments: [],
      albums: [],
      dataSource: "unavailable",
      nextPhotoId: null,
      photos: [],
      previousPhotoId: null,
      statusReason: "read-error",
    });

    render(await AlbumPage({ searchParams: Promise.resolve({ albumId: "album-001", photoId: "photo-001" }) }));

    expect(screen.getByTestId("mokugyo-state-notice")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "服务器在打瞌睡" })).toBeInTheDocument();
  });

  it("opens the album photo inside the lightbox", async () => {
    render(await AlbumPage({ searchParams: Promise.resolve({ albumId: "album-001", photoId: "photo-001" }) }));

    expect(screen.getByRole("dialog", { name: "照片详情弹窗" })).toBeInTheDocument();
    expect(screen.getByText("Photo View")).toBeInTheDocument();
    expect(screen.getByText("Oct 24, 2023 / 4:30")).toBeInTheDocument();
    expect(screen.getAllByText(/和猫咪的下午茶时光/).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "编辑备注" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "删除照片" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "下一张" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "上一张" })).toBeDisabled();
  });

  it("renders the last album photo lightbox with previous navigation only", async () => {
    render(await AlbumPage({ searchParams: Promise.resolve({ albumId: "album-001", photoId: "photo-007" }) }));

    expect(screen.getByRole("dialog", { name: "照片详情弹窗" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "上一张" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "下一张" })).toBeDisabled();
  });

  it("renders the album demo page in demo mode", async () => {
    await updateDisplayMode("album", "demo");

    render(await AlbumPage());

    expect(screen.getByRole("heading", { level: 1, name: "个人相册-演示模式" })).toBeInTheDocument();
    expect(screen.getByText("这是个人相册模块的基础演示内容。")).toBeInTheDocument();
  });

  it("renders the thoughts display page with hand-drawn diary layout and Supabase cards", async () => {
    render(await ThoughtsPage());

    expect(screen.getByRole("main")).toHaveClass("album-page-scrollbar", "h-dvh", "overflow-y-auto", "bg-[#fff8e6]");
    expect(screen.getByRole("heading", { level: 1, name: "Pocket Diary" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回首页小镇" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "返回首页小镇" })).toHaveTextContent("Home");
    expect(screen.getByRole("navigation", { name: "内容页导航" })).toBeInTheDocument();
    expect(screen.getByText("碎碎念")).toHaveClass("rounded-full", "bg-[#ffb9c8]");
    expect(screen.queryByRole("button", { name: "全部" })).not.toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "搜索碎碎念" })).toBeInTheDocument();
    expect(screen.getByText("数据源：Supabase")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "新建碎碎念" })).toHaveAttribute("href", "/thoughts/new");
    expect(screen.getByRole("link", { name: "新建碎碎念" })).toHaveTextContent("+");
    expect(screen.getByRole("link", { name: "新建碎碎念" })).not.toHaveTextContent("新建碎碎念");
    expect(screen.getByRole("link", { name: "新建碎碎念" })).toHaveClass("fixed", "bottom-6", "right-6", "h-15", "w-15", "rounded-full");
    expect(screen.getAllByRole("article")).toHaveLength(mockThoughts.length);
    expect(screen.getAllByRole("article")[0].parentElement).toHaveClass("columns-1", "gap-5", "xl:columns-3");
    expect(screen.getByRole("heading", { level: 2, name: mockThoughts[0].title })).toBeInTheDocument();
    expect(screen.getByText(mockThoughts[0].body)).toBeInTheDocument();
    expect(screen.getAllByRole("article")[0]).toHaveClass("mb-5", "break-inside-avoid", "rounded-[1.45rem]", "border-[2px]", "bg-[#fffaf0]");
    expect(screen.getAllByRole("article")[0].querySelector("span.mt-3")).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: `${mockThoughts[0].title}封面` })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("视频封面")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: mockThoughts[0].title })).toHaveClass("line-clamp-2");
    expect(screen.getAllByText(mockThoughts[0].body)[0]).toHaveClass("line-clamp-2");
  });

  it("does not render thought tag filters", async () => {
    render(await ThoughtsPage());

    expect(screen.getByRole("heading", { level: 2, name: mockThoughts[0].title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: mockThoughts[1].title })).toBeInTheDocument();
    expect(screen.queryByText("Tags")).not.toBeInTheDocument();
  });

  it("renders a mokugyo notice when thoughts are unavailable", async () => {
    mockThoughtServiceState.getThoughtPageData.mockResolvedValueOnce({ dataSource: "unavailable", statusReason: "read-error", thoughts: [] });

    render(await ThoughtsPage());

    expect(screen.getByTestId("mokugyo-state-notice")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "服务器在打瞌睡" })).toBeInTheDocument();
  });

  it("searches thoughts and shows an empty state when nothing matches", async () => {
    render(await ThoughtsPage());

    const searchbox = screen.getByRole("searchbox", { name: "搜索碎碎念" });

    fireEvent.change(searchbox, { target: { value: "模板站" } });

    expect(screen.getByRole("heading", { level: 2, name: mockThoughts[0].title })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: mockThoughts[1].title })).not.toBeInTheDocument();

    fireEvent.change(searchbox, { target: { value: "没有这条碎碎念" } });

    expect(screen.queryByRole("heading", { level: 2, name: mockThoughts[0].title })).not.toBeInTheDocument();
    expect(screen.getByText("没有找到相关碎碎念")).toBeInTheDocument();
    expect(screen.getByText("换个关键词，或者先回到全部分类看看。")).toBeInTheDocument();
  });

  it("renders the thought rich text page from a slug", async () => {
    render(await ThoughtDetailPage({ params: Promise.resolve({ slug: "glowing-town" }) }));

    expect(screen.getByRole("heading", { level: 1, name: mockThoughts[0].title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回碎碎念" })).toHaveAttribute("href", "/thoughts");
    expect(screen.getByLabelText("富文本工具栏")).toBeInTheDocument();
    expect(screen.getByText(/写入时间/)).toBeInTheDocument();
    expect(screen.getByText(/2026\.05\.13/)).toBeInTheDocument();
    expect(screen.queryByText(/上次编辑时间/)).not.toBeInTheDocument();
    expect(mockTiptapState.useEditorOptions?.content).toContain(mockThoughts[0].body);
  });

  it("renders the new thought rich text draft page", () => {
    render(<NewThoughtPage />);

    expect(screen.getByRole("heading", { level: 1, name: "新建碎碎念" })).toHaveClass("text-xl", "sm:text-2xl");
    const backLink = screen.getByRole("link", { name: "返回碎碎念" });
    expect(backLink).toHaveAttribute("href", "/thoughts");
    expect(backLink).not.toHaveTextContent("←");
    expect(backLink.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "删除" })).toBeInTheDocument();
    expect(screen.queryByText("当前为富文本编辑体验预览，暂不保存。")).not.toBeInTheDocument();
    expect(screen.getByLabelText("富文本工具栏")).toBeInTheDocument();
    expect(screen.getByText("背景模板")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "收起" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "全部" })).not.toBeInTheDocument();
    ["简约", "可爱", "手账", "自然"].forEach((name) => {
      expect(screen.queryByText(name)).not.toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "糖果波纹" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "粉心回响" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "海盐边框" })).toBeInTheDocument();
    expect(screen.getByLabelText("碎碎念编辑布局")).toHaveClass("grid", "xl:grid-cols-[minmax(0,70rem)_minmax(18rem,1fr)]");
    const editorArea = screen.getAllByLabelText("富文本编辑区")[0];
    expect(editorArea).toHaveClass("w-full", "max-w-full", "min-w-0");
    expect(within(editorArea).getByLabelText("富文本工具栏")).toHaveClass("w-full", "max-w-full", "min-w-0");
    expect(within(editorArea).getByLabelText("碎碎念富文本编辑纸张")).toHaveClass("w-full", "min-w-0");
    expect(screen.getByLabelText("背景模板选择")).toHaveClass("h-full", "self-stretch", "xl:sticky", "xl:top-4", "min-w-0");
    expect(screen.getByLabelText("背景模板列表")).toHaveClass("grid", "grid-cols-2");
    expect(screen.getByLabelText("新建碎碎念编辑本")).toHaveClass("max-w-[1600px]");
    expect(screen.getByLabelText("新建碎碎念编辑本")).not.toHaveClass("album-page-scrollbar", "overflow-y-auto");
    expect(screen.getByLabelText("新建碎碎念内容滚动区")).not.toHaveClass("album-page-scrollbar", "overflow-y-auto");
    expect(screen.getByLabelText("碎碎念富文本编辑纸张")).toHaveClass("album-page-scrollbar", "h-[545px]", "overflow-y-auto");
    ["撤销", "H1", "H2", "H3", "无序列表", "有序列表", "任务列表", "加粗", "删除线", "斜体", "下划线", "代码块", "表格", "表情包", "文字颜色", "图片", "视频"].forEach((name) => {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    });
    expect(within(screen.getByLabelText("富文本工具栏")).queryByRole("button", { name: "背景" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "自定义背景" })).toBeInTheDocument();
    ["H4", "H5", "H6"].forEach((name) => {
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
    });
    ["新增表格行", "删除表格行", "新增表格列", "删除表格列"].forEach((name) => {
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: "链接" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("上传图片附件")).toHaveAttribute("accept", "image/*");
    expect(screen.getByLabelText("上传视频附件")).toHaveAttribute("accept", "video/*");
    expect(screen.queryByRole("button", { name: "标题" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "列表" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("碎碎念富文本编辑纸张")).toBeInTheDocument();
    expect(screen.queryByLabelText("碎碎念富文本预览纸张")).not.toBeInTheDocument();
    expect(screen.queryByText("本地预览")).not.toBeInTheDocument();
    expect(screen.queryByText("开始写一点今天的小事。")).not.toBeInTheDocument();
  });

  it("renders the playlists page with the shared diary tabs header", async () => {
    await act(async () => {
      render(await PlaylistsPage());
    });

    expect(screen.getByRole("main")).toHaveClass("album-page-scrollbar", "h-dvh", "overflow-y-auto", "bg-[#f7f1e8]");
    expect(screen.getByRole("link", { name: "返回首页小镇" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("navigation", { name: "内容页导航" })).toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "内容页导航" })).getByText("歌单")).toHaveClass("rounded-full", "bg-[#ffb9c8]");
    expect(screen.getByLabelText("歌单列表")).toBeInTheDocument();
    expect(screen.getByLabelText("今日循环歌曲")).toBeInTheDocument();
    expect(screen.getByLabelText("耳机留言播放器")).toBeInTheDocument();
    expect(screen.getByLabelText("当前播放栏")).toBeInTheDocument();
    expect(screen.getAllByText("doll").length).toBeGreaterThan(0);
  });

  it("renders the playlists demo page in demo mode", async () => {
    await updateDisplayMode("playlists", "demo");

    render(await PlaylistsPage());

    expect(screen.getByRole("heading", { level: 1, name: "歌单" })).toBeInTheDocument();
    expect(screen.getByText("歌单-演示模式")).toBeInTheDocument();
    expect(screen.getByText("这是歌单模块的基础演示内容。")).toBeInTheDocument();
    expect(screen.queryByLabelText("歌单列表")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("当前播放栏")).not.toBeInTheDocument();
  });

  it("renders the coffee page with the shared diary tabs header", async () => {
    render(await CoffeePage());

    expect(screen.getByRole("heading", { level: 1, name: "咖啡推荐" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "内容页导航" })).toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "内容页导航" })).getByText("咖啡推荐")).toHaveClass("rounded-full", "bg-[#ffb9c8]");
  });

  it("renders the coffee demo page in demo mode", async () => {
    await updateDisplayMode("coffee", "demo");

    render(await CoffeePage());

    expect(screen.getByRole("heading", { level: 1, name: "咖啡推荐" })).toBeInTheDocument();
    expect(screen.getByText("咖啡推荐-演示模式")).toBeInTheDocument();
    expect(screen.getByText("这是咖啡推荐模块的基础演示内容。")).toBeInTheDocument();
  });

  it("renders the todo page with the shared diary tabs header", async () => {
    render(await TodoPage());

    expect(screen.getByRole("heading", { level: 1, name: "人生todolist" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "内容页导航" })).toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "内容页导航" })).getByText("人生todolist")).toHaveClass("rounded-full", "bg-[#ffb9c8]");
  });

  it("renders the todo demo page in demo mode", async () => {
    await updateDisplayMode("todo", "demo");

    render(await TodoPage());

    expect(screen.getByRole("heading", { level: 1, name: "人生todolist" })).toBeInTheDocument();
    expect(screen.getByText("人生todolist-演示模式")).toBeInTheDocument();
    expect(screen.getByText("这是人生todolist模块的基础演示内容。")).toBeInTheDocument();
  });

  it("renders the message page with the shared diary tabs header", async () => {
    render(await MessagePage());

    expect(screen.getByRole("heading", { level: 1, name: "学习笔记" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "内容页导航" })).toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "内容页导航" })).getByText("学习笔记")).toHaveClass("rounded-full", "bg-[#ffb9c8]");
  });

  it("renders the message demo page in demo mode", async () => {
    await updateDisplayMode("message", "demo");

    render(await MessagePage());

    expect(screen.getByRole("heading", { level: 1, name: "学习笔记" })).toBeInTheDocument();
    expect(screen.getByText("学习笔记-演示模式")).toBeInTheDocument();
    expect(screen.getByText("这是学习笔记模块的基础演示内容。")).toBeInTheDocument();
  });
});
