"use client";

import { Html } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { houseAssets } from "@/features/home-world/config/houseAssets";
import type { HomeModule } from "@/features/home-world/types";
import { HouseVisual } from "./HouseVisual";

type HouseNodeProps = {
  module: HomeModule;
  active: boolean;
  onActiveChange: (id: string | null) => void;
  pointerNavigationEnabled?: boolean;
};

const grassSurfaceY = 0.17;
const hoverRingElevation = 0.02;

function getHoverRingPosition(module: HomeModule): [number, number, number] {
  if (!module.assetKey) {
    return [0, hoverRingElevation, 0];
  }

  const asset = houseAssets[module.assetKey];
  return [asset.position[0], hoverRingElevation, asset.position[2]];
}

export function HouseNode({ module, active, onActiveChange, pointerNavigationEnabled = true }: HouseNodeProps) {
  const router = useRouter();
  const [pressedOnce, setPressedOnce] = useState(false);
  const emissiveIntensity = active ? 1.2 : 0.25;
  const scale = active ? 1.08 : 1;
  const y = grassSurfaceY;
  const rotationY = module.position[0] < 0 ? Math.PI / 4 : -Math.PI / 4;
  const hoverRingPosition = getHoverRingPosition(module);

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
      rotation={[0, rotationY, 0]}
      scale={scale}
      onPointerEnter={(event) => {
        if (!pointerNavigationEnabled) {
          return;
        }

        event.stopPropagation();
        onActiveChange(module.id);
      }}
      onPointerLeave={(event) => {
        if (!pointerNavigationEnabled) {
          return;
        }

        event.stopPropagation();
        setPressedOnce(false);
        onActiveChange(null);
      }}
      onClick={(event) => {
        if (!pointerNavigationEnabled) {
          return;
        }

        event.stopPropagation();
        handleClick();
      }}
    >
      <HouseVisual module={module} active={active} emissiveIntensity={emissiveIntensity} />
      <mesh position={hoverRingPosition} rotation={[-Math.PI / 2, 0, 0]}>
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
