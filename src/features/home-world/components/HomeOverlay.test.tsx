import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { homeModules } from "@/features/home-world/config/homeModules";
import { HomeOverlay } from "./HomeOverlay";

const originalInnerWidth = window.innerWidth;
const originalInnerHeight = window.innerHeight;
const originalResizeObserver = globalThis.ResizeObserver;
const originalFonts = document.fonts;
const originalScrollWidthDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollWidth");
const NAV_HORIZONTAL_PADDING = 96;
const NAV_VIEWPORT_BASELINE_HEIGHT = 700;
let navScrollWidth = 720;

function mockViewportMetrics(innerWidth: number, scrollWidth: number, innerHeight = originalInnerHeight) {
  navScrollWidth = scrollWidth;
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: innerWidth,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    writable: true,
    value: innerHeight,
  });
}

describe("HomeOverlay", () => {
  beforeEach(() => {
    mockViewportMetrics(1280, 720);
    globalThis.ResizeObserver = class {
      observe() {}
      disconnect() {}
    } as typeof ResizeObserver;
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: {
        ready: Promise.resolve(),
      },
    });
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      get() {
        return this.getAttribute?.("aria-label") === "首页模块导航" ? navScrollWidth : 0;
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: originalInnerHeight,
    });

    globalThis.ResizeObserver = originalResizeObserver;
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: originalFonts,
    });

    if (originalScrollWidthDescriptor) {
      Object.defineProperty(HTMLElement.prototype, "scrollWidth", originalScrollWidthDescriptor);
    }

    vi.restoreAllMocks();
  });

  it("renders the pixel-style site identity without subtitle text", () => {
    render(<HomeOverlay activeModuleId={null} modules={homeModules} />);

    expect(screen.getByRole("heading", { name: "Ghostspace" })).toBeInTheDocument();
    expect(screen.queryByText("个人数字花园")).not.toBeInTheDocument();
    expect(screen.queryByText("在这里收集生活碎片、学习笔记和一点古灵精怪的审美。")).not.toBeInTheDocument();
  });

  it("renders a fallback link for every home module", () => {
    render(<HomeOverlay activeModuleId={null} modules={homeModules} />);

    for (const module of homeModules) {
      expect(screen.getByRole("link", { name: module.title })).toHaveAttribute("href", module.route);
    }
  });

  it("keeps the original tab strip styling while staying on one line", async () => {
    render(<HomeOverlay activeModuleId={null} modules={homeModules} />);

    const nav = screen.getByRole("navigation", { name: "首页模块导航" });
    const firstLink = screen.getByRole("link", { name: "关于我小屋" });

    await waitFor(() => {
      expect(nav.style.transform).toBe("scale(1)");
    });

    expect(nav.className).toContain("right-4");
    expect(nav.className).toContain("sm:right-40");
    expect(nav.className).toContain("flex-nowrap");
    expect(nav.className).toContain("w-max");
    expect(nav.className).toContain("border-4");
    expect(nav.className).toContain("shadow-[6px_6px_0_#6f3f25]");
    expect(firstLink.className).toContain("shrink-0");
    expect(firstLink.className).toContain("text-lg");
    expect(firstLink.className).not.toContain("text-sm");
    expect(firstLink.className).not.toContain("flex-1");
  });

  it("scales the whole tab bar down on narrow viewports instead of wrapping", async () => {
    mockViewportMetrics(498, 900);
    render(<HomeOverlay activeModuleId={null} modules={homeModules} />);

    const nav = screen.getByRole("navigation", { name: "首页模块导航" });
    const expectedScale = Math.min(1, (498 - NAV_HORIZONTAL_PADDING) / 900);

    await waitFor(() => {
      expect(nav.style.transform).toBe(`scale(${expectedScale})`);
    });

    expect(nav.className).toContain("flex-nowrap");
  });

  it("also scales the tab bar down when the viewport height shrinks a lot", async () => {
    mockViewportMetrics(1280, 720, 430);
    render(<HomeOverlay activeModuleId={null} modules={homeModules} />);

    const nav = screen.getByRole("navigation", { name: "首页模块导航" });
    const expectedScale = Math.min(1, 430 / NAV_VIEWPORT_BASELINE_HEIGHT);

    await waitFor(() => {
      expect(nav.style.transform).toBe(`scale(${expectedScale})`);
    });
  });

  it("keeps shrinking instead of resetting to full size on ultra narrow viewports", async () => {
    mockViewportMetrics(80, 900);
    render(<HomeOverlay activeModuleId={null} modules={homeModules} />);

    const nav = screen.getByRole("navigation", { name: "首页模块导航" });
    const expectedScale = Math.min(1, Math.max(80 - NAV_HORIZONTAL_PADDING, 0) / 900);

    await waitFor(() => {
      expect(nav.style.transform).toBe(`scale(${expectedScale})`);
    });
  });

  it("recomputes scale after font metrics change when fonts finish loading", async () => {
    globalThis.ResizeObserver = undefined;
    mockViewportMetrics(720, 680);

    let resolveFontsReady: (() => void) | undefined;
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: {
        ready: new Promise<void>((resolve) => {
          resolveFontsReady = resolve;
        }),
      },
    });

    render(<HomeOverlay activeModuleId={null} modules={homeModules} />);

    const nav = screen.getByRole("navigation", { name: "首页模块导航" });

    navScrollWidth = 900;
    resolveFontsReady?.();

    await waitFor(() => {
      expect(nav.style.transform).toBe(`scale(${(720 - NAV_HORIZONTAL_PADDING) / 900})`);
    });
  });

  it("does not render the selected-house info panel", () => {
    render(<HomeOverlay activeModuleId="album" modules={homeModules} />);

    expect(screen.queryByText("当前靠近")).not.toBeInTheDocument();
    expect(screen.queryByText("照片不是证据，是当时心情的标本。")).not.toBeInTheDocument();
  });
});
