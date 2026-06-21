import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sourcePath = "src/features/home-world/components/ParallelogramTownGround.tsx";

function readSource() {
  return readFileSync(path.join(process.cwd(), sourcePath), "utf8");
}

describe("ParallelogramTownGround", () => {
  it("uses equal horizontal and vertical radii for the town ground shape", () => {
    const source = readSource();

    expect(source).toContain("const groundHalfSize = 5.4;");
    expect(source).not.toContain("const halfWidth = 4.25;");
    expect(source).not.toContain("const halfDepth = 3.35;");
  });

  it("builds the ground shape from four equally distant diamond points", () => {
    const source = readSource();

    expect(source).toContain("new Vector2(0, -groundHalfSize)");
    expect(source).toContain("new Vector2(groundHalfSize, 0)");
    expect(source).toContain("new Vector2(0, groundHalfSize)");
    expect(source).toContain("new Vector2(-groundHalfSize, 0)");
  });
});
