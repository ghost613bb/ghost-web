"use client";

import { useState } from "react";
import { homeModules } from "@/features/home-world/config/homeModules";
import { firstPersonNavigation } from "@/features/home-world/config/townNavigation";
import { HomeOverlay } from "./HomeOverlay";
import { HomeWorldCanvas } from "./HomeWorldCanvas";
import { HomeWorldHud } from "./HomeWorldHud";

export function HomeWorld() {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isExploring, setIsExploring] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  function handleStartExploring() {
    setIsExploring(true);
    window.dispatchEvent(new Event(firstPersonNavigation.startEventName));
  }

  function handleExitExploring() {
    setIsExploring(false);
    setActiveModuleId(null);
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[rgb(172,245,250)]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(116,206,246)_0%,rgb(172,245,250)_42%,rgb(172,245,250)_100%)]" />
      <HomeOverlay />
      <HomeWorldCanvas
        activeModuleId={activeModuleId}
        isExploring={isExploring}
        modules={homeModules}
        onActiveModuleChange={setActiveModuleId}
        onExploringChange={setIsExploring}
        onPointerLockChange={setIsPointerLocked}
      />
      <HomeWorldHud
        activeModuleId={activeModuleId}
        isExploring={isExploring}
        isPointerLocked={isPointerLocked}
        modules={homeModules}
        onExit={handleExitExploring}
        onStart={handleStartExploring}
      />
      <noscript>
        <div className="relative z-20 bg-[rgb(172,245,250)] p-6 text-slate-900">
          JavaScript 关闭时无法显示 3D 首页，请使用页面中的模块导航进入内容。
        </div>
      </noscript>
    </main>
  );
}
