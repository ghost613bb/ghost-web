"use client";

import { Clone, useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { Mesh, MeshStandardMaterial } from "three";

const sunModelPath = "/models/low_poly_sun/scene.gltf";

type LowPolySunProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

export function LowPolySun(props: LowPolySunProps) {
  const { scene } = useGLTF(sunModelPath);

  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.material = new MeshStandardMaterial({
          color: "#ffd057",
          emissive: "#ff9f1c",
          emissiveIntensity: 0.65,
          roughness: 0.58,
        });
      }
    });
  }, [scene]);

  return <Clone object={scene} {...props} />;
}

useGLTF.preload(sunModelPath);
