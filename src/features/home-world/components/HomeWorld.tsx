"use client";

import { useState } from "react";
import { homeModules } from "@/features/home-world/config/homeModules";
import { HomeOverlay } from "./HomeOverlay";
import { HomeWorldCanvas } from "./HomeWorldCanvas";

export function HomeWorld() {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-slate-950">
      <HomeWorldCanvas activeModuleId={activeModuleId} modules={homeModules} onActiveModuleChange={setActiveModuleId} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.18),transparent_38%),linear-gradient(to_bottom,rgba(2,6,23,0.18),rgba(2,6,23,0.82))]" />
      <HomeOverlay activeModuleId={activeModuleId} modules={homeModules} />
      <noscript>
        <div className="relative z-20 bg-slate-950 p-6 text-white">
          JavaScript 关闭时无法显示 3D 首页，请使用页面中的模块导航进入内容。
        </div>
      </noscript>
    </main>
  );
}
