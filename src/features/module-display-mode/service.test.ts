import { beforeEach, describe, expect, it } from "vitest";
import {
  getDisplayMode,
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

  it("returns the default mode for a single module", async () => {
    await expect(getDisplayMode("album")).resolves.toBe("real");
  });

  it("returns the stored mode for a single module", async () => {
    await updateDisplayMode("album", "demo");

    await expect(getDisplayMode("album")).resolves.toBe("demo");
  });

  it("updates a single module mode while preserving others", async () => {
    await updateDisplayMode("album", "demo");

    await expect(getDisplayModes()).resolves.toEqual({
      about: "real",
      album: "demo",
      coffee: "real",
      message: "real",
      playlists: "real",
      thoughts: "real",
      todo: "real",
    });
  });

  it("persists only changed display modes in repository storage", async () => {
    await upsertStoredDisplayMode("album", "demo");

    await expect(listStoredDisplayModes()).resolves.toEqual([{ moduleId: "album", displayMode: "demo" }]);
  });

  it("clears repository storage when resetting stored display modes", async () => {
    await upsertStoredDisplayMode("album", "demo");
    await resetStoredDisplayModes();

    await expect(listStoredDisplayModes()).resolves.toEqual([]);
  });
});
