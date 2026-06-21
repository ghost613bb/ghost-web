import { houseAssets } from "@/features/home-world/config/houseAssets";
import type { HomeModule } from "@/features/home-world/types";

export type Vec3 = [number, number, number];

export const townSceneTransform = {
  position: [0, -0.24, 0] as Vec3,
  scale: 1.04,
};

export const firstPersonNavigation = {
  startEventName: "ghost-web:start-first-person",
  startPosition: [0, 0.38, 3.35] as Vec3,
  fov: 62,
  groundHalfWorldSize: 5.4 * townSceneTransform.scale - 0.35,
  focusDistance: 1.55,
  focusDotThreshold: 0.5,
  eyeHeight: 0.38,
  walkSpeed: 1.35,
  sprintSpeed: 2.05,
  mouseSensitivity: 0.0022,
  pitchMin: -0.48,
  pitchMax: 0.34,
};

type FocusedModuleOptions = {
  cameraPosition: Vec3;
  forward: Vec3;
  modules: HomeModule[];
};

function normalizeHorizontal([x, , z]: Vec3): Vec3 {
  const length = Math.hypot(x, z);

  if (length === 0) {
    return [0, 0, -1];
  }

  return [x / length, 0, z / length];
}

export function getModuleWorldTarget(module: HomeModule): Vec3 {
  const assetOffset = module.assetKey ? houseAssets[module.assetKey].position : [0, 0, 0];

  return [
    (module.position[0] + assetOffset[0]) * townSceneTransform.scale + townSceneTransform.position[0],
    firstPersonNavigation.eyeHeight,
    (module.position[2] + assetOffset[2]) * townSceneTransform.scale + townSceneTransform.position[2],
  ];
}

export function clampToTownDiamond([x, y, z]: Vec3): Vec3 {
  const limit = firstPersonNavigation.groundHalfWorldSize;
  const distance = Math.abs(x) + Math.abs(z);

  if (distance <= limit) {
    return [x, y, z];
  }

  const scale = limit / distance;
  return [x * scale, y, z * scale];
}

export function getFocusedModule({ cameraPosition, forward, modules }: FocusedModuleOptions): HomeModule | null {
  const normalizedForward = normalizeHorizontal(forward);
  let focusedModule: HomeModule | null = null;
  let focusedScore = -Infinity;

  for (const module of modules) {
    const target = getModuleWorldTarget(module);
    const toTarget: Vec3 = [target[0] - cameraPosition[0], 0, target[2] - cameraPosition[2]];
    const distance = Math.hypot(toTarget[0], toTarget[2]);

    if (distance > firstPersonNavigation.focusDistance || distance === 0) {
      continue;
    }

    const normalizedTarget = normalizeHorizontal(toTarget);
    const dot = normalizedForward[0] * normalizedTarget[0] + normalizedForward[2] * normalizedTarget[2];

    if (dot < firstPersonNavigation.focusDotThreshold) {
      continue;
    }

    const score = dot * 2 - distance / firstPersonNavigation.focusDistance;

    if (score > focusedScore) {
      focusedScore = score;
      focusedModule = module;
    }
  }

  return focusedModule;
}
