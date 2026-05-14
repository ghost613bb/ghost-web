"use client";

import { Html } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { HomeModule } from "@/features/home-world/types";

type HouseNodeProps = {
  module: HomeModule;
  active: boolean;
  onActiveChange: (id: string | null) => void;
};

export function HouseNode({ module, active, onActiveChange }: HouseNodeProps) {
  const router = useRouter();
  const [pressedOnce, setPressedOnce] = useState(false);
  const emissiveIntensity = active ? 1.2 : 0.25;
  const scale = active ? 1.08 : 1;
  const y = active ? 0.14 : 0;

  const roofColor = useMemo(() => module.accentColor, [module.accentColor]);

  function handleClick() {
    if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches && !pressedOnce) {
      setPressedOnce(true);
      onActiveChange(module.id);
      return;
    }

    router.push(module.route);
  }

  return (
    <group
      position={[module.position[0], module.position[1] + y, module.position[2]]}
      scale={scale}
      onPointerEnter={(event) => {
        event.stopPropagation();
        onActiveChange(module.id);
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setPressedOnce(false);
        onActiveChange(null);
      }}
      onClick={(event) => {
        event.stopPropagation();
        handleClick();
      }}
    >
      <mesh castShadow receiveShadow position={[0, 0.38, 0]}>
        <boxGeometry args={[0.86, 0.76, 0.86]} />
        <meshStandardMaterial color={module.color} emissive={module.color} emissiveIntensity={emissiveIntensity} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, 0.9, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.72, 0.55, 4]} />
        <meshStandardMaterial color={roofColor} emissive={roofColor} emissiveIntensity={active ? 0.85 : 0.18} roughness={0.48} />
      </mesh>
      <mesh position={[0, 0.38, 0.435]}>
        <boxGeometry args={[0.22, 0.32, 0.025]} />
        <meshStandardMaterial color="#fff7ad" emissive="#fff7ad" emissiveIntensity={active ? 1.5 : 0.45} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.58, 0.64, 48]} />
        <meshBasicMaterial color={module.accentColor} transparent opacity={active ? 0.75 : 0.18} />
      </mesh>
      {active ? (
        <Html center position={[0, 1.45, 0]}>
          <div className="w-max rounded-full border border-white/20 bg-black/65 px-3 py-1 text-xs font-semibold text-white shadow-xl backdrop-blur">
            {module.title}
          </div>
        </Html>
      ) : null}
    </group>
  );
}
