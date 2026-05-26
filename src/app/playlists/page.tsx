import { renderModulePage } from "@/features/module-display-mode/demoPage";

export default async function PlaylistsPage() {
  return renderModulePage({
    moduleId: "playlists",
    title: "歌单",
    demoTitle: "歌单-演示模式",
    demoDescription: "这是歌单模块的基础演示内容。",
  });
}
