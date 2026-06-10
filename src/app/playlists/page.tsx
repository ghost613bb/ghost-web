// 动态渲染
// 否则Next build 时会在构建阶段尝试读取 Supabase，环境里表没准备好或数据为空时容易造成构建期副作用。
export const dynamic = "force-dynamic";

import { getDisplayMode } from "@/features/module-display-mode/service";
import { PlaylistsPageView } from "@/features/playlists/PlaylistsPage";
import { getPlaylistPageData } from "@/features/playlists/service";

export default async function PlaylistsPage() {
  if ((await getDisplayMode("playlists")) === "demo") {
    return (
      <section className="space-y-3">
        <h1>歌单-演示模式</h1>
        <p>这是歌单模块的基础演示内容。</p>
      </section>
    );
  }

  return <PlaylistsPageView {...(await getPlaylistPageData())} />;
}
