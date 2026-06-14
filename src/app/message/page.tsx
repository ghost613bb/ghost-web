import { renderModulePage } from "@/features/module-display-mode/demoPage";

export default async function MessagePage() {
  return renderModulePage({
    moduleId: "message",
    title: "学习笔记",
    demoTitle: "学习笔记-演示模式",
    demoDescription: "这是学习笔记模块的基础演示内容。",
    activeTab: "message",
  });
}
