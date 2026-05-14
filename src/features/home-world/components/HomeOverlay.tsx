import Link from "next/link";
import { siteConfig } from "@/data/site";
import type { HomeModule } from "@/features/home-world/types";

type HomeOverlayProps = {
  activeModuleId: string | null;
  modules: HomeModule[];
};

export function HomeOverlay({ activeModuleId, modules }: HomeOverlayProps) {
  const activeModule = modules.find((module) => module.id === activeModuleId) ?? null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-5 text-white sm:p-8">
      <header className="max-w-xl">
        <p className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm text-white/80 backdrop-blur">
          {siteConfig.oneLineIntro}
        </p>
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{siteConfig.name}</h1>
        <p className="mt-3 text-lg text-white/75">{siteConfig.title}</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-h-28 max-w-md rounded-3xl border border-white/15 bg-black/30 p-5 shadow-2xl backdrop-blur-md">
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">当前靠近</p>
          <h2 className="mt-2 text-2xl font-bold">{activeModule?.title ?? "选择一间房子"}</h2>
          <p className="mt-2 text-sm leading-6 text-white/75">
            {activeModule?.intro ?? "hover 或点按房子查看模块说明，也可以使用下方导航直接进入内容。"}
          </p>
          {activeModule ? (
            <Link
              className="pointer-events-auto mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
              href={activeModule.route}
            >
              进入 {activeModule.title}
            </Link>
          ) : null}
        </div>

        <nav aria-label="首页模块导航" className="pointer-events-auto flex max-w-4xl flex-wrap gap-2 rounded-3xl border border-white/10 bg-black/25 p-3 backdrop-blur-md">
          {modules.map((module) => (
            <Link
              key={module.id}
              href={module.route}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/85 transition hover:border-white/40 hover:bg-white/20"
            >
              {module.title}
            </Link>
          ))}
        </nav>
      </section>
    </div>
  );
}
