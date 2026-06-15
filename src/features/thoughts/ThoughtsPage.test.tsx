import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Thought } from "@/data/thoughts";
import { ThoughtsPageView } from "./ThoughtsPage";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-06-16T12:00:00+08:00"));
});

afterEach(() => {
  vi.useRealTimers();
});

const firstThought: Thought = {
  id: "thought-first",
  title: "第一条碎碎念",
  slug: "thought-first",
  body: "即使没有标签芯片，也应该能正常展示。",
  visibility: "public",
  status: "published",
  createdAt: "2026-05-29",
  sortOrder: 1,
};

const sampleThought: Thought = {
  id: "thought-sample",
  title: "示例碎碎念",
  slug: "thought-sample",
  body: "用来验证搜索和列表展示不会受标签芯片影响。",
  visibility: "public",
  status: "published",
  createdAt: "2026-05-28",
  sortOrder: 2,
};

describe("ThoughtsPageView", () => {
  it("renders thoughts without tag chips or tag filters", () => {
    render(<ThoughtsPageView initialThoughts={[firstThought, sampleThought]} />);

    expect(screen.getByRole("heading", { level: 2, name: "第一条碎碎念" })).toBeInTheDocument();
    expect(screen.getByText("2026.05.29")).toBeInTheDocument();
    expect(screen.queryByText("Tags")).not.toBeInTheDocument();
    expect(screen.queryByText("日常")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "全部" })).not.toBeInTheDocument();
  });

  it("formats ISO timestamps as readable list dates", () => {
    render(<ThoughtsPageView initialThoughts={[{ ...sampleThought, createdAt: "2026-05-13T00:00:00+00:00" }]} />);

    expect(screen.getByText("2026.05.13")).toBeInTheDocument();
    expect(screen.queryByText(/T00:00:00\+00:00/)).not.toBeInTheDocument();
  });

  it("highlights only the days that have thoughts in the displayed month", () => {
    render(
      <ThoughtsPageView
        initialThoughts={[
          { ...sampleThought, id: "thought-june-15", slug: "thought-june-15", createdAt: "2026-06-15" },
          { ...firstThought, id: "thought-june-12", slug: "thought-june-12", createdAt: "2026-06-12" },
          { ...sampleThought, id: "thought-may-28", slug: "thought-may-28", createdAt: "2026-05-28" },
        ]}
      />,
    );

    expect(screen.getByText("2026.06")).toBeInTheDocument();
    expect(screen.getByText("15")).toHaveClass("bg-[#ffbac7]", "text-[#6a3d35]");
    expect(screen.getByText("12")).toHaveClass("bg-[#ffbac7]", "text-[#6a3d35]");
    expect(screen.getByText("28")).not.toHaveClass("bg-[#ffbac7]");
  });

  it("uses ISO timestamps to highlight calendar days", () => {
    render(<ThoughtsPageView initialThoughts={[{ ...sampleThought, createdAt: "2026-06-13T08:30:00+08:00" }]} />);

    expect(screen.getByText("2026.06")).toBeInTheDocument();
    expect(screen.getByText("13")).toHaveClass("bg-[#ffbac7]", "text-[#6a3d35]");
  });

  it("highlights days with thoughts after switching calendar months", () => {
    render(
      <ThoughtsPageView
        initialThoughts={[
          { ...sampleThought, id: "thought-june-15", slug: "thought-june-15", createdAt: "2026-06-15" },
          { ...firstThought, id: "thought-may-28", slug: "thought-may-28", createdAt: "2026-05-28" },
        ]}
      />,
    );

    expect(screen.getByText("2026.06")).toBeInTheDocument();
    expect(screen.getByText("15")).toHaveClass("bg-[#ffbac7]", "text-[#6a3d35]");

    fireEvent.click(screen.getByRole("button", { name: "上一个月" }));

    expect(screen.getByText("2026.05")).toBeInTheDocument();
    expect(screen.getByText("28")).toHaveClass("bg-[#ffbac7]", "text-[#6a3d35]");
    expect(screen.getByText("15")).not.toHaveClass("bg-[#ffbac7]");
  });

  it("keeps one highlighted calendar day when multiple thoughts share the same date", () => {
    const { container } = render(
      <ThoughtsPageView
        initialThoughts={[
          { ...sampleThought, id: "thought-june-15-a", slug: "thought-june-15-a", createdAt: "2026-06-15" },
          { ...firstThought, id: "thought-june-15-b", slug: "thought-june-15-b", createdAt: "2026-06-15" },
        ]}
      />,
    );

    const highlightedDays = Array.from(container.querySelectorAll("span")).filter((element) => element.className.includes("bg-[#ffbac7]"));

    expect(highlightedDays).toHaveLength(1);
    expect(screen.getByText("15")).toHaveClass("bg-[#ffbac7]", "text-[#6a3d35]");
  });

  it("styles today with a note-like accent", () => {
    render(
      <ThoughtsPageView
        initialThoughts={[
          { ...sampleThought, id: "thought-june-15", slug: "thought-june-15", createdAt: "2026-06-15" },
        ]}
      />,
    );

    expect(screen.getByText("16")).toHaveClass("-rotate-3", "border", "border-[#5b3a30]/22", "bg-[#fff0ba]", "text-[#6a4a3f]");
    expect(screen.getByText("15")).toHaveClass("bg-[#ffbac7]", "text-[#6a3d35]");
  });

  it("highlights matching keywords in filtered thought content", () => {
    render(<ThoughtsPageView initialThoughts={[sampleThought]} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "搜索碎碎念" }), { target: { value: "搜索" } });

    const highlights = screen.getAllByText("搜索", { selector: "mark" });
    expect(highlights.length).toBeGreaterThan(0);
    highlights.forEach((highlight) => {
      expect(highlight).toHaveClass("rounded-[0.35rem]", "bg-[#ffe06d]", "text-stone-950");
    });
  });

  it("links each thought card to its detail page", () => {
    render(<ThoughtsPageView initialThoughts={[sampleThought]} />);

    expect(screen.getByRole("link", { name: /示例碎碎念/ })).toHaveAttribute("href", "/thoughts/thought-sample");
  });

  it("shows rich text bodies as plain text and searches their content", () => {
    render(<ThoughtsPageView initialThoughts={[{ ...sampleThought, body: "<p>富文本 <strong>摘要</strong></p>" }]} />);

    expect(screen.getByText("富文本 摘要")).toBeInTheDocument();
    expect(screen.queryByText("<p>富文本 <strong>摘要</strong></p>")).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: "搜索碎碎念" }), { target: { value: "摘要" } });

    expect(screen.getByRole("heading", { level: 2, name: "示例碎碎念" })).toBeInTheDocument();
    expect(screen.getByText("摘要", { selector: "mark" })).toBeInTheDocument();
  });

  it("uses the first rich text image as the card cover", () => {
    render(<ThoughtsPageView initialThoughts={[{ ...sampleThought, body: '<p>配图内容</p><img src="/thought-images/cover.jpg" />' }]} />);

    expect(screen.getByRole("img", { name: "示例碎碎念封面" })).toHaveAttribute("src", "/thought-images/cover.jpg");
    expect(screen.queryByLabelText("视频封面")).not.toBeInTheDocument();
  });

  it("shows a play badge on the existing cover when the first media is a video", () => {
    render(<ThoughtsPageView initialThoughts={[{ ...sampleThought, coverImageUrl: "/thought-images/cover.jpg", body: '<video src="/thought-videos/cover.mp4"></video>' }]} />);

    expect(screen.getByRole("img", { name: "示例碎碎念封面" })).toHaveAttribute("src", "/thought-images/cover.jpg");
    expect(screen.getByLabelText("视频封面")).toBeInTheDocument();
  });

  it("does not render a card cover when a thought has no image", () => {
    render(<ThoughtsPageView initialThoughts={[sampleThought]} />);

    expect(screen.queryByRole("img", { name: "示例碎碎念封面" })).not.toBeInTheDocument();
  });
});
