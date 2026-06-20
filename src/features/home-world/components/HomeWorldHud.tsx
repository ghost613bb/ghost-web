import type { HomeModule } from "@/features/home-world/types";

type HomeWorldHudProps = {
  activeModuleId: string | null;
  isExploring: boolean;
  isPointerLocked: boolean;
  modules: HomeModule[];
  onExit: () => void;
  onStart: () => void;
};

export function HomeWorldHud({ activeModuleId, isExploring, isPointerLocked, modules, onExit, onStart }: HomeWorldHudProps) {
  const activeModule = modules.find((module) => module.id === activeModuleId) ?? null;

  return (
    <section className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-4 text-[#4a2e28]">
      <div className="pointer-events-auto w-full max-w-[920px] rounded-[1.45rem] border-[2px] border-[#5b3a30] bg-[#fff8e6]/92 p-4 shadow-[6px_6px_0_rgba(91,58,48,0.16)] backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-5">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8a5a4d]">Ghostspace Walk</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-[#4a2e28]">
            {isExploring ? "正在第一视角逛小镇" : "第一视角逛小镇"}
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#765247]">
            {isExploring
              ? "WASD / 方向键移动，鼠标转向，E 或 Enter 进入房间，Esc 释放鼠标。"
              : "点击开始后进入鼠标视角，靠近并看向建筑就能打开对应页面。"}
          </p>
          <p aria-live="polite" className="mt-2 min-h-6 text-sm font-black text-[#b84a62]">
            {activeModule ? `靠近：${activeModule.title}，按 E / Enter 进入` : isExploring ? "寻找一间想进入的小房子" : ""}
          </p>
        </div>
        <div className="mt-4 flex shrink-0 flex-wrap items-center gap-3 sm:mt-0 sm:justify-end">
          {isExploring ? (
            <button
              className="rounded-full border-[2px] border-[#5b3a30] bg-[#ffb9c8] px-5 py-2 text-sm font-black text-[#4a2e28] shadow-[3px_3px_0_rgba(91,58,48,0.16)] transition hover:-translate-y-0.5 hover:bg-[#ffc7d3]"
              onClick={onExit}
              type="button"
            >
              退出第一视角
            </button>
          ) : (
            <button
              className="rounded-full border-[2px] border-[#5b3a30] bg-[#ffb9c8] px-5 py-2 text-sm font-black text-[#4a2e28] shadow-[3px_3px_0_rgba(91,58,48,0.16)] transition hover:-translate-y-0.5 hover:bg-[#ffc7d3]"
              onClick={onStart}
              type="button"
            >
              开始探索
            </button>
          )}
          <span className="rounded-full border border-[#5b3a30]/30 bg-white/55 px-3 py-1 text-xs font-black text-[#7a5147]">
            {isPointerLocked ? "鼠标已锁定" : "鼠标未锁定"}
          </span>
        </div>
      </div>
    </section>
  );
}
