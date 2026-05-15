import { lifeTodos } from "@/data/todo";
import { ContentCard } from "@/features/content-modules/components/ContentCard";
import { ModulePageShell } from "@/features/content-modules/components/ModulePageShell";

export default function TodoPage() {
  const planned = lifeTodos.filter((item) => item.state === "planned");
  const completed = lifeTodos.filter((item) => item.state === "completed");

  return (
    <ModulePageShell eyebrow="Life Todo" title="人生 Todo" description="一些想做的事，以及未来会慢慢点亮的小里程碑。">
      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-bold">想做</h2>
          <div className="grid gap-4">
            {planned.map((item) => (
              <ContentCard key={item.id} title={item.title} description={item.description} meta={item.category} tags={item.tags} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-bold">已完成</h2>
          <div className="grid gap-4">
            {completed.length > 0 ? (
              completed.map((item) => (
                <ContentCard key={item.id} title={item.title} description={item.description} meta={item.completedAt ?? item.category} tags={item.tags}>
                  {item.reflection ? <p>{item.reflection}</p> : null}
                </ContentCard>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/15 p-6 text-white/60">这里会放已经完成的人生清单。</div>
            )}
          </div>
        </div>
      </section>
    </ModulePageShell>
  );
}
