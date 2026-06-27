import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  featuredPlaylistSongId,
  playlistCollections,
  playlistNotes,
  playlistPlayerSnapshot,
  playlistSongs,
} from "@/data/playlists";
import { PlaylistsPageView } from "./PlaylistsPage";

function mockAdminSessionFetch(authenticated = false) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) === "/api/admin/session") {
        const method = init?.method;
        return {
          ok: method === "POST" ? true : authenticated,
          json: async () => ({ authenticated: method === "POST" ? true : authenticated }),
        };
      }

      throw new Error(`Unexpected fetch: ${String(input)}`);
    }),
  );
}

async function unlockPlaylistAdmin(token = "test-token") {
  fireEvent.change(screen.getByLabelText("管理 Token"), { target: { value: token } });
  fireEvent.click(screen.getByRole("button", { name: "解锁管理" }));
  await screen.findByText("已解锁");
}

function renderPlaylistsPage(dataSource: "static" | "supabase" = "supabase") {
  render(
    <PlaylistsPageView
      collections={playlistCollections}
      dataSource={dataSource}
      featuredSongId={featuredPlaylistSongId}
      notes={playlistNotes}
      playerSnapshot={playlistPlayerSnapshot}
      songs={playlistSongs}
    />,
  );
}

describe("PlaylistsPageView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.HTMLElement.prototype.scrollTo = vi.fn();
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("pause"));
    });
    mockAdminSessionFetch();

    Object.defineProperty(HTMLMediaElement.prototype, "duration", {
      configurable: true,
      get: () => 120,
    });
  });

  it("renders the warm playlist workspace", async () => {
    await act(async () => {
      renderPlaylistsPage();
    });

    expect(screen.getByRole("main")).toHaveClass("album-page-scrollbar", "h-dvh", "overflow-y-auto", "bg-[#f7f1e8]");
    expect(screen.getByRole("heading", { level: 1, name: "Soundtrack" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回首页小镇" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("navigation", { name: "内容页导航" })).toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "内容页导航" })).getByText("歌单")).toHaveClass("rounded-full", "bg-[#ffb9c8]");
    expect(screen.getByLabelText("歌单列表")).toBeInTheDocument();
    expect(screen.getByLabelText("今日循环歌曲")).toBeInTheDocument();
    expect(screen.getByLabelText("耳机留言播放器")).toBeInTheDocument();
    expect(screen.getByLabelText("当前播放栏")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Daily Moods" })).toBeInTheDocument();
    expect(screen.getByText("数据源：Supabase")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Collection" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "批量导入歌曲" })).toBeInTheDocument();
  });

  it("disables playlist management for static fallback data", () => {
    renderPlaylistsPage("static");

    expect(screen.getByRole("button", { name: "New Collection" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "批量导入歌曲" })).toBeDisabled();
  });

  it("renders playlist collections and active collection songs from data", () => {
    renderPlaylistsPage();

    playlistCollections.forEach((collection) => {
      expect(screen.getByRole("heading", { level: 3, name: collection.title })).toBeInTheDocument();
    });

    const activeCollection = playlistCollections[0];
    const activeSongs = playlistSongs.filter((song) => activeCollection.songIds.includes(song.id));

    activeSongs.forEach((song) => {
      expect(screen.getAllByText(song.title).length).toBeGreaterThan(0);
      expect(screen.getAllByText(song.artist).length).toBeGreaterThan(0);
      expect(screen.getAllByText(song.duration ?? "").length).toBeGreaterThan(0);
    });

    expect(screen.getByText("Playlist detail · 6 minutes")).toBeInTheDocument();
    expect(screen.queryByText("电子充电器")).not.toBeInTheDocument();
  });

  it("switches collections and updates the main content together", () => {
    renderPlaylistsPage();

    fireEvent.click(screen.getByRole("button", { name: /Coding Spark/ }));

    const playerBar = screen.getByLabelText("当前播放栏");
    const commentPanel = screen.getByLabelText("耳机留言播放器");

    expect(screen.getByRole("heading", { level: 2, name: "Coding Spark" })).toBeInTheDocument();
    expect(screen.getByText("把夜空里的一颗星留给耳机，适合慢慢循环。")).toBeInTheDocument();
    expect(screen.getAllByText("予星").length).toBeGreaterThan(0);
    expect(screen.queryByText("doll")).not.toBeInTheDocument();
    expect(within(playerBar).getByRole("heading", { level: 2, name: "予星" })).toBeInTheDocument();
    expect(within(playerBar).getByText("Kui Kui, 周一")).toBeInTheDocument();
    expect(within(commentPanel).getByText("这片声波还没有回信。")).toBeInTheDocument();
    expect(within(commentPanel).queryByText("Name", { exact: false })).not.toBeInTheDocument();
  });

  it("renders the active collection cover in hero panel", () => {
    renderPlaylistsPage();

    expect(screen.getByRole("img", { name: `${playlistCollections[0].title}歌单封面` })).toHaveAttribute("src", playlistCollections[0].coverImageSrc);
  });

  it("highlights the featured song in the table and bottom player", () => {
    renderPlaylistsPage();

    const featuredSong = playlistSongs.find((song) => song.id === featuredPlaylistSongId);

    expect(featuredSong).toBeDefined();
    expect(screen.getAllByRole("button", { name: `播放${featuredSong?.title}` }).length).toBeGreaterThan(0);

    const playerBar = screen.getByLabelText("当前播放栏");
    expect(within(playerBar).getByRole("heading", { level: 2, name: featuredSong?.title })).toBeInTheDocument();
    expect(within(playerBar).getByRole("img", { name: `${featuredSong?.title}封面` })).toHaveAttribute("src", featuredSong?.coverImageSrc);
    expect(within(playerBar).getByText(featuredSong?.artist ?? "")).toBeInTheDocument();
    expect(within(playerBar).getByText("0:00")).toBeInTheDocument();
    expect(within(playerBar).getByText(featuredSong?.duration ?? "")).toBeInTheDocument();
    expect(within(playerBar).getByText(playlistPlayerSnapshot.statusLabel)).toBeInTheDocument();
    expect(within(playerBar).getByRole("button", { name: "切换到随机播放" })).toHaveAttribute("title", "顺序播放");
    expect(within(playerBar).getByRole("button", { name: "上一首" })).toBeInTheDocument();
    expect(within(playerBar).getByRole("button", { name: "下一首" })).toBeInTheDocument();
    expect(within(playerBar).getByRole("button", { name: "打开歌词" })).toBeInTheDocument();
  });

  it("opens the create collection dialog", async () => {
    renderPlaylistsPage();
    await unlockPlaylistAdmin();

    fireEvent.click(screen.getByRole("button", { name: "New Collection" }));

    const createDialog = screen.getByLabelText("新增歌单");

    expect(createDialog).toBeInTheDocument();
    expect(within(createDialog).queryByLabelText("管理 Token")).not.toBeInTheDocument();
    expect(within(createDialog).getByLabelText("歌单名称")).toBeInTheDocument();
    expect(within(createDialog).getByLabelText("歌单封面")).toBeInTheDocument();
    expect(screen.getByText("创建一个空歌单，可选上传封面，之后可以继续批量导入歌曲。", { exact: false })).toBeInTheDocument();
  });

  it("creates a collection and switches to its empty state", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/admin/session") {
        return { ok: true, json: async () => ({ authenticated: true }) };
      }

      return {
        ok: true,
        json: async () => ({
          collection: {
            accentClass: "bg-[#e5f0ff]",
            description: "夜里慢慢听。",
            emoji: "🌙",
            id: "collection-late-night-loop-1234abcd",
            songIds: [],
            title: "Late Night Loop",
          },
        }),
      };
    });

    vi.stubGlobal("fetch", fetchMock);
    renderPlaylistsPage();
    await screen.findByText("已解锁");

    fireEvent.click(screen.getByRole("button", { name: "New Collection" }));
    const createDialog = screen.getByLabelText("新增歌单");

    fireEvent.change(within(createDialog).getByLabelText("歌单名称"), { target: { value: "Late Night Loop" } });
    fireEvent.change(within(createDialog).getByLabelText("描述"), { target: { value: "夜里慢慢听。" } });
    fireEvent.change(within(createDialog).getByLabelText("图标"), { target: { value: "🌙" } });
    fireEvent.click(within(createDialog).getByRole("combobox", { name: "主题色" }));
    fireEvent.click(screen.getByRole("option", { name: "晴空蓝" }));
    fireEvent.click(within(createDialog).getByRole("button", { name: "创建歌单" }));

    expect(await screen.findByRole("heading", { level: 3, name: "Late Night Loop" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Late Night Loop" })).toBeInTheDocument();
    expect(screen.getAllByText("夜里慢慢听。").length).toBeGreaterThan(0);
    expect(screen.getByText("这个歌单还没有歌曲。点击左侧“批量导入歌曲”添加 MP3 和 LRC。")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/playlists/collections",
      expect.objectContaining({
        credentials: "same-origin",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        method: "POST",
      }),
    );
  });

  it("creates a collection with cover upload", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/admin/session") {
        return { ok: true, json: async () => ({ authenticated: true }) };
      }

      return {
        ok: true,
        json: async () => ({
          collection: {
            accentClass: "bg-[#e5f0ff]",
            coverImageSrc: "/covers/late-night-loop.png",
            description: "夜里慢慢听。",
            emoji: "🌙",
            id: "collection-late-night-loop-1234abcd",
            songIds: [],
            title: "Late Night Loop",
          },
        }),
      };
    });

    vi.stubGlobal("fetch", fetchMock);
    renderPlaylistsPage();
    await screen.findByText("已解锁");

    fireEvent.click(screen.getByRole("button", { name: "New Collection" }));
    const createDialog = screen.getByLabelText("新增歌单");
    const coverFile = new File(["png"], "cover.png", { type: "image/png" });
    const coverInput = within(createDialog).getByLabelText("歌单封面") as HTMLInputElement;

    fireEvent.change(within(createDialog).getByLabelText("歌单名称"), { target: { value: "Late Night Loop" } });
    fireEvent.change(within(createDialog).getByLabelText("描述"), { target: { value: "夜里慢慢听。" } });
    fireEvent.change(within(createDialog).getByLabelText("图标"), { target: { value: "🌙" } });
    fireEvent.click(within(createDialog).getByRole("combobox", { name: "主题色" }));
    fireEvent.click(screen.getByRole("option", { name: "晴空蓝" }));
    fireEvent.change(coverInput, { target: { files: [coverFile] } });
    fireEvent.click(within(createDialog).getByRole("button", { name: "创建歌单" }));

    const collectionRequest = fetchMock.mock.calls.find(([input]) => String(input) === "/api/playlists/collections") as [RequestInfo | URL, RequestInit] | undefined;

    await screen.findByRole("img", { name: "Late Night Loop歌单封面" });
    expect(collectionRequest?.[1]).toEqual(
      expect.objectContaining({
        body: expect.any(FormData),
        credentials: "same-origin",
        method: "POST",
      }),
    );
    expect(collectionRequest?.[1].headers).toBeUndefined();
  });

  it("uploads a playlist cover from admin mode", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/admin/session") {
        return { ok: true, json: async () => ({ authenticated: true }) };
      }

      return {
        ok: true,
        json: async () => ({
          collection: {
            accentClass: playlistCollections[0].accentClass,
            coverImageSrc: "/covers/late-night-loop.png",
            description: playlistCollections[0].description,
            emoji: playlistCollections[0].emoji,
            id: playlistCollections[0].id,
            title: playlistCollections[0].title,
          },
        }),
      };
    });

    vi.stubGlobal("fetch", fetchMock);
    renderPlaylistsPage();
    await screen.findByText("已解锁");

    const sidebar = screen.getByLabelText("歌单列表");
    fireEvent.click(within(sidebar).getAllByRole("button", { name: "编辑" })[0]);
    const editDialog = screen.getByLabelText("编辑歌单");
    const coverFile = new File(["png"], "cover.png", { type: "image/png" });
    const coverInput = within(editDialog).getByLabelText("歌单封面") as HTMLInputElement;

    fireEvent.change(coverInput, { target: { files: [coverFile] } });
    fireEvent.click(within(editDialog).getByRole("button", { name: "保存歌单" }));

    await screen.findByRole("img", { name: `${playlistCollections[0].title}歌单封面` });
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/playlists/collections/${playlistCollections[0].id}/cover`,
      expect.objectContaining({
        credentials: "same-origin",
        method: "POST",
      }),
    );
  });

  it("edits a playlist collection from admin mode", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/admin/session") {
        return { ok: true, json: async () => ({ authenticated: true }) };
      }

      return {
        ok: true,
        json: async () => ({
          collection: {
            accentClass: "bg-[#e5f0ff]",
            description: "夜里慢慢听。",
            emoji: "🌙",
            id: playlistCollections[0].id,
            title: "Late Night Loop",
          },
        }),
      };
    });

    vi.stubGlobal("fetch", fetchMock);
    renderPlaylistsPage();
    await screen.findByText("已解锁");

    const sidebar = screen.getByLabelText("歌单列表");
    fireEvent.click(within(sidebar).getAllByRole("button", { name: "编辑" })[0]);
    const editDialog = screen.getByLabelText("编辑歌单");

    fireEvent.change(within(editDialog).getByLabelText("歌单名称"), { target: { value: "Late Night Loop" } });
    fireEvent.change(within(editDialog).getByLabelText("描述"), { target: { value: "夜里慢慢听。" } });
    fireEvent.change(within(editDialog).getByLabelText("图标"), { target: { value: "🌙" } });
    fireEvent.click(within(editDialog).getByRole("combobox", { name: "主题色" }));
    fireEvent.click(screen.getByRole("option", { name: "晴空蓝" }));
    fireEvent.click(within(editDialog).getByRole("button", { name: "保存歌单" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      `/api/playlists/collections/${playlistCollections[0].id}`,
      expect.objectContaining({
        credentials: "same-origin",
        method: "PATCH",
      }),
    ));
    await waitFor(() => expect(screen.queryByLabelText("编辑歌单")).not.toBeInTheDocument());
  });

  it("deletes a playlist collection from admin mode", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/admin/session") {
        return { ok: true, json: async () => ({ authenticated: true }) };
      }

      return { ok: true, json: async () => ({ ok: true }) };
    });

    vi.stubGlobal("fetch", fetchMock);
    renderPlaylistsPage();
    await screen.findByText("已解锁");

    const sidebar = screen.getByLabelText("歌单列表");
    fireEvent.click(within(sidebar).getAllByRole("button", { name: "删除" })[0]);

    const confirmDialog = screen.getByRole("dialog", { name: "删除歌单" });

    expect(within(confirmDialog).getByText(`确定删除「${playlistCollections[0].title}」吗？`)).toBeInTheDocument();
    fireEvent.click(within(confirmDialog).getByRole("button", { name: "确认删除" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(`/api/playlists/collections/${playlistCollections[0].id}`, expect.objectContaining({ method: "DELETE" })));
    expect(screen.getByRole("heading", { level: 2, name: "Sunset Walk" })).toBeInTheDocument();
  });

  it("opens the batch import dialog", async () => {
    renderPlaylistsPage();
    await unlockPlaylistAdmin();

    fireEvent.click(screen.getByRole("button", { name: "批量导入歌曲" }));

    const importDialog = screen.getByLabelText("批量导入歌曲");

    expect(importDialog).toBeInTheDocument();
    expect(importDialog).toHaveClass("max-h-[calc(100dvh-2rem)]", "overflow-y-auto");
    expect(within(importDialog).queryByLabelText("管理 Token")).not.toBeInTheDocument();
    expect(within(importDialog).getByText("上传 MP3 和同名 LRC，自动解析封面、歌词和短音评。", { exact: false })).toBeInTheDocument();

    fireEvent.click(within(importDialog).getByRole("combobox", { name: "导入到歌单" }));
    fireEvent.click(screen.getByRole("option", { name: "Coding Spark" }));
    expect(within(importDialog).getByRole("combobox", { name: "导入到歌单" })).toHaveTextContent("Coding Spark");
  });

  it("keeps song batch management locked for static fallback data", () => {
    renderPlaylistsPage("static");

    expect(screen.queryByRole("button", { name: "批量管理歌曲" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("选择doll")).not.toBeInTheDocument();
  });

  it("removes selected songs from the current collection", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      void init;

      if (String(input) === "/api/admin/session") {
        return { ok: true, json: async () => ({ authenticated: true }) };
      }

      return {
        ok: true,
        json: async () => ({
          action: "remove",
          ok: true,
          removedSongIds: ["song-001"],
          sourceSongIds: ["song-007"],
        }),
      };
    });

    vi.stubGlobal("fetch", fetchMock);
    renderPlaylistsPage();
    await screen.findByText("已解锁");

    const songSection = screen.getByLabelText("今日循环歌曲");

    fireEvent.click(within(songSection).getByRole("button", { name: "批量管理歌曲" }));
    fireEvent.click(within(songSection).getAllByLabelText("选择doll")[0]);
    fireEvent.click(within(songSection).getByRole("button", { name: "从当前歌单移除选中歌曲" }));

    const confirmDialog = screen.getByRole("dialog", { name: "移出当前歌单" });

    expect(within(confirmDialog).getByText(`确定从「${playlistCollections[0].title}」移除选中的 1 首歌吗？不会删除歌曲本体。`)).toBeInTheDocument();
    fireEvent.click(within(confirmDialog).getByRole("button", { name: "确认移出" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(`/api/playlists/collections/${playlistCollections[0].id}/songs`, expect.objectContaining({ method: "PATCH" })));
    const songsRequest = fetchMock.mock.calls.find(([input]) => String(input) === `/api/playlists/collections/${playlistCollections[0].id}/songs`);

    expect(JSON.parse(String((songsRequest?.[1] as RequestInit).body))).toEqual({ action: "remove", songIds: ["song-001"] });
    expect(within(songSection).getByText("1 首")).toBeInTheDocument();
    expect(within(songSection).queryByText("doll")).not.toBeInTheDocument();
    expect(within(screen.getByLabelText("当前播放栏")).getByRole("heading", { level: 2, name: "予星" })).toBeInTheDocument();
  });

  it("moves selected songs into another collection", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      void init;

      if (String(input) === "/api/admin/session") {
        return { ok: true, json: async () => ({ authenticated: true }) };
      }

      return {
        ok: true,
        json: async () => ({
          action: "move",
          movedSongIds: ["song-001"],
          ok: true,
          sourceCollectionId: playlistCollections[0].id,
          sourceSongIds: ["song-007"],
          targetCollectionId: "coding-spark",
          targetSongIds: ["song-007", "song-001"],
        }),
      };
    });

    vi.stubGlobal("fetch", fetchMock);
    renderPlaylistsPage();
    await screen.findByText("已解锁");

    const songSection = screen.getByLabelText("今日循环歌曲");

    fireEvent.click(within(songSection).getByRole("button", { name: "批量管理歌曲" }));
    fireEvent.click(within(songSection).getAllByLabelText("选择doll")[0]);
    fireEvent.click(within(songSection).getByRole("combobox", { name: "移动到" }));
    fireEvent.click(screen.getByRole("option", { name: "Coding Spark" }));
    fireEvent.click(within(songSection).getByRole("button", { name: "移动" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(`/api/playlists/collections/${playlistCollections[0].id}/songs`, expect.objectContaining({ method: "PATCH" })));
    const songsRequest = fetchMock.mock.calls.find(([input]) => String(input) === `/api/playlists/collections/${playlistCollections[0].id}/songs`);

    expect(JSON.parse(String((songsRequest?.[1] as RequestInit).body))).toEqual({ action: "move", songIds: ["song-001"], targetCollectionId: "coding-spark" });
    expect(within(songSection).queryByText("doll")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Coding Spark/ }));

    expect(within(screen.getByLabelText("今日循环歌曲")).getAllByText("doll").length).toBeGreaterThan(0);
  });

  it("renders comment notes for the featured listening panel", async () => {
    renderPlaylistsPage();
    await unlockPlaylistAdmin();

    const commentPanel = screen.getByLabelText("耳机留言播放器");

    expect(within(commentPanel).getByPlaceholderText("Add a cute comment...")).toBeInTheDocument();
    expect(within(commentPanel).getByPlaceholderText("Add a cute comment...")).not.toBeDisabled();
    const featuredNotes = playlistNotes.filter((note) => note.songId === featuredPlaylistSongId);

    featuredNotes.forEach((note) => {
      expect(within(commentPanel).getByText(note.author, { exact: false })).toBeInTheDocument();
      expect(within(commentPanel).getByText(note.content)).toBeInTheDocument();
    });
    expect(within(commentPanel).queryByText("Ranima", { exact: false })).not.toBeInTheDocument();
  });

  it("disables song comments for static fallback data", () => {
    renderPlaylistsPage("static");

    const commentPanel = screen.getByLabelText("耳机留言播放器");

    expect(within(commentPanel).getByPlaceholderText("当前为本地 fallback，歌曲评论需要 Supabase 数据源。")).toBeDisabled();
    expect(within(commentPanel).getByRole("button", { name: "Comment" })).toBeDisabled();
  });

  it("creates a comment for the current song only", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/admin/session") {
        return { ok: true, json: async () => ({ authenticated: true }) };
      }

      return {
        ok: true,
        json: async () => ({
          note: {
            author: "Tester",
            avatar: "🎧",
            content: "今晚循环这一首。",
            id: "note-created-001",
            songId: featuredPlaylistSongId,
            time: "10:05 AM",
          },
        }),
      };
    });

    vi.stubGlobal("fetch", fetchMock);
    renderPlaylistsPage();
    await screen.findByText("已解锁");

    const commentPanel = screen.getByLabelText("耳机留言播放器");
    fireEvent.change(within(commentPanel).getByLabelText("评论昵称"), { target: { value: "Tester" } });
    fireEvent.change(within(commentPanel).getByPlaceholderText("Add a cute comment..."), { target: { value: "今晚循环这一首。" } });
    fireEvent.click(within(commentPanel).getByRole("button", { name: "Comment" }));

    expect(await within(commentPanel).findByText("今晚循环这一首。")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/playlists/songs/${featuredPlaylistSongId}/notes`,
      expect.objectContaining({
        credentials: "same-origin",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        method: "POST",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: /Coding Spark/ }));

    expect(screen.queryByText("今晚循环这一首。")).not.toBeInTheDocument();
  });

  it("confirms before deleting a comment", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/admin/session") {
        return { ok: true, json: async () => ({ authenticated: true }) };
      }

      return { ok: true, json: async () => ({ ok: true }) };
    });

    vi.stubGlobal("fetch", fetchMock);
    renderPlaylistsPage();
    await screen.findByText("已解锁");

    const commentPanel = screen.getByLabelText("耳机留言播放器");
    fireEvent.click(within(commentPanel).getByRole("button", { name: "删除" }));

    const confirmDialog = screen.getByRole("dialog", { name: "删除耳机留言" });

    expect(within(confirmDialog).getByText("确定删除这条评论吗？")).toBeInTheDocument();
    fireEvent.click(within(confirmDialog).getByRole("button", { name: "确认删除" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      `/api/playlists/songs/${featuredPlaylistSongId}/notes/${playlistNotes[0].id}`,
      expect.objectContaining({
        credentials: "same-origin",
        method: "DELETE",
      }),
    ));
    expect(within(commentPanel).queryByText(playlistNotes[0].content)).not.toBeInTheDocument();
  });

  it("switches the right panel to lyrics from the bottom player", () => {
    renderPlaylistsPage();

    const playerBar = screen.getByLabelText("当前播放栏");

    fireEvent.click(within(playerBar).getByRole("button", { name: "打开歌词" }));

    const lyricsPanel = screen.getByLabelText("歌词播放器");
    const featuredSong = playlistSongs.find((song) => song.id === featuredPlaylistSongId);

    expect(screen.queryByLabelText("耳机留言播放器")).not.toBeInTheDocument();
    expect(within(playerBar).getByRole("button", { name: "关闭歌词" })).toHaveAttribute("aria-pressed", "true");
    expect(within(lyricsPanel).getByRole("heading", { level: 2, name: featuredSong?.title })).toBeInTheDocument();
    expect(within(lyricsPanel).getByText(featuredSong?.artist ?? "")).toBeInTheDocument();
    expect(within(lyricsPanel).getByRole("img", { name: `${featuredSong?.title}歌词光盘封面` })).toHaveAttribute("src", featuredSong?.coverImageSrc);
    expect(within(lyricsPanel).getByText("凛冽的风捶打在肩")).toBeInTheDocument();
    expect(within(lyricsPanel).getByText("凛冽的风捶打在肩")).not.toHaveAttribute("aria-current");
  });

  it("syncs the active lyric with playback progress", () => {
    renderPlaylistsPage();

    const playerBar = screen.getByLabelText("当前播放栏");
    const audio = document.querySelector("audio") as HTMLAudioElement;

    fireEvent.click(within(playerBar).getByRole("button", { name: "打开歌词" }));

    const lyricsPanel = screen.getByLabelText("歌词播放器");

    audio.currentTime = 20;
    fireEvent.timeUpdate(audio);

    expect(within(lyricsPanel).getByText("乌鸦在低空下盘旋")).toHaveAttribute("aria-current", "true");
    expect(window.HTMLElement.prototype.scrollTo).toHaveBeenCalled();
  });

  it("does not preload all remote song durations on first render", () => {
    const remoteSongs = [
      {
        ...playlistSongs[0],
        audioSrc: "https://cdn.example.com/remote-song-1.mp3",
        duration: undefined,
        id: "remote-song-1",
        title: "远方的歌一",
      },
      {
        ...playlistSongs[1],
        audioSrc: "https://cdn.example.com/remote-song-2.mp3",
        duration: undefined,
        id: "remote-song-2",
        title: "远方的歌二",
      },
    ];

    render(
      <PlaylistsPageView
        collections={[{ ...playlistCollections[0], songIds: remoteSongs.map((song) => song.id) }]}
        dataSource="supabase"
        featuredSongId={remoteSongs[0].id}
        notes={[]}
        playerSnapshot={playlistPlayerSnapshot}
        songs={remoteSongs}
      />,
    );

    const audioElements = Array.from(document.querySelectorAll("audio"));
    expect(audioElements).toHaveLength(1);
    expect(audioElements[0]).not.toHaveAttribute("src");
  });

  it("uses cached song durations before loading audio metadata", () => {
    const remoteSong = {
      ...playlistSongs[0],
      audioSrc: "https://cdn.example.com/remote-song.mp3",
      duration: undefined,
      id: "remote-song",
      title: "远方的歌",
    };

    window.localStorage.setItem("ghost-web:playlist-duration-labels:v1", JSON.stringify({ [remoteSong.audioSrc]: "5:29" }));
    render(
      <PlaylistsPageView
        collections={[{ ...playlistCollections[0], songIds: [remoteSong.id] }]}
        dataSource="supabase"
        featuredSongId={remoteSong.id}
        notes={[]}
        playerSnapshot={playlistPlayerSnapshot}
        songs={[remoteSong]}
      />,
    );

    expect(screen.getAllByText("5:29").length).toBeGreaterThan(0);
    expect(screen.getByText("Playlist detail · 5 minutes")).toBeInTheDocument();
    expect(screen.queryByText("—")).not.toBeInTheDocument();
  });

  it("cycles playback modes from the bottom player", () => {
    renderPlaylistsPage();

    const playerBar = screen.getByLabelText("当前播放栏");
    const modeButton = within(playerBar).getByRole("button", { name: "切换到随机播放" });

    expect(modeButton).toHaveAttribute("title", "顺序播放");

    fireEvent.click(modeButton);

    expect(within(playerBar).getByRole("button", { name: "切换到单曲循环" })).toHaveAttribute("title", "随机播放");

    fireEvent.click(within(playerBar).getByRole("button", { name: "切换到单曲循环" }));

    expect(within(playerBar).getByRole("button", { name: "切换到顺序播放" })).toHaveAttribute("title", "单曲循环");
  });

  it("plays and pauses the current song from the bottom player", () => {
    const playMock = vi.spyOn(HTMLMediaElement.prototype, "play");
    const pauseMock = vi.spyOn(HTMLMediaElement.prototype, "pause");

    renderPlaylistsPage();

    const playerBar = screen.getByLabelText("当前播放栏");

    fireEvent.click(within(playerBar).getByRole("button", { name: "播放doll" }));

    expect(playMock).toHaveBeenCalledTimes(1);
    expect(within(playerBar).getByText("正在播放 doll")).toBeInTheDocument();
    expect(within(playerBar).getByRole("button", { name: "暂停doll" })).toBeInTheDocument();

    fireEvent.click(within(playerBar).getByRole("button", { name: "暂停doll" }));

    expect(pauseMock).toHaveBeenCalledTimes(1);
    expect(within(playerBar).getByRole("button", { name: "播放doll" })).toBeInTheDocument();
  });

  it("loads and caches a remote song duration only after playback metadata is available", async () => {
    const remoteSong = {
      ...playlistSongs[0],
      audioSrc: "https://cdn.example.com/remote-song.mp3",
      duration: undefined,
      id: "remote-song",
      title: "远方的歌",
    };

    render(
      <PlaylistsPageView
        collections={[{ ...playlistCollections[0], songIds: [remoteSong.id] }]}
        dataSource="supabase"
        featuredSongId={remoteSong.id}
        notes={[]}
        playerSnapshot={playlistPlayerSnapshot}
        songs={[remoteSong]}
      />,
    );

    const playerBar = screen.getByLabelText("当前播放栏");
    const audio = document.querySelector("audio") as HTMLAudioElement;

    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    fireEvent.click(within(playerBar).getByRole("button", { name: "播放远方的歌" }));
    fireEvent.loadedMetadata(audio);

    await waitFor(() => expect(screen.getAllByText("2:00").length).toBeGreaterThan(0));
    expect(JSON.parse(window.localStorage.getItem("ghost-web:playlist-duration-labels:v1") ?? "{}")).toMatchObject({
      [remoteSong.audioSrc]: "2:00",
    });
  });

  it("switches songs from the song table and updates the shared player state", () => {
    renderPlaylistsPage();

    const playerBar = screen.getByLabelText("当前播放栏");

    fireEvent.click(screen.getAllByRole("button", { name: "播放予星" })[0]);

    expect(within(playerBar).getByText("予星")).toBeInTheDocument();
    expect(within(playerBar).getByText("Kui Kui, 周一")).toBeInTheDocument();
    expect(within(playerBar).getByText("正在播放 予星")).toBeInTheDocument();
    expect(screen.getByText("把夜空里的一颗星留给耳机，适合慢慢循环。")).toBeInTheDocument();
  });

  it("seeks progress and changes volume from the bottom player", () => {
    renderPlaylistsPage();

    const playerBar = screen.getByLabelText("当前播放栏");
    const audio = document.querySelector("audio") as HTMLAudioElement;

    fireEvent.click(within(playerBar).getByRole("button", { name: "播放doll" }));
    fireEvent.change(within(playerBar).getByLabelText("播放进度"), { target: { value: "50" } });
    fireEvent.change(within(playerBar).getByLabelText("播放器音量"), { target: { value: "25" } });

    expect(audio.currentTime).toBe(60);
    expect(audio.volume).toBe(0.25);
  });
});
