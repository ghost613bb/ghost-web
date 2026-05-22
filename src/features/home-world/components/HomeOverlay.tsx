import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { HomeModule } from "@/features/home-world/types";

type HomeOverlayProps = {
  activeModuleId: string | null;
  modules: HomeModule[];
};

const NAV_HORIZONTAL_PADDING = 96;
const NAV_VIEWPORT_BASELINE_HEIGHT = 700;

function getNavScale(innerWidth: number, innerHeight: number, measuredWidth: number) {
  if (measuredWidth === 0) {
    return 1;
  }

  const availableWidth = Math.max(innerWidth - NAV_HORIZONTAL_PADDING, 0);
  const widthScale = availableWidth / measuredWidth;
  const heightScale = innerHeight / NAV_VIEWPORT_BASELINE_HEIGHT;

  return Math.min(1, widthScale, heightScale);
}

export function HomeOverlay({ modules }: HomeOverlayProps) {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const [titleScale, setTitleScale] = useState(1);
  const [navScale, setNavScale] = useState(1);

  useLayoutEffect(() => {
    const updateOverlayScale = () => {
      const nav = navRef.current;
      const title = titleRef.current;

      if (nav) {
        setNavScale(getNavScale(window.innerWidth, window.innerHeight, nav.scrollWidth));
      }

      if (title) {
        setTitleScale(getNavScale(window.innerWidth, window.innerHeight, title.scrollWidth));
      }
    };

    updateOverlayScale();
    window.addEventListener("resize", updateOverlayScale);

    return () => window.removeEventListener("resize", updateOverlayScale);
  }, [modules]);

  useEffect(() => {
    const nav = navRef.current;
    const title = titleRef.current;

    if (!nav && !title) {
      return;
    }

    const updateOverlayScale = () => {
      if (nav) {
        setNavScale(getNavScale(window.innerWidth, window.innerHeight, nav.scrollWidth));
      }

      if (title) {
        setTitleScale(getNavScale(window.innerWidth, window.innerHeight, title.scrollWidth));
      }
    };

    const fontsReady = document.fonts?.ready;

    if (fontsReady) {
      void fontsReady.then(updateOverlayScale);
    }

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(updateOverlayScale);

    if (nav) {
      observer.observe(nav);
    }

    if (title) {
      observer.observe(title);
    }

    return () => observer.disconnect();
  }, [modules]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-5 text-white sm:p-8">
      <header className="ml-8 max-w-xl sm:ml-16">
        <h1
          ref={titleRef}
          style={{ transform: `scale(${titleScale})`, transformOrigin: "top left" }}
          className="inline-block font-mono text-4xl font-black tracking-tight text-[#f3b16e] [text-shadow:4px_0_0_#3b2415,-4px_0_0_#3b2415,0_4px_0_#3b2415,0_-4px_0_#3b2415,4px_4px_0_#8a4f2a] sm:text-6xl"
        >
          Ghostspace
        </h1>
      </header>

      <nav
        ref={navRef}
        aria-label="首页模块导航"
        style={{ transform: `scale(${navScale})`, transformOrigin: "top right" }}
        className="pointer-events-auto absolute right-4 top-6 flex w-max max-w-none flex-nowrap gap-2 border-4 border-[#3b2415] bg-[rgb(251,223,184)] px-3 py-2 font-[Microsoft_YaHei,微软雅黑,sans-serif] text-slate-950 shadow-[6px_6px_0_#6f3f25] sm:right-40"
      >
        {modules.map((module, index) => (
          <Link
            key={module.id}
            href={module.route}
            className={`shrink-0 border-2 border-transparent px-3 py-1 text-lg font-normal transition hover:border-[#8a4f2a] hover:bg-[rgb(238,171,118)] ${
              index === 0 ? "bg-[rgb(238,171,118)] shadow-[4px_4px_0_rgba(111,63,37,0.28)]" : ""
            }`}
          >
            {module.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
