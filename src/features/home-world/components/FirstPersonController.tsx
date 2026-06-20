"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { Vector3 } from "three";
import {
  clampToTownDiamond,
  firstPersonNavigation,
  getFocusedModule,
} from "@/features/home-world/config/townNavigation";
import type { HomeModule } from "@/features/home-world/types";

type FirstPersonControllerProps = {
  activeModuleId: string | null;
  isExploring: boolean;
  modules: HomeModule[];
  onActiveModuleChange: (id: string | null) => void;
  onExploringChange: (value: boolean) => void;
  onPointerLockChange: (value: boolean) => void;
};

const forward = new Vector3();
const right = new Vector3();
const moveDirection = new Vector3();

export function FirstPersonController({
  activeModuleId,
  isExploring,
  modules,
  onActiveModuleChange,
  onExploringChange,
  onPointerLockChange,
}: FirstPersonControllerProps) {
  const router = useRouter();
  const { camera, gl } = useThree();
  const activeModuleIdRef = useRef(activeModuleId);
  const isExploringRef = useRef(isExploring);
  const keysRef = useRef(new Set<string>());
  const yawRef = useRef(0);
  const pitchRef = useRef(-0.08);
  const modulesById = useMemo(() => new Map(modules.map((module) => [module.id, module])), [modules]);

  useEffect(() => {
    activeModuleIdRef.current = activeModuleId;
  }, [activeModuleId]);

  useEffect(() => {
    isExploringRef.current = isExploring;
  }, [isExploring]);

  useEffect(() => {
    camera.position.set(...firstPersonNavigation.startPosition);
    camera.rotation.order = "YXZ";
    camera.rotation.set(pitchRef.current, yawRef.current, 0);
  }, [camera]);

  useEffect(() => {
    const canvas = gl.domElement;

    const syncPointerLock = () => {
      const locked = document.pointerLockElement === canvas;
      onPointerLockChange(locked);

      if (!locked) {
        keysRef.current.clear();
      }
    };

    const lockPointer = () => {
      if (document.pointerLockElement === canvas) {
        return;
      }

      void canvas.requestPointerLock?.();
    };

    const requestPointerLock = () => {
      if (!isExploringRef.current) {
        return;
      }

      lockPointer();
    };

    document.addEventListener("pointerlockchange", syncPointerLock);
    canvas.addEventListener("pointerdown", requestPointerLock);
    window.addEventListener(firstPersonNavigation.startEventName, lockPointer);

    return () => {
      document.removeEventListener("pointerlockchange", syncPointerLock);
      canvas.removeEventListener("pointerdown", requestPointerLock);
      window.removeEventListener(firstPersonNavigation.startEventName, lockPointer);
    };
  }, [gl.domElement, onPointerLockChange]);

  useEffect(() => {
    const navigateToActiveModule = () => {
      const activeModule = activeModuleIdRef.current ? modulesById.get(activeModuleIdRef.current) : null;

      if (activeModule) {
        router.push(activeModule.route);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright", "shift"].includes(key)) {
        keysRef.current.add(key);
        event.preventDefault();
      }

      if ((key === "e" || key === "enter") && isExploringRef.current) {
        event.preventDefault();
        navigateToActiveModule();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.key.toLowerCase());
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) {
        return;
      }

      yawRef.current -= event.movementX * firstPersonNavigation.mouseSensitivity;
      pitchRef.current = Math.min(
        firstPersonNavigation.pitchMax,
        Math.max(firstPersonNavigation.pitchMin, pitchRef.current - event.movementY * firstPersonNavigation.mouseSensitivity),
      );
      camera.rotation.set(pitchRef.current, yawRef.current, 0);
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement || event.button !== 0) {
        return;
      }

      navigateToActiveModule();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [camera, gl.domElement, modulesById, router]);

  useEffect(() => {
    if (!isExploring && document.pointerLockElement === gl.domElement) {
      document.exitPointerLock();
    }
  }, [gl.domElement, isExploring]);

  useFrame((_, delta) => {
    if (!isExploringRef.current) {
      if (activeModuleIdRef.current !== null) {
        activeModuleIdRef.current = null;
        onActiveModuleChange(null);
      }
      return;
    }

    const keys = keysRef.current;
    const clampedDelta = Math.min(delta, 0.04);
    const speed = keys.has("shift") ? firstPersonNavigation.sprintSpeed : firstPersonNavigation.walkSpeed;

    forward.set(-Math.sin(yawRef.current), 0, -Math.cos(yawRef.current)).normalize();
    right.set(Math.cos(yawRef.current), 0, -Math.sin(yawRef.current)).normalize();
    moveDirection.set(0, 0, 0);

    if (keys.has("w") || keys.has("arrowup")) {
      moveDirection.add(forward);
    }

    if (keys.has("s") || keys.has("arrowdown")) {
      moveDirection.sub(forward);
    }

    if (keys.has("d") || keys.has("arrowright")) {
      moveDirection.add(right);
    }

    if (keys.has("a") || keys.has("arrowleft")) {
      moveDirection.sub(right);
    }

    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize().multiplyScalar(speed * clampedDelta);
      const nextPosition = clampToTownDiamond([
        camera.position.x + moveDirection.x,
        firstPersonNavigation.eyeHeight,
        camera.position.z + moveDirection.z,
      ]);

      camera.position.set(...nextPosition);
    }

    const focusedModule = getFocusedModule({
      cameraPosition: [camera.position.x, camera.position.y, camera.position.z],
      forward: [forward.x, forward.y, forward.z],
      modules,
    });

    if (focusedModule?.id !== activeModuleIdRef.current) {
      activeModuleIdRef.current = focusedModule?.id ?? null;
      onActiveModuleChange(focusedModule?.id ?? null);
    }
  });

  useEffect(() => {
    const handlePointerLockError = () => {
      onExploringChange(false);
      onPointerLockChange(false);
    };

    document.addEventListener("pointerlockerror", handlePointerLockError);
    return () => document.removeEventListener("pointerlockerror", handlePointerLockError);
  }, [onExploringChange, onPointerLockChange]);

  return null;
}
