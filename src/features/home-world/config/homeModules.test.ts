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
});
