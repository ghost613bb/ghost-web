import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { homeModules } from "@/features/home-world/config/homeModules";
import { HomeOverlay } from "./HomeOverlay";

describe("HomeOverlay", () => {
  it("renders the site identity without the intro badge", () => {
    render(<HomeOverlay activeModuleId={null} modules={homeModules} />);

    expect(screen.getByRole("heading", { name: "Ghost Garden" })).toBeInTheDocument();
    expect(screen.getByText("个人数字花园")).toBeInTheDocument();
    expect(screen.queryByText("在这里收集生活碎片、学习笔记和一点古灵精怪的审美。")).not.toBeInTheDocument();
  });

  it("renders a fallback link for every home module", () => {
    render(<HomeOverlay activeModuleId={null} modules={homeModules} />);

    for (const module of homeModules) {
      expect(screen.getByRole("link", { name: module.title })).toHaveAttribute("href", module.route);
    }
  });

  it("does not render the selected-house info panel", () => {
    render(<HomeOverlay activeModuleId="album" modules={homeModules} />);

    expect(screen.queryByText("当前靠近")).not.toBeInTheDocument();
    expect(screen.queryByText("照片不是证据，是当时心情的标本。")).not.toBeInTheDocument();
  });
});
