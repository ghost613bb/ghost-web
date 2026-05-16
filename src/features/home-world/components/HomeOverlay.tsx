import Link from "next/link";
import type { HomeModule } from "@/features/home-world/types";

type HomeOverlayProps = {
  activeModuleId: string | null;
  modules: HomeModule[];
};

export function HomeOverlay({ modules }: HomeOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-5 text-white sm:p-8">
      <header className="ml-8 max-w-xl sm:ml-16">
        <h1 className="font-mono text-4xl font-black tracking-tight text-[#f3b16e] [text-shadow:4px_0_0_#3b2415,-4px_0_0_#3b2415,0_4px_0_#3b2415,0_-4px_0_#3b2415,4px_4px_0_#8a4f2a] sm:text-6xl">
          Ghostspace
        </h1>
      </header>

      <nav aria-label="首页模块导航" className="pointer-events-auto absolute right-20 top-6 flex max-w-5xl flex-wrap gap-2 border-4 border-[#3b2415] bg-[rgb(251,223,184)] px-3 py-2 font-[Microsoft_YaHei,微软雅黑,sans-serif] text-slate-950 shadow-[6px_6px_0_#6f3f25] sm:right-40">
        {modules.map((module, index) => (
          <Link
            key={module.id}
            href={module.route}
            className={`border-2 border-transparent px-3 py-1 text-lg font-normal transition hover:border-[#8a4f2a] hover:bg-[rgb(238,171,118)] ${
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
