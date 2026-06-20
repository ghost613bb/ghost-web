import { readFileSync } from "node:fs";
import path from "node:path";
import { isValidElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { WorldScene } from "./WorldScene";

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

function collectElementTypes(node: ReactNode, types: string[] = []) {
  if (Array.isArray(node)) {
    node.forEach((child) => collectElementTypes(child, types));
    return types;
  }

  if (!isValidElement(node)) {
    return types;
  }

  const elementType = node.type;
  const props = node.props as { children?: ReactNode };
  types.push(typeof elementType === "string" ? elementType : elementType.name ?? "anonymous");
  collectElementTypes(props.children, types);
  return types;
}

describe("WorldScene", () => {
  it("does not depend on Drei Environment presets that fetch external HDR assets", () => {
    const source = readFileSync(path.join(process.cwd(), "src/features/home-world/components/WorldScene.tsx"), "utf8");

    expect(source).not.toContain("Environment");
    expect(source).not.toContain("preset=");
  });

  it("does not paint a solid scene background over the page gradient", () => {
    const source = readFileSync(path.join(process.cwd(), "src/features/home-world/components/WorldScene.tsx"), "utf8");

    expect(source).not.toContain("<color attach=\"background\"");
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
    const groupStart = "<group position={townSceneTransform.position} scale={townSceneTransform.scale}>";
    const firstCloud = "<LowPolyCloud position={[-6.25, 1.12, -0.35]}";
    const sun = "<LowPolySun position={[-4.95, 1.58, -3.7]}";
    const firstPersonController = "<FirstPersonController";

    expect(source).toContain("townSceneTransform");
    expect(source).toContain(groupStart);
    expect(source).toContain(firstCloud);
    expect(source).toContain(sun);
    expect(source).toContain(firstPersonController);
    expect(source).not.toContain("OrbitControls");

    const groupStartIndex = source.indexOf(groupStart);
    const firstPersonControllerIndex = source.indexOf(firstPersonController);

    expect(groupStartIndex).toBeGreaterThanOrEqual(0);
    expect(firstPersonControllerIndex).toBeGreaterThanOrEqual(0);
    expect(groupStartIndex).toBeLessThan(firstPersonControllerIndex);

    const framedSceneSource = extractGroupSource(source, groupStart);

    expect(framedSceneSource).toContain(firstCloud);
    expect(framedSceneSource).toContain(sun);
    expect(framedSceneSource).toContain("<ParallelogramTownGround");
    expect(framedSceneSource).toContain("<Float");
    expect(framedSceneSource).toContain("<HouseNode");
  });

  it("does not render the deprecated pale blue ground ring", () => {
    const tree = WorldScene({
      activeModuleId: null,
      isExploring: false,
      modules: [],
      onActiveModuleChange: () => {},
      onExploringChange: () => {},
      onPointerLockChange: () => {},
    });

    const elementTypes = collectElementTypes(tree);
    const meshCount = elementTypes.filter((type) => type === "mesh").length;
    const ringGeometryCount = elementTypes.filter((type) => type === "ringGeometry").length;
    const meshBasicMaterialCount = elementTypes.filter((type) => type === "meshBasicMaterial").length;

    expect(meshCount).toBe(0);
    expect(ringGeometryCount).toBe(0);
    expect(meshBasicMaterialCount).toBe(0);
  });
});
