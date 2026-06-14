import { ContentTabsHeader } from "@/features/content-modules/components/ContentTabsHeader";
import type { ContentTabId } from "@/features/content-modules/config/contentTabs";
import { getDisplayMode } from "@/features/module-display-mode/service";
import type { ModuleId } from "@/features/module-display-mode/configurableModules";

type DemoPageOptions = {
  moduleId: ModuleId;
  title: string;
  demoTitle: string;
  demoDescription: string;
  activeTab: ContentTabId;
};

export async function renderModulePage({ moduleId, title, demoTitle, demoDescription, activeTab }: DemoPageOptions) {
  const isDemoMode = (await getDisplayMode(moduleId)) === "demo";

  return (
    <main className="album-page-scrollbar h-dvh overflow-y-auto bg-[#fff8e6] text-[#4a2e28] [background-image:radial-gradient(circle_at_12%_18%,rgba(255,199,211,0.28)_0_80px,transparent_81px),radial-gradient(circle_at_88%_72%,rgba(190,233,221,0.36)_0_120px,transparent_121px),linear-gradient(90deg,rgba(121,76,55,0.04)_1px,transparent_1px),linear-gradient(rgba(121,76,55,0.035)_1px,transparent_1px)] [background-size:auto,auto,42px_42px,42px_42px]">
      <ContentTabsHeader activeTab={activeTab} />
      <section className="mx-auto max-w-[1280px] px-4 pb-12 pt-14 sm:px-6">
        <div className="rounded-[1.6rem] border-[2px] border-[#5b3a30] bg-[#fffdf2]/90 p-6 shadow-[8px_8px_0_rgba(91,58,48,0.12)] sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#7a5147]">{isDemoMode ? demoTitle : title}</p>
          <h1 className="mt-3 text-[2rem] font-black tracking-tight text-[#4a2e28] sm:text-[2.6rem]">{title}</h1>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-8 text-[#765247]">{demoDescription}</p>
        </div>
      </section>
    </main>
  );
}
