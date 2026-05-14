import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { homeModules } from "@/features/home-world/config/homeModules";
import { HomeOverlay } from "./HomeOverlay";

describe("HomeOverlay", () => {
  it("renders the site identity", () => {
    render(<HomeOverlay activeModuleId={null} modules={homeModules} />);

    expect(screen.getByRole("heading", { name: "Ghost Garden" })).toBeInTheDocument();
    expect(screen.getByText("个人数字花园")).toBeInTheDocument();
  });

  it("renders a fallback link for every home module", () => {
    render(<HomeOverlay activeModuleId={null} modules={homeModules} />);

    for (const module of homeModules) {
      expect(screen.getByRole("link", { name: module.title })).toHaveAttribute("href", module.route);
    }
  });

  it("shows active module intro when a house is selected", () => {
    render(<HomeOverlay activeModuleId="album" modules={homeModules} />);

    expect(screen.getByRole("heading", { level: 2, name: "相册" })).toBeInTheDocument();
    expect(screen.getByText("照片不是证据，是当时心情的标本。")).toBeInTheDocument();
  });
});
