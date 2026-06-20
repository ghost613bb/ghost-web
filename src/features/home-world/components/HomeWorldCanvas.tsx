"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import type { HomeModule } from "@/features/home-world/types";
import { WorldScene } from "./WorldScene";

type HomeWorldCanvasProps = {
  activeModuleId: string | null;
  isExploring: boolean;
  modules: HomeModule[];
  onActiveModuleChange: (id: string | null) => void;
  onExploringChange: (value: boolean) => void;
  onPointerLockChange: (value: boolean) => void;
};

export function HomeWorldCanvas({ activeModuleId, isExploring, modules, onActiveModuleChange, onExploringChange, onPointerLockChange }: HomeWorldCanvasProps) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0.82, 3.35], fov: 62, near: 0.05, far: 80 }}
        dpr={[1, 1.6]}
        shadows
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <WorldScene
            activeModuleId={activeModuleId}
            isExploring={isExploring}
            modules={modules}
            onActiveModuleChange={onActiveModuleChange}
            onExploringChange={onExploringChange}
            onPointerLockChange={onPointerLockChange}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
