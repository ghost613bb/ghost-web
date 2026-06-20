import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("HomeWorldCanvas", () => {
  it("uses a first-person camera framing", () => {
    const source = readFileSync(path.join(process.cwd(), "src/features/home-world/components/HomeWorldCanvas.tsx"), "utf8");

    expect(source).toContain("camera={{ position: [0, 0.82, 3.35], fov: 62, near: 0.05, far: 80 }}");
  });

  it("passes first-person state into the scene controller", () => {
    const source = readFileSync(path.join(process.cwd(), "src/features/home-world/components/HomeWorldCanvas.tsx"), "utf8");

    expect(source).toContain("isExploring={isExploring}");
    expect(source).toContain("onExploringChange={onExploringChange}");
    expect(source).toContain("onPointerLockChange={onPointerLockChange}");
  });

  it("enables renderer transparency so the page gradient stays visible", () => {
    const source = readFileSync(path.join(process.cwd(), "src/features/home-world/components/HomeWorldCanvas.tsx"), "utf8");

    expect(source).toContain("gl={{ alpha: true, antialias: true, powerPreference: \"high-performance\" }}");
  });
});
