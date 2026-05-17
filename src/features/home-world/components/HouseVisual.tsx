"use client";

import { Clone, useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { Mesh } from "three";
import { houseAssets } from "@/features/home-world/config/houseAssets";
import type { HomeModule } from "@/features/home-world/types";

type HouseVisualProps = {
  module: HomeModule;
  active: boolean;
  emissiveIntensity: number;
};

function ModelHouse({ module }: { module: HomeModule & { assetKey: keyof typeof houseAssets } }) {
  const asset = houseAssets[module.assetKey];
  const { scene } = useGLTF(asset.path);

  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [scene]);

  return <Clone object={scene} position={asset.position} rotation={asset.rotation} scale={asset.scale} />;
}

function PlaceholderHouse({ module, active, emissiveIntensity }: HouseVisualProps) {
  const roofColor = useMemo(() => module.accentColor, [module.accentColor]);

  return (
    <>
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
    </>
  );
}

export function HouseVisual(props: HouseVisualProps) {
  if (props.module.assetKey) {
    return <ModelHouse module={props.module as HomeModule & { assetKey: keyof typeof houseAssets }} />;
  }

  return <PlaceholderHouse {...props} />;
}

useGLTF.preload(houseAssets.fastFoodRestaurant.path);
