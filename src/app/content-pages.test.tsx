import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import AboutPage from "./about/page";
import AlbumPage from "./album/page";
import CoffeePage from "./coffee/page";
import MessagePage from "./message/page";
import PlaylistsPage from "./playlists/page";
import ThoughtsPage from "./thoughts/page";
import TodoPage from "./todo/page";
import { resetDisplayModes, updateDisplayMode } from "@/features/module-display-mode/service";

describe("content module pages", () => {
  beforeEach(async () => {
    await resetDisplayModes();
  });

  it("renders the about page heading", () => {
    render(<AboutPage />);

    expect(screen.getByRole("heading", { level: 1, name: "心情日记" })).toBeInTheDocument();
  });

  it("renders the album page heading", () => {
    render(<AlbumPage />);

    expect(screen.getByRole("heading", { level: 1, name: "个人相册" })).toBeInTheDocument();
  });

  it("renders the thoughts page heading in real mode", async () => {
    render(await ThoughtsPage());

    expect(screen.getByRole("heading", { level: 1, name: "碎碎念" })).toBeInTheDocument();
    expect(screen.queryByText("这是碎碎念模块的试玩版页面。")).not.toBeInTheDocument();
  });

  it("renders the thoughts demo page in demo mode", async () => {
    await updateDisplayMode("thoughts", "demo");

    render(await ThoughtsPage());

    expect(screen.getByRole("heading", { level: 1, name: "碎碎念（试玩模式）" })).toBeInTheDocument();
    expect(screen.getByText("这是碎碎念模块的试玩版页面。")).toBeInTheDocument();
    expect(screen.getByText("你可以先体验基础编辑交互，但这里不会展示我的真实内容。")).toBeInTheDocument();
  });

  it("renders the playlists page heading", () => {
    render(<PlaylistsPage />);

    expect(screen.getByRole("heading", { level: 1, name: "歌单" })).toBeInTheDocument();
  });

  it("renders the coffee page heading", () => {
    render(<CoffeePage />);

    expect(screen.getByRole("heading", { level: 1, name: "咖啡推荐" })).toBeInTheDocument();
  });

  it("renders the todo page heading", () => {
    render(<TodoPage />);

    expect(screen.getByRole("heading", { level: 1, name: "人生todolist" })).toBeInTheDocument();
  });

  it("renders the message page heading", () => {
    render(<MessagePage />);

    expect(screen.getByRole("heading", { level: 1, name: "学习笔记" })).toBeInTheDocument();
  });
});
