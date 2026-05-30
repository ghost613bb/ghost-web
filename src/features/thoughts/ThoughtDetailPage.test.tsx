import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Thought } from "@/data/thoughts";
import { ThoughtDetailPageView } from "./ThoughtDetailPage";

const thought: Thought = {
  id: "thought-detail-001",
  title: "关于春天的一些小事",
  slug: "spring-small-things",
  body: "最近天气很好，阳光暖暖的。\n每天早上给开窗的时间，心情都会变好一点点。\n\n## 今日碎片\n- 喝到了好喝的拿铁 ☕\n- 在公园里看到一只可爱的小狗 🐶\n\n> 生活明朗，万物可爱。",
  tags: ["春天", "日常"],
  visibility: "public",
  status: "published",
  createdAt: "2026-05-30",
  sortOrder: 1,
};

describe("ThoughtDetailPageView", () => {
  it("renders the thought detail as a cream editor-style page", () => {
    render(<ThoughtDetailPageView thought={thought} />);

    expect(screen.getByRole("main")).toHaveClass("album-page-scrollbar", "h-dvh", "overflow-y-auto", "bg-[#f7f1e8]");
    expect(screen.getByRole("link", { name: "返回碎碎念" })).toHaveAttribute("href", "/thoughts");
    expect(screen.getByRole("heading", { level: 1, name: "关于春天的一些小事" })).toBeInTheDocument();
    expect(screen.getByText("2026.05.30")).toBeInTheDocument();
    expect(screen.getByText("春天")).toHaveClass("rounded-full", "bg-[#f8cfd5]");
    expect(screen.getByLabelText("碎碎念正文纸张")).toHaveClass("bg-[repeating-linear-gradient(0deg,#fffdf7_0,#fffdf7_31px,#efe6d8_32px)]");
    expect(screen.getByText("每天早上给开窗的时间，心情都会变好一点点。")).toBeInTheDocument();
    expect(screen.getByText("今日碎片")).toHaveClass("text-[#d97891]");
    expect(screen.getByText("喝到了好喝的拿铁 ☕")).toBeInTheDocument();
    expect(screen.getByText("生活明朗，万物可爱。")).toHaveClass("border-l-4", "border-[#f0b5c0]");
  });

  it("uses a daily fallback tag when the thought has no tags", () => {
    render(<ThoughtDetailPageView thought={{ ...thought, tags: undefined }} />);

    expect(screen.getByText("日常")).toHaveClass("rounded-full", "bg-[#f8cfd5]");
  });
});
