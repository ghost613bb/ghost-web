import { renderModulePage } from "@/features/module-display-mode/demoPage";

export default async function AboutPage() {
  return renderModulePage({
    moduleId: "about",
    title: "心情日记",
    demoTitle: "心情日记-演示模式",
    demoDescription: "这是心情日记模块的基础演示内容。",
  });
}
