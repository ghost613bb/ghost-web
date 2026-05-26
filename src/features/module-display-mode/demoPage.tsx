import { getDisplayMode } from "@/features/module-display-mode/service";
import type { ModuleId } from "@/features/module-display-mode/configurableModules";

type DemoPageOptions = {
  moduleId: ModuleId;
  title: string;
  demoTitle: string;
  demoDescription: string;
};

export async function renderModulePage({ moduleId, title, demoTitle, demoDescription }: DemoPageOptions) {
  if ((await getDisplayMode(moduleId)) === "demo") {
    return (
      <section className="space-y-3">
        <h1>{demoTitle}</h1>
        <p>{demoDescription}</p>
      </section>
    );
  }

  return <h1>{title}</h1>;
}
