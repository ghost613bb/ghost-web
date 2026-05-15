import { playlistSongs } from "@/data/playlists";
import { ContentCard } from "@/features/content-modules/components/ContentCard";
import { ModulePageShell } from "@/features/content-modules/components/ModulePageShell";

export default function PlaylistsPage() {
  return (
    <ModulePageShell eyebrow="Playlists" title="歌单" description="这里记录一些循环播放过的歌，以及听它们时的感受。">
      <section className="grid gap-5 md:grid-cols-2">
        {playlistSongs.map((song) => (
          <ContentCard key={song.id} title={song.title} description={song.description} meta={song.artist} tags={song.tags}>
            <p>{song.feeling}</p>
          </ContentCard>
        ))}
      </section>
    </ModulePageShell>
  );
}
