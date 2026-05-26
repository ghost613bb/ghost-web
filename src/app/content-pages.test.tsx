import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import AboutPage from "./about/page";
import AlbumPage from "./album/page";
import CoffeePage from "./coffee/page";
import MessagePage from "./message/page";
import PlaylistsPage from "./playlists/page";
import ThoughtsPage from "./thoughts/page";
import TodoPage from "./todo/page";
import { thoughts } from "@/data/thoughts";
import { resetDisplayModes, updateDisplayMode } from "@/features/module-display-mode/service";
import { resetStoredThoughts, upsertStoredThought } from "@/features/thoughts/repository";

describe("content module pages", () => {
  beforeEach(async () => {
    await resetDisplayModes();
    await resetStoredThoughts();
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

  it("renders album cards and actions in real mode", async () => {
    render(await AlbumPage());

    expect(screen.getByRole("button", { name: "新建相册" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "上传" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(screen.getAllByText("更多")).toHaveLength(6);
    expect(screen.getByText("照片22个")).toBeInTheDocument();
    expect(screen.getByText("诗注：小妞写，图片，女孩子的碎片收藏。" )).toBeInTheDocument();
  });

  it("renders the album demo page in demo mode", async () => {
    await updateDisplayMode("album", "demo");

    render(await AlbumPage());

    expect(screen.getByRole("heading", { level: 1, name: "个人相册-演示模式" })).toBeInTheDocument();
    expect(screen.getByText("这是个人相册模块的基础演示内容。")).toBeInTheDocument();
  });

  it("renders the latest stored thought in real mode", async () => {
    await upsertStoredThought({
      id: "thought-db-001",
      title: "数据库里的碎碎念",
      slug: "thought-in-db",
      description: "先用一条真实数据打通页面读取。",
      body: "这条内容来自数据库，不再直接依赖本地数组。",
      tags: ["数据库", "最小闭环"],
      visibility: "public",
      status: "published",
      createdAt: "2026-05-25",
      sortOrder: 1,
    });

    render(await ThoughtsPage());

    expect(screen.getByRole("heading", { level: 1, name: "碎碎念" })).toBeInTheDocument();
    expect(screen.getByText("数据库里的碎碎念")).toBeInTheDocument();
    expect(screen.getByText("先用一条真实数据打通页面读取。")).toBeInTheDocument();
    expect(screen.getByText("这条内容来自数据库，不再直接依赖本地数组。")).toBeInTheDocument();
  });

  it("falls back to local thought data when storage is empty in real mode", async () => {
    render(await ThoughtsPage());

    expect(screen.getByRole("heading", { level: 1, name: "碎碎念" })).toBeInTheDocument();
    expect(screen.getByText(thoughts[0].title)).toBeInTheDocument();
    expect(screen.getByText(thoughts[0].description)).toBeInTheDocument();
    expect(screen.getByText(thoughts[0].body)).toBeInTheDocument();
  });

  it("renders the thoughts demo page in demo mode", async () => {
    await updateDisplayMode("thoughts", "demo");

    render(await ThoughtsPage());

    expect(screen.getByRole("heading", { level: 1, name: "碎碎念（试玩模式）" })).toBeInTheDocument();
    expect(screen.getByText("这是碎碎念模块的试玩版页面。")).toBeInTheDocument();
    expect(screen.getByText("你可以先体验基础编辑交互，但这里不会展示我的真实内容。")).toBeInTheDocument();
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
