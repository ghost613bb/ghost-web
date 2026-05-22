import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeWorld } from "./HomeWorld";

vi.mock("./HomeWorldCanvas", () => ({
  HomeWorldCanvas: () => <div data-testid="home-world-canvas" />,
}));

describe("HomeWorld", () => {
  it("renders the canvas mount and accessible module navigation", () => {
    render(<HomeWorld />);

    expect(screen.getByTestId("home-world-canvas")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ghostspace" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "个人相册" })).toHaveAttribute("href", "/album");
    expect(screen.getByRole("link", { name: "歌单" })).toHaveAttribute("href", "/playlists");
    expect(screen.getByRole("link", { name: "咖啡推荐" })).toHaveAttribute("href", "/coffee");
  });
});
