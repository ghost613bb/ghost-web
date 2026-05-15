import { albumPhotos } from "@/data/album";
import { ContentCard } from "@/features/content-modules/components/ContentCard";
import { ModulePageShell } from "@/features/content-modules/components/ModulePageShell";

export default function AlbumPage() {
  return (
    <ModulePageShell eyebrow="Album" title="相册" description="把一些有意义的照片和当时的心情放在一起。">
      <section className="grid gap-5 md:grid-cols-2">
        {albumPhotos.map((photo) => (
          <ContentCard key={photo.id} title={photo.title} description={photo.description} meta={photo.location} tags={photo.tags}>
            <div className={`mb-4 h-44 rounded-3xl bg-gradient-to-br ${photo.color}`} />
            <p>{photo.story}</p>
          </ContentCard>
        ))}
      </section>
    </ModulePageShell>
  );
}
