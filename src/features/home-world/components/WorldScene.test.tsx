import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("WorldScene", () => {
  it("does not depend on Drei Environment presets that fetch external HDR assets", () => {
    const source = readFileSync(path.join(process.cwd(), "src/features/home-world/components/WorldScene.tsx"), "utf8");

    expect(source).not.toContain("Environment");
    expect(source).not.toContain("preset=");
  });
});
