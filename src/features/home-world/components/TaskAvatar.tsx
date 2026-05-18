"use client";

import { Clone, useGLTF } from "@react-three/drei";

const taskModelPath = "/models/task_avatar/scene.gltf";

export function TaskAvatar() {
  const { scene } = useGLTF(taskModelPath);

  return (
    <group position={[0, 0.02, 0]} rotation={[0, 0, 0]} scale={0.006}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload(taskModelPath);
