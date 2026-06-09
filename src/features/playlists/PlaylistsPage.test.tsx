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

  function renderPage() {
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

  it("plays and pauses the current song from the bottom player", () => {
    const playMock = vi.spyOn(HTMLMediaElement.prototype, "play");
    const pauseMock = vi.spyOn(HTMLMediaElement.prototype, "pause");

    renderPage();

    const playerBar = screen.getByLabelText("当前播放栏");

    fireEvent.click(within(playerBar).getByRole("button", { name: "播放晚风循环曲" }));

    expect(playMock).toHaveBeenCalledTimes(1);
    expect(within(playerBar).getByText("正在播放 晚风循环曲")).toBeInTheDocument();
    expect(within(playerBar).getByRole("button", { name: "暂停晚风循环曲" })).toBeInTheDocument();

    fireEvent.click(within(playerBar).getByRole("button", { name: "暂停晚风循环曲" }));

    expect(pauseMock).toHaveBeenCalledTimes(1);
    expect(within(playerBar).getByRole("button", { name: "播放晚风循环曲" })).toBeInTheDocument();
  });

  it("switches songs from the song table and updates the shared player state", () => {
    renderPage();

    const playerBar = screen.getByLabelText("当前播放栏");

    fireEvent.click(screen.getAllByRole("button", { name: "播放电子充电器" })[0]);

    expect(within(playerBar).getByText("电子充电器")).toBeInTheDocument();
    expect(within(playerBar).getByText("像素汽水")).toBeInTheDocument();
    expect(within(playerBar).getByText("正在播放 电子充电器")).toBeInTheDocument();
    expect(screen.getByText("像给自己插上电源，适合写代码前听。")).toBeInTheDocument();
  });

  it("seeks progress and changes volume from the bottom player", () => {
    renderPage();

    const playerBar = screen.getByLabelText("当前播放栏");
    const audio = document.querySelector("audio") as HTMLAudioElement;

    fireEvent.click(within(playerBar).getByRole("button", { name: "播放晚风循环曲" }));
    fireEvent.change(within(playerBar).getByLabelText("播放进度"), { target: { value: "50" } });
    fireEvent.change(within(playerBar).getByLabelText("播放器音量"), { target: { value: "25" } });

    expect(audio.currentTime).toBe(60);
    expect(audio.volume).toBe(0.25);
  });
});
