import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Thought } from "@/data/thoughts";
import { ThoughtsPageView } from "./ThoughtsPage";

const thoughtWithoutTags: Thought = {
  id: "thought-no-tags",
  title: "没有标签的碎碎念",
  slug: "thought-no-tags",
  description: "这条内容暂时没有标签。",
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
  description: "这条内容有标签。",
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
    expect(screen.getByText("2026.05.29 · 日常")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "有标签" }));

    expect(screen.queryByRole("heading", { level: 2, name: "没有标签的碎碎念" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "有标签的碎碎念" })).toBeInTheDocument();
  });
});
