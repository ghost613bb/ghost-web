import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/data/site";
import { ContentCard } from "./ContentCard";
import { ModulePageShell } from "./ModulePageShell";
import { RestrictedNotice } from "./RestrictedNotice";

describe("content module components", () => {
  it("renders module page shell identity and home link", () => {
    render(
      <ModulePageShell eyebrow="About" title="关于我" description="页面描述">
        <p>页面内容</p>
      </ModulePageShell>,
    );

    expect(screen.getByRole("link", { name: "返回首页小镇" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("heading", { level: 1, name: "关于我" })).toBeInTheDocument();
    expect(screen.getByText("页面描述")).toBeInTheDocument();
    expect(screen.getByText("页面内容")).toBeInTheDocument();
  });

  it("hides the eyebrow when it is empty", () => {
    render(
      <ModulePageShell eyebrow="" title="关于我" description="页面描述">
        <p>页面内容</p>
      </ModulePageShell>,
    );

    expect(screen.queryByText("About")).not.toBeInTheDocument();
  });

  it("renders compact shell sizing classes", () => {
    render(
      <ModulePageShell eyebrow="" title="关于我" description="页面描述">
        <p>页面内容</p>
      </ModulePageShell>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "关于我" })).toHaveClass("text-3xl", "sm:text-4xl");
    expect(screen.getByText("页面描述")).toHaveClass("text-sm", "sm:text-base");
  });

  it("renders linked content cards with metadata and tags", () => {
    render(<ContentCard title="一条内容" description="内容摘要" href="/thoughts/demo" meta="2026-05-13" tags={["网站"]} />);

    expect(screen.getByRole("link", { name: /一条内容/ })).toHaveAttribute("href", "/thoughts/demo");
    expect(screen.getByText("内容摘要")).toBeInTheDocument();
    expect(screen.getByText("2026-05-13")).toBeInTheDocument();
    expect(screen.getByText("#网站")).toBeInTheDocument();
  });

  it("renders restricted notice actions", () => {
    render(<RestrictedNotice />);

    expect(screen.getByRole("heading", { name: "这间房间先轻轻关上门" })).toBeInTheDocument();
    expect(screen.getByText(siteConfig.restrictedMessage)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回首页" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "给我留言" })).toHaveAttribute("href", "/message");
  });
});
