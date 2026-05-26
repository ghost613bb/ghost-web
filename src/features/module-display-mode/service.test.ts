import { beforeEach, describe, expect, it } from "vitest";
import {
  getDisplayModes,
  resetDisplayModes,
  updateDisplayMode,
} from "./service";
import {
  listStoredDisplayModes,
  resetStoredDisplayModes,
  upsertStoredDisplayMode,
} from "./repository";

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

  it("persists only changed display modes in repository storage", async () => {
    await upsertStoredDisplayMode("thoughts", "demo");

    await expect(listStoredDisplayModes()).resolves.toEqual([{ moduleId: "thoughts", displayMode: "demo" }]);
  });

  it("clears repository storage when resetting stored display modes", async () => {
    await upsertStoredDisplayMode("thoughts", "demo");
    await resetStoredDisplayModes();

    await expect(listStoredDisplayModes()).resolves.toEqual([]);
  });
});
