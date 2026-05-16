"use client";

import { useState } from "react";
import { homeModules } from "@/features/home-world/config/homeModules";
import { HomeOverlay } from "./HomeOverlay";
import { HomeWorldCanvas } from "./HomeWorldCanvas";

export function HomeWorld() {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[rgb(172,245,250)]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(116,206,246)_0%,rgb(172,245,250)_42%,rgb(172,245,250)_100%)]" />
      <HomeWorldCanvas activeModuleId={activeModuleId} modules={homeModules} onActiveModuleChange={setActiveModuleId} />
      <HomeOverlay activeModuleId={activeModuleId} modules={homeModules} />
      <noscript>
        <div className="relative z-20 bg-[rgb(172,245,250)] p-6 text-slate-900">
          JavaScript 关闭时无法显示 3D 首页，请使用页面中的模块导航进入内容。
        </div>
      </noscript>
    </main>
  );
}
