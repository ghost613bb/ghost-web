import { describe, expect, it } from "vitest";
import { homeModules } from "./homeModules";
import {
  clampToTownDiamond,
  firstPersonNavigation,
  getFocusedModule,
  getModuleLocalTarget,
  getModuleRotationY,
  getModuleWorldTarget,
  townSceneTransform,
} from "./townNavigation";

describe("townNavigation", () => {
  it("calculates module world targets with rotated house asset offsets and scene transform", () => {
    const albumModule = homeModules.find((module) => module.route === "/album");

    expect(albumModule).toBeDefined();
    expect(getModuleWorldTarget(albumModule!)).toEqual([
      expect.closeTo((-2.5 + (-1 - 0.45) / Math.SQRT2) * townSceneTransform.scale),
      firstPersonNavigation.eyeHeight,
      expect.closeTo((0.4 + (1 - 0.45) / Math.SQRT2) * townSceneTransform.scale),
    ]);
  });

  it("keeps first-person targets aligned with rotated visible house centers", () => {
    const modulesByRoute = new Map(homeModules.map((module) => [module.route, module]));

    expect(getModuleLocalTarget(modulesByRoute.get("/coffee")!)).toEqual([
      expect.closeTo(2.75 + (-3.6 + 0.6) / Math.SQRT2),
      0,
      expect.closeTo(-0.05 + (-3.6 - 0.6) / Math.SQRT2),
    ]);
    expect(getModuleLocalTarget(modulesByRoute.get("/playlists")!)).toEqual([
      expect.closeTo((1.7 + 1.7) / Math.SQRT2),
      0,
      expect.closeTo(-1.95),
    ]);
    expect(getModuleLocalTarget(modulesByRoute.get("/about")!)).toEqual([
      expect.closeTo(1.3 + (2.4 + 1.3) / Math.SQRT2),
      0.04,
      expect.closeTo(-0.9 + (2.4 - 1.3) / Math.SQRT2),
    ]);
  });

  it("uses the same rotation rule for rendered houses and target calculation", () => {
    expect(getModuleRotationY({ ...homeModules[0], position: [-1, 0, 0] })).toBe(Math.PI / 4);
    expect(getModuleRotationY({ ...homeModules[0], position: [1, 0, 0] })).toBe(-Math.PI / 4);
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
