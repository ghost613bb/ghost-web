import { describe, expect, it } from "vitest";
import { homeModules } from "./homeModules";
import {
  clampToTownDiamond,
  firstPersonNavigation,
  getFocusedModule,
  getModuleWorldTarget,
  townSceneTransform,
} from "./townNavigation";

describe("townNavigation", () => {
  it("calculates module world targets with house asset offsets and scene transform", () => {
    const albumModule = homeModules.find((module) => module.route === "/album");

    expect(albumModule).toBeDefined();
    expect(getModuleWorldTarget(albumModule!)).toEqual([
      (-2.5 - 0.12) * townSceneTransform.scale,
      firstPersonNavigation.eyeHeight,
      (0.4 - 1.05) * townSceneTransform.scale,
    ]);
  });

  it("keeps in-bounds camera positions unchanged", () => {
    expect(clampToTownDiamond([0.5, firstPersonNavigation.eyeHeight, -0.5])).toEqual([
      0.5,
      firstPersonNavigation.eyeHeight,
      -0.5,
    ]);
  });

  it("clamps camera positions back inside the diamond town ground", () => {
    const [x, y, z] = clampToTownDiamond([5, firstPersonNavigation.eyeHeight, 5]);

    expect(y).toBe(firstPersonNavigation.eyeHeight);
    expect(Math.abs(x) + Math.abs(z)).toBeCloseTo(firstPersonNavigation.groundHalfWorldSize, 5);
  });

  it("focuses a nearby module only when the camera faces it", () => {
    const albumModule = homeModules.find((module) => module.route === "/album");
    const target = getModuleWorldTarget(albumModule!);
    const cameraPosition: [number, number, number] = [target[0], firstPersonNavigation.eyeHeight, target[2] + 1];

    expect(getFocusedModule({ cameraPosition, forward: [0, 0, -1], modules: homeModules })?.route).toBe("/album");
    expect(getFocusedModule({ cameraPosition, forward: [0, 0, 1], modules: homeModules })).toBeNull();
  });
});
