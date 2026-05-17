import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function extractGroupSource(source: string, groupStart: string) {
  const groupStartIndex = source.indexOf(groupStart);

  if (groupStartIndex < 0) {
    return "";
  }

  const groupTagPattern = /<\/?group\b[^>]*>/g;
  let depth = 0;
  let match: RegExpExecArray | null;

  while ((match = groupTagPattern.exec(source)) !== null) {
    if (match.index < groupStartIndex) {
      continue;
    }

    const tag = match[0];
    depth += tag.startsWith("</") ? -1 : 1;

    if (depth === 0) {
      return source.slice(groupStartIndex, match.index + tag.length);
    }
  }

  return "";
}

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

  it("moves and scales visible scene content through a shared framing group", () => {
    const source = readFileSync(path.join(process.cwd(), "src/features/home-world/components/WorldScene.tsx"), "utf8");
    const groupStart = "<group position={sceneGroupPosition} scale={sceneGroupScale}>";
    const firstCloud = "<LowPolyCloud position={[-6.25, 1.12, -0.35]}";
    const sun = "<LowPolySun position={[-4.95, 1.58, -3.7]}";
    const orbitControls = "<OrbitControls";

    expect(source).toContain("const sceneGroupPosition: [number, number, number] = [0, -0.24, 0];");
    expect(source).toContain("const sceneGroupScale = 1.04;");
    expect(source).toContain(groupStart);
    expect(source).toContain(firstCloud);
    expect(source).toContain(sun);
    expect(source).toContain(orbitControls);

    const groupStartIndex = source.indexOf(groupStart);
    const orbitControlsIndex = source.indexOf(orbitControls);

    expect(groupStartIndex).toBeGreaterThanOrEqual(0);
    expect(orbitControlsIndex).toBeGreaterThanOrEqual(0);
    expect(groupStartIndex).toBeLessThan(orbitControlsIndex);

    const framedSceneSource = extractGroupSource(source, groupStart);

    expect(framedSceneSource).toContain(firstCloud);
    expect(framedSceneSource).toContain(sun);
    expect(framedSceneSource).toContain("<ParallelogramTownGround");
    expect(framedSceneSource).toContain("<Float");
    expect(framedSceneSource).toContain("<HouseNode");
  });
});
