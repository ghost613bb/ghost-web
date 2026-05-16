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
    expect(screen.getByRole("heading", { name: "Ghost Garden" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "技能温室" })).toHaveAttribute("href", "/album");
  });
});
