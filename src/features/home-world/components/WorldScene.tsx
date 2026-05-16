"use client";

import { Float, OrbitControls } from "@react-three/drei";
import type { HomeModule } from "@/features/home-world/types";
import { CenterAvatar } from "./CenterAvatar";
import { HouseNode } from "./HouseNode";
import { LowPolyCloud } from "./LowPolyCloud";

type WorldSceneProps = {
  activeModuleId: string | null;
  modules: HomeModule[];
  onActiveModuleChange: (id: string | null) => void;
};

export function WorldScene({ activeModuleId, modules, onActiveModuleChange }: WorldSceneProps) {
  return (
    <>
      <color attach="background" args={["#acf5fa"]} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 7, 3]} intensity={2.2} castShadow />
      <LowPolyCloud position={[-6.25, 1.12, -0.35]} rotation={[0, -0.18, 0]} scale={0.026} />
      <LowPolyCloud position={[-4.75, 1.35, -2.0]} rotation={[0, 0.28, 0]} scale={0.022} />
      <LowPolyCloud position={[-3.05, 1.56, -3.7]} rotation={[0, -0.35, 0]} scale={0.016} />
      <LowPolyCloud position={[3.2, 1.56, -3.3]} rotation={[0, 0.2, 0]} scale={0.016} />
      <LowPolyCloud position={[4.0, 1.35, -2.2]} rotation={[0, -0.28, 0]} scale={0.022} />
      <LowPolyCloud position={[4.95, 1.12, -0.95]} rotation={[0, -0.12, 0]} scale={0.026} />

      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
        <boxGeometry args={[7.4, 7.4, 0.18]} />
        <meshStandardMaterial color="rgb(119, 70, 66)" roughness={0.82} metalness={0.08} />
      </mesh>

      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
        <boxGeometry args={[7.4, 7.4, 0.08]} />
        <meshStandardMaterial color="rgb(137, 197, 82)" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
