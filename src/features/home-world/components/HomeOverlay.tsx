import Link from "next/link";
import { siteConfig } from "@/data/site";
import type { HomeModule } from "@/features/home-world/types";

type HomeOverlayProps = {
  activeModuleId: string | null;
  modules: HomeModule[];
};

export function HomeOverlay({ modules }: HomeOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-5 text-white sm:p-8">
      <header className="max-w-xl">
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{siteConfig.name}</h1>
        <p className="mt-3 text-lg text-white/75">{siteConfig.title}</p>
      </header>

      <nav aria-label="首页模块导航" className="pointer-events-auto absolute right-12 top-6 flex max-w-5xl flex-wrap gap-3 border-4 border-[#3b2415] bg-[rgb(251,223,184)] px-5 py-3 text-slate-950 shadow-[6px_6px_0_#6f3f25] sm:right-24">
        {modules.map((module, index) => (
          <Link
            key={module.id}
            href={module.route}
            className={`border-2 border-transparent px-5 py-2 text-sm font-black transition hover:border-[#8a4f2a] hover:bg-[rgb(238,171,118)] ${
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
