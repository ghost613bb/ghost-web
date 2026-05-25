import { beforeEach, describe, expect, it } from "vitest";
import {
  getDisplayModes,
  resetDisplayModes,
  updateDisplayMode,
} from "./service";

describe("module display mode service", () => {
  beforeEach(async () => {
    await resetDisplayModes();
  });

  it("returns the default display modes", async () => {
    await expect(getDisplayModes()).resolves.toEqual({
      about: "real",
      album: "real",
      coffee: "real",
      message: "real",
      playlists: "real",
      thoughts: "real",
      todo: "real",
    });
  });

  it("updates a single module mode while preserving others", async () => {
    await updateDisplayMode("thoughts", "demo");

    await expect(getDisplayModes()).resolves.toEqual({
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
