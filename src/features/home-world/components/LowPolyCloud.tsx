"use client";

import { Clone, useGLTF } from "@react-three/drei";

const cloudModelPath = "/models/low_poly_cloud/scene.gltf";

type LowPolyCloudProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

export function LowPolyCloud(props: LowPolyCloudProps) {
  const { scene } = useGLTF(cloudModelPath);

  return <Clone object={scene} {...props} />;
}

useGLTF.preload(cloudModelPath);
