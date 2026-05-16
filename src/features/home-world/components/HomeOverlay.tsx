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

      <nav aria-label="首页模块导航" className="pointer-events-auto absolute right-6 top-8 flex max-w-4xl flex-wrap gap-3 rounded-3xl bg-[rgb(251,223,184)] p-3 text-slate-950 shadow-2xl sm:right-12">
        {modules.map((module) => (
          <Link
            key={module.id}
            href={module.route}
            className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-[rgb(238,171,118)]"
          >
            {module.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
