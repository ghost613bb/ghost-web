import { renderModulePage } from "@/features/module-display-mode/demoPage";

export default async function TodoPage() {
  return renderModulePage({
    moduleId: "todo",
    title: "人生todolist",
    demoTitle: "人生todolist-演示模式",
    demoDescription: "这是人生todolist模块的基础演示内容。",
  });
}
