"use client";

import { Clone, useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { Mesh, MeshStandardMaterial } from "three";

const cloudModelPath = "/models/low_poly_cloud/scene.gltf";

type LowPolyCloudProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

export function LowPolyCloud(props: LowPolyCloudProps) {
  const { scene } = useGLTF(cloudModelPath);

  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.material = new MeshStandardMaterial({ color: "#ffffff", roughness: 0.85 });
      }
    });
  }, [scene]);

  return <Clone object={scene} {...props} />;
}

useGLTF.preload(cloudModelPath);
