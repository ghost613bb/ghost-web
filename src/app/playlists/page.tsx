// 动态渲染
// 否则Next build 时会在构建阶段尝试读取 Supabase，环境里表没准备好或数据为空时容易造成构建期副作用。
export const dynamic = "force-dynamic";

import { renderModulePage } from "@/features/module-display-mode/demoPage";
import { getDisplayMode } from "@/features/module-display-mode/service";
import { PlaylistsPageView } from "@/features/playlists/PlaylistsPage";
import { getPlaylistPageData } from "@/features/playlists/service";

export default async function PlaylistsPage() {
  const displayMode = await getDisplayMode("playlists");

  if (displayMode === "demo") {
    return renderModulePage({
      moduleId: "playlists",
      title: "歌单",
      demoTitle: "歌单-演示模式",
      demoDescription: "这是歌单模块的基础演示内容。",
      activeTab: "playlists",
    });
  }

  const data = await getPlaylistPageData();

  return <PlaylistsPageView {...data} />;
}
