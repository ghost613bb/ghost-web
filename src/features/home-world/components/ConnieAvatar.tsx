"use client";

import { Clone, useGLTF } from "@react-three/drei";

const connieModelPath = "/models/frosty_mittens_connie/scene.gltf";

export function ConnieAvatar() {
  const { scene } = useGLTF(connieModelPath);

  return (
    <group position={[0, 0.02, 0.15]} rotation={[0, Math.PI, 0]} scale={0.32}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload(connieModelPath);
