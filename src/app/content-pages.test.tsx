import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage from "./about/page";
import AlbumPage from "./album/page";
import MessagePage from "./message/page";
import PlaylistsPage from "./playlists/page";
import TodoPage from "./todo/page";

describe("content module pages", () => {
  it("renders the about page heading", () => {
    render(<AboutPage />);

    expect(screen.getByRole("heading", { level: 1, name: "关于我小屋" })).toBeInTheDocument();
  });

  it("renders the album page heading", () => {
    render(<AlbumPage />);

    expect(screen.getByRole("heading", { level: 1, name: "技能温室" })).toBeInTheDocument();
  });

  it("renders the playlists page heading", () => {
    render(<PlaylistsPage />);

    expect(screen.getByRole("heading", { level: 1, name: "项目工坊" })).toBeInTheDocument();
  });

  it("renders the todo page heading", () => {
    render(<TodoPage />);

    expect(screen.getByRole("heading", { level: 1, name: "经历塔楼" })).toBeInTheDocument();
  });

  it("renders the message page heading", () => {
    render(<MessagePage />);

    expect(screen.getByRole("heading", { level: 1, name: "联系邮局" })).toBeInTheDocument();
  });
});
