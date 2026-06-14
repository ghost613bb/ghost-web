import { renderModulePage } from "@/features/module-display-mode/demoPage";

export default async function CoffeePage() {
  return renderModulePage({
    moduleId: "coffee",
    title: "咖啡推荐",
    demoTitle: "咖啡推荐-演示模式",
    demoDescription: "这是咖啡推荐模块的基础演示内容。",
    activeTab: "coffee",
  });
}
