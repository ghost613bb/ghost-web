import { beforeEach, describe, expect, it } from "vitest";
import {
  getDisplayModes,
  resetDisplayModes,
  updateDisplayMode,
} from "./service";

describe("module display mode service", () => {
  beforeEach(() => {
    resetDisplayModes();
  });

  it("returns the default display modes", () => {
    expect(getDisplayModes()).toEqual({
      about: "real",
      album: "real",
      coffee: "real",
      message: "real",
      playlists: "real",
      thoughts: "real",
      todo: "real",
    });
  });

  it("updates a single module mode while preserving others", () => {
    updateDisplayMode("thoughts", "demo");

    expect(getDisplayModes()).toEqual({
      about: "real",
      album: "real",
      coffee: "real",
      message: "real",
      playlists: "real",
      thoughts: "demo",
      todo: "real",
    });
  });
});
