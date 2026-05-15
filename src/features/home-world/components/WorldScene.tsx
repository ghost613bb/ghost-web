"use client";

import { Float, OrbitControls, Stars } from "@react-three/drei";
import type { HomeModule } from "@/features/home-world/types";
import { CenterAvatar } from "./CenterAvatar";
import { HouseNode } from "./HouseNode";

type WorldSceneProps = {
  activeModuleId: string | null;
  modules: HomeModule[];
  onActiveModuleChange: (id: string | null) => void;
};

export function WorldScene({ activeModuleId, modules, onActiveModuleChange }: WorldSceneProps) {
  return (
    <>
      <color attach="background" args={["#050816"]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 7, 3]} intensity={2.2} castShadow />
      <pointLight position={[-3, 2.2, 2]} color="#00f5d4" intensity={45} distance={8} />
      <pointLight position={[3, 2.4, -2]} color="#f15bb5" intensity={35} distance={7} />
      <Stars radius={18} depth={18} count={900} factor={2.5} saturation={0.2} fade speed={0.35} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.4, 80]} />
        <meshStandardMaterial color="#10202f" roughness={0.82} metalness={0.08} />
      </mesh>

      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 3.35, 96]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.18} />
      </mesh>

      <Float speed={1} rotationIntensity={0.04} floatIntensity={0.08}>
        <CenterAvatar />
      </Float>

      {modules.map((module) => (
        <HouseNode
          key={module.id}
          module={module}
          active={activeModuleId === module.id}
          onActiveChange={onActiveModuleChange}
        />
      ))}

      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.15} minDistance={4.2} maxDistance={7.2} />
    </>
  );
}
