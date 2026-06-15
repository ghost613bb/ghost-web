import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Thought } from "@/data/thoughts";
import { ThoughtsPageView } from "./ThoughtsPage";

const thoughtWithoutTags: Thought = {
  id: "thought-no-tags",
  title: "没有标签的碎碎念",
  slug: "thought-no-tags",
  body: "即使没有标签，也应该能正常展示。",
  visibility: "public",
  status: "published",
  createdAt: "2026-05-29",
  sortOrder: 1,
};

const taggedThought: Thought = {
  id: "thought-with-tags",
  title: "有标签的碎碎念",
  slug: "thought-with-tags",
  body: "用来验证标签筛选不会被无标签内容影响。",
  tags: ["有标签"],
  visibility: "public",
  status: "published",
  createdAt: "2026-05-28",
  sortOrder: 2,
};

describe("ThoughtsPageView", () => {
  it("renders a thought without tags with the daily fallback tag", () => {
    render(<ThoughtsPageView initialThoughts={[thoughtWithoutTags, taggedThought]} />);

    expect(screen.getByRole("heading", { level: 2, name: "没有标签的碎碎念" })).toBeInTheDocument();
    expect(screen.getByText("2026.05.29")).toBeInTheDocument();
    expect(screen.getByText("日常")).toHaveClass("rounded-full", "bg-[#ffccd5]");

    fireEvent.click(screen.getByRole("button", { name: "有标签" }));

    expect(screen.queryByRole("heading", { level: 2, name: "没有标签的碎碎念" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "有标签的碎碎念" })).toBeInTheDocument();
  });

  it("highlights matching keywords in filtered thought content", () => {
    render(<ThoughtsPageView initialThoughts={[taggedThought]} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "搜索碎碎念" }), { target: { value: "标签" } });

    const highlights = screen.getAllByText("标签", { selector: "mark" });
    expect(highlights.length).toBeGreaterThan(0);
    highlights.forEach((highlight) => {
      expect(highlight).toHaveClass("rounded-[0.35rem]", "bg-[#ffe06d]", "text-stone-950");
    });
  });

  it("links each thought card to its detail page", () => {
    render(<ThoughtsPageView initialThoughts={[taggedThought]} />);

    expect(screen.getByRole("link", { name: /有标签的碎碎念/ })).toHaveAttribute("href", "/thoughts/thought-with-tags");
  });

  it("shows rich text bodies as plain text and searches their content", () => {
    render(<ThoughtsPageView initialThoughts={[{ ...taggedThought, body: "<p>富文本 <strong>摘要</strong></p>" }]} />);

    expect(screen.getByText("富文本 摘要")).toBeInTheDocument();
    expect(screen.queryByText("<p>富文本 <strong>摘要</strong></p>")).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: "搜索碎碎念" }), { target: { value: "摘要" } });

    expect(screen.getByRole("heading", { level: 2, name: "有标签的碎碎念" })).toBeInTheDocument();
    expect(screen.getByText("摘要", { selector: "mark" })).toBeInTheDocument();
  });

  it("uses the first rich text image as the card cover", () => {
    render(<ThoughtsPageView initialThoughts={[{ ...taggedThought, body: '<p>配图内容</p><img src="/thought-images/cover.jpg" />' }]} />);

    expect(screen.getByRole("img", { name: "有标签的碎碎念封面" })).toHaveAttribute("src", "/thought-images/cover.jpg");
    expect(screen.queryByLabelText("视频封面")).not.toBeInTheDocument();
  });

  it("shows a play badge on the existing cover when the first media is a video", () => {
    render(<ThoughtsPageView initialThoughts={[{ ...taggedThought, coverImageUrl: "/thought-images/cover.jpg", body: '<video src="/thought-videos/cover.mp4"></video>' }]} />);

    expect(screen.getByRole("img", { name: "有标签的碎碎念封面" })).toHaveAttribute("src", "/thought-images/cover.jpg");
    expect(screen.getByLabelText("视频封面")).toBeInTheDocument();
  });

  it("does not render a card cover when a thought has no image", () => {
    render(<ThoughtsPageView initialThoughts={[taggedThought]} />);

    expect(screen.queryByRole("img", { name: "有标签的碎碎念封面" })).not.toBeInTheDocument();
  });
});
