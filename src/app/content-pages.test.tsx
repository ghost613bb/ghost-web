import { existsSync } from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { homeModules } from "@/features/home-world/config/homeModules";
import AboutPage from "./about/page";
import AlbumPage from "./album/page";
import MessagePage from "./message/page";
import PlaylistsPage from "./playlists/page";
import TodoPage from "./todo/page";

const pageNames = {
  about: "关于我小屋",
  thoughts: "博客图书馆",
  album: "技能温室",
  playlists: "项目工坊",
  todo: "经历塔楼",
  message: "联系邮局",
} as const;

describe("content module pages", () => {
  it("has a page file for every home module route", () => {
    for (const module of homeModules) {
      const routePath = module.route.replace(/^\//, "");
      expect(existsSync(path.join(process.cwd(), "src/app", routePath, "page.tsx")), module.route).toBe(true);
    }
  });

  it("renders only the about page name", () => {
    render(<AboutPage />);

    expect(screen.getByRole("heading", { level: 1, name: pageNames.about })).toBeInTheDocument();
    expect(screen.queryByText(/长期生长的数字花园/)).not.toBeInTheDocument();
  });

  it("renders only the album page name", () => {
    render(<AlbumPage />);

    expect(screen.getByRole("heading", { level: 1, name: pageNames.album })).toBeInTheDocument();
    expect(screen.queryByText("窗边的绿")).not.toBeInTheDocument();
  });

  it("renders only the playlists page name", () => {
    render(<PlaylistsPage />);

    expect(screen.getByRole("heading", { level: 1, name: pageNames.playlists })).toBeInTheDocument();
    expect(screen.queryByText("晚风循环曲")).not.toBeInTheDocument();
  });

  it("renders only the todo page name", () => {
    render(<TodoPage />);

    expect(screen.getByRole("heading", { level: 1, name: pageNames.todo })).toBeInTheDocument();
    expect(screen.queryByText("做一个真正像自己的个人网站")).not.toBeInTheDocument();
  });

  it("renders only the message page name", () => {
    render(<MessagePage />);

    expect(screen.getByRole("heading", { level: 1, name: pageNames.message })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("怎么称呼你")).not.toBeInTheDocument();
  });
});
