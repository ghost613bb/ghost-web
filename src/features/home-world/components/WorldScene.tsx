"use client";

import { Float } from "@react-three/drei";
import { townSceneTransform } from "@/features/home-world/config/townNavigation";
import type { HomeModule } from "@/features/home-world/types";
import { CenterAvatar } from "./CenterAvatar";
import { FirstPersonController } from "./FirstPersonController";
import { HouseNode } from "./HouseNode";
import { ParallelogramTownGround } from "./ParallelogramTownGround";
import { LowPolyCloud } from "./LowPolyCloud";
import { LowPolySun } from "./LowPolySun";

type WorldSceneProps = {
  activeModuleId: string | null;
  isExploring: boolean;
  modules: HomeModule[];
  onActiveModuleChange: (id: string | null) => void;
  onExploringChange: (value: boolean) => void;
  onPointerLockChange: (value: boolean) => void;
};

export function WorldScene({ activeModuleId, isExploring, modules, onActiveModuleChange, onExploringChange, onPointerLockChange }: WorldSceneProps) {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 7, 3]} intensity={2.2} castShadow />
      <group position={townSceneTransform.position} scale={townSceneTransform.scale}>
        <LowPolyCloud position={[-6.25, 1.12, -0.35]} rotation={[0, -0.18, 0]} scale={0.026} />
        <LowPolyCloud position={[-4.55, 1.35, -2.0]} rotation={[0, 0.28, 0]} scale={0.022} />
        <LowPolySun position={[-4.95, 1.58, -3.7]} rotation={[0, 0, 0]} scale={0.0034} />
        <LowPolyCloud position={[-3.05, 1.56, -3.7]} rotation={[0, -0.35, 0]} scale={0.016} />
        <LowPolyCloud position={[3.2, 1.56, -3.3]} rotation={[0, 0.2, 0]} scale={0.016} />
        <LowPolyCloud position={[4.0, 1.35, -2.2]} rotation={[0, -0.28, 0]} scale={0.022} />
        <LowPolyCloud position={[4.95, 1.12, -0.95]} rotation={[0, -0.12, 0]} scale={0.026} />

        <ParallelogramTownGround color="rgb(119, 70, 66)" y={-0.09} thickness={0.18} roughness={0.82} metalness={0.08} />
        <ParallelogramTownGround color="rgb(137, 197, 82)" y={0.12} thickness={0.08} roughness={0.9} />

        <Float speed={1} rotationIntensity={0.04} floatIntensity={0.08}>
          <CenterAvatar />
        </Float>

        {modules.map((module) => (
          <HouseNode
            key={module.id}
            module={module}
            active={activeModuleId === module.id}
            onActiveChange={onActiveModuleChange}
            pointerNavigationEnabled={false}
          />
        ))}
      </group>

      <FirstPersonController
        activeModuleId={activeModuleId}
        isExploring={isExploring}
        modules={modules}
        onActiveModuleChange={onActiveModuleChange}
        onExploringChange={onExploringChange}
        onPointerLockChange={onPointerLockChange}
      />
    </>
  );
}
