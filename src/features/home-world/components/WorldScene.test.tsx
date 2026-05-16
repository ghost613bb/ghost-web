import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("WorldScene", () => {
  it("does not depend on Drei Environment presets that fetch external HDR assets", () => {
    const source = readFileSync(path.join(process.cwd(), "src/features/home-world/components/WorldScene.tsx"), "utf8");

    expect(source).not.toContain("Environment");
    expect(source).not.toContain("preset=");
  });

  it("places the low-poly sun near the second left cloud facing the screen", () => {
    const source = readFileSync(path.join(process.cwd(), "src/features/home-world/components/WorldScene.tsx"), "utf8");

    expect(source).toContain("LowPolySun");
    expect(source).toContain("position={[-4.95, 1.58, -3.7]}");
    expect(source).toContain("rotation={[0, 0, 0]}");
    expect(source).toContain("scale={0.0034}");
  });

  it("moves the second left cloud closer to the sun", () => {
    const source = readFileSync(path.join(process.cwd(), "src/features/home-world/components/WorldScene.tsx"), "utf8");

    expect(source).toContain("<LowPolyCloud position={[-4.55, 1.35, -2.0]}");
  });

  it("keeps the sun model available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_sun/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_sun/scene.bin"))).not.toThrow();
  });
});
