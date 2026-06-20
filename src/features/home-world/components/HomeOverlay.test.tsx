import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { contentTabs } from "@/features/content-modules/config/contentTabs";
import { HomeOverlay } from "./HomeOverlay";

describe("HomeOverlay", () => {
  it("uses the shared diary tabs header on the 3D home page", () => {
    render(<HomeOverlay />);

    expect(screen.getByRole("heading", { level: 1, name: "Ghostspace" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "内容页导航" })).toBeInTheDocument();
    expect(screen.getByText("Home")).toHaveClass("rounded-full", "bg-[#ffb9c8]");
  });

  it("renders shared content tab links instead of the old home-only tab strip", () => {
    render(<HomeOverlay />);

    const nav = screen.getByRole("navigation", { name: "内容页导航" });

    for (const tab of contentTabs) {
      expect(within(nav).getByRole("link", { name: tab.label })).toHaveAttribute("href", tab.href);
    }

    expect(screen.queryByRole("navigation", { name: "首页模块导航" })).not.toBeInTheDocument();
  });

  it("removes the old home-only navigation from the 3D overlay", () => {
    render(<HomeOverlay />);

    expect(screen.queryByRole("navigation", { name: "首页模块导航" })).not.toBeInTheDocument();
  });
});
