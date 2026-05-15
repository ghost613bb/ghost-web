import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage from "./about/page";
import AlbumPage from "./album/page";
import MessagePage from "./message/page";
import PlaylistsPage from "./playlists/page";
import TodoPage from "./todo/page";

describe("content module pages", () => {
  it("renders the about page", () => {
    render(<AboutPage />);

    expect(screen.getByRole("heading", { level: 1, name: "关于我" })).toBeInTheDocument();
    expect(screen.getByText(/长期生长的数字花园/)).toBeInTheDocument();
  });

  it("renders the album page", () => {
    render(<AlbumPage />);

    expect(screen.getByRole("heading", { level: 1, name: "相册" })).toBeInTheDocument();
    expect(screen.getByText("窗边的绿")).toBeInTheDocument();
  });

  it("renders the playlists page", () => {
    render(<PlaylistsPage />);

    expect(screen.getByRole("heading", { level: 1, name: "歌单" })).toBeInTheDocument();
    expect(screen.getByText("晚风循环曲")).toBeInTheDocument();
  });

  it("renders the todo page", () => {
    render(<TodoPage />);

    expect(screen.getByRole("heading", { level: 1, name: "人生 Todo" })).toBeInTheDocument();
    expect(screen.getByText("做一个真正像自己的个人网站")).toBeInTheDocument();
  });

  it("renders the message page form shell", () => {
    render(<MessagePage />);

    expect(screen.getByRole("heading", { level: 1, name: "留言" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("怎么称呼你")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "第一版先展示，提交功能建设中" })).toBeInTheDocument();
  });
});
