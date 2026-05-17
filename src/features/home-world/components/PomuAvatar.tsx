"use client";

import { Clone, useGLTF } from "@react-three/drei";

const pomuModelPath = "/models/pomu_rainpuff/scene.gltf";

export function PomuAvatar() {
  const { scene } = useGLTF(pomuModelPath);

  return (
    <group position={[0, 0.02, 0]} rotation={[0, 0, 0]} scale={0.25}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload(pomuModelPath);
