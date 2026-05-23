import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("HomeWorldCanvas", () => {
  it("uses a slightly tighter initial camera framing", () => {
    const source = readFileSync(path.join(process.cwd(), "src/features/home-world/components/HomeWorldCanvas.tsx"), "utf8");

    expect(source).toContain("camera={{ position: [0, 2.95, 7.05], fov: 44 }}");
  });

  it("enables renderer transparency so the page gradient stays visible", () => {
    const source = readFileSync(path.join(process.cwd(), "src/features/home-world/components/HomeWorldCanvas.tsx"), "utf8");

    expect(source).toContain("gl={{ alpha: true, antialias: true, powerPreference: \"high-performance\" }}");
  });
});
