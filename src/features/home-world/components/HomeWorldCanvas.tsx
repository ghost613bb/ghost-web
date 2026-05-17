"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import type { HomeModule } from "@/features/home-world/types";
import { WorldScene } from "./WorldScene";

type HomeWorldCanvasProps = {
  activeModuleId: string | null;
  modules: HomeModule[];
  onActiveModuleChange: (id: string | null) => void;
};

export function HomeWorldCanvas({ activeModuleId, modules, onActiveModuleChange }: HomeWorldCanvasProps) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 2.95, 7.05], fov: 44 }}
        dpr={[1, 1.6]}
        shadows
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <WorldScene activeModuleId={activeModuleId} modules={modules} onActiveModuleChange={onActiveModuleChange} />
        </Suspense>
      </Canvas>
    </div>
  );
}
