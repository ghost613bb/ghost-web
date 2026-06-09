import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  featuredPlaylistSongId,
  playlistCollections,
  playlistNotes,
  playlistPlayerSnapshot,
  playlistSongs,
} from "@/data/playlists";
import { PlaylistsPageView } from "./PlaylistsPage";

function renderPlaylistsPage() {
  render(
    <PlaylistsPageView
      collections={playlistCollections}
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
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("pause"));
    });

    Object.defineProperty(HTMLMediaElement.prototype, "duration", {
      configurable: true,
      get: () => 120,
    });
  });

  it("renders the warm playlist workspace", () => {
    renderPlaylistsPage();

    expect(screen.getByRole("main")).toHaveClass("album-page-scrollbar", "h-dvh", "overflow-y-auto", "bg-[#f7f1e8]");
    expect(screen.getByRole("heading", { level: 1, name: "歌单" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回首页小镇" })).toHaveAttribute("href", "/");
    expect(screen.getByLabelText("歌单列表")).toBeInTheDocument();
    expect(screen.getByLabelText("今日循环歌曲")).toBeInTheDocument();
    expect(screen.getByLabelText("耳机留言播放器")).toBeInTheDocument();
    expect(screen.getByLabelText("当前播放栏")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Daily Moods" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Collection" })).toBeInTheDocument();
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
      song.tags.forEach((tag) => {
        expect(screen.getAllByText(tag).length).toBeGreaterThan(0);
      });
    });

    expect(screen.queryByText("电子充电器")).not.toBeInTheDocument();
  });

  it("switches collections and updates the main content together", () => {
    renderPlaylistsPage();

    fireEvent.click(screen.getByRole("button", { name: /Coding Spark/ }));

    const playerBar = screen.getByLabelText("当前播放栏");
    const commentPanel = screen.getByLabelText("耳机留言播放器");

    expect(screen.getByRole("heading", { level: 2, name: "Coding Spark" })).toBeInTheDocument();
    expect(screen.getByText("像给自己插上电源，适合写代码前听。")).toBeInTheDocument();
    expect(screen.getAllByText("电子充电器").length).toBeGreaterThan(0);
    expect(screen.queryByText("doll")).not.toBeInTheDocument();
    expect(within(playerBar).getByRole("heading", { level: 2, name: "电子充电器" })).toBeInTheDocument();
    expect(within(playerBar).getByText("像素汽水")).toBeInTheDocument();
    expect(within(commentPanel).getByText("Ranima", { exact: false })).toBeInTheDocument();
    expect(within(commentPanel).queryByText("Name", { exact: false })).not.toBeInTheDocument();
  });

  it("highlights the featured song in the table and bottom player", () => {
    renderPlaylistsPage();

    const featuredSong = playlistSongs.find((song) => song.id === featuredPlaylistSongId);

    expect(featuredSong).toBeDefined();
    expect(screen.getAllByRole("button", { name: `播放${featuredSong?.title}` }).length).toBeGreaterThan(0);

    const playerBar = screen.getByLabelText("当前播放栏");
    expect(within(playerBar).getByRole("heading", { level: 2, name: featuredSong?.title })).toBeInTheDocument();
    expect(within(playerBar).getByText(featuredSong?.artist ?? "")).toBeInTheDocument();
    expect(within(playerBar).getByText("0:00")).toBeInTheDocument();
    expect(within(playerBar).getByText(playlistPlayerSnapshot.duration)).toBeInTheDocument();
    expect(within(playerBar).getByText(playlistPlayerSnapshot.statusLabel)).toBeInTheDocument();
    expect(within(playerBar).getByRole("button", { name: "上一首" })).toBeInTheDocument();
    expect(within(playerBar).getByRole("button", { name: "下一首" })).toBeInTheDocument();
  });

  it("renders comment notes for the featured listening panel", () => {
    renderPlaylistsPage();

    const commentPanel = screen.getByLabelText("耳机留言播放器");

    expect(within(commentPanel).getByPlaceholderText("Add a cute comment...")).toBeInTheDocument();
    const featuredNotes = playlistNotes.filter((note) => note.songId === featuredPlaylistSongId);

    featuredNotes.forEach((note) => {
      expect(within(commentPanel).getByText(note.author, { exact: false })).toBeInTheDocument();
      expect(within(commentPanel).getByText(note.content)).toBeInTheDocument();
    });
    expect(within(commentPanel).queryByText("Ranima", { exact: false })).not.toBeInTheDocument();
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

  it("switches songs from the song table and updates the shared player state", () => {
    renderPlaylistsPage();

    const playerBar = screen.getByLabelText("当前播放栏");

    fireEvent.click(screen.getAllByRole("button", { name: "播放云朵软糖拍" })[0]);

    expect(within(playerBar).getByText("云朵软糖拍")).toBeInTheDocument();
    expect(within(playerBar).getByText("棉花兔")).toBeInTheDocument();
    expect(within(playerBar).getByText("正在播放 云朵软糖拍")).toBeInTheDocument();
    expect(screen.getByText("像被一朵毛茸茸的云接住，适合下午发呆。")).toBeInTheDocument();
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
