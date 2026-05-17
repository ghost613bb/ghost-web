"use client";

import { Clone, useGLTF } from "@react-three/drei";

const rosemiModelPath = "/models/rosemi_lovelock/scene.gltf";

export function RosemiAvatar() {
  const { scene } = useGLTF(rosemiModelPath);

  return (
    <group position={[0, 0.02, 0]} rotation={[0, 0, 0]} scale={0.45}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload(rosemiModelPath);
