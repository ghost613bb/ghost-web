import { renderModulePage } from "@/features/module-display-mode/demoPage";

export default async function AlbumPage() {
  return renderModulePage({
    moduleId: "album",
    title: "个人相册",
    demoTitle: "个人相册-演示模式",
    demoDescription: "这是个人相册模块的基础演示内容。",
  });
}
