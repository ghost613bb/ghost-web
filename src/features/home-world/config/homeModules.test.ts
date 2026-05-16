import { describe, expect, it } from "vitest";
import { homeModules } from "./homeModules";

describe("homeModules", () => {
  it("contains the six first-version modules in sorted order", () => {
    expect(homeModules.map((module) => module.id)).toEqual([
      "about",
      "thoughts",
      "album",
      "playlists",
      "todo",
      "message",
    ]);
  });

  it("uses unique ids and routes", () => {
    expect(new Set(homeModules.map((module) => module.id)).size).toBe(homeModules.length);
    expect(new Set(homeModules.map((module) => module.route)).size).toBe(homeModules.length);
  });

  it("keeps first-version home modules publicly navigable", () => {
    expect(homeModules.every((module) => module.visibility === "public")).toBe(true);
  });

  it("defines pixel-town placeholder styles for future assets", () => {
    expect(homeModules.map((module) => module.placeholderStyle)).toEqual([
      "cottage",
      "library",
      "greenhouse",
      "workshop",
      "tower",
      "mail",
    ]);
    expect(homeModules.every((module) => module.assetKey === undefined)).toBe(true);
  });

  it("uses a balanced wide isometric town layout", () => {
    expect(homeModules.map((module) => module.position)).toEqual([
      [-2.5, 0, 0.4],
      [-1.3, 0, -1.2],
      [1.3, 0, -1.2],
      [2.5, 0, 0.4],
      [1.35, 0, 1.55],
      [-1.35, 0, 1.55],
    ]);
  });
});
