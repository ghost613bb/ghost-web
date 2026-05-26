import { getDisplayMode } from "@/features/module-display-mode/service";
import { getLatestThought } from "@/features/thoughts/service";

export default async function ThoughtsPage() {
  if ((await getDisplayMode("thoughts")) === "demo") {
    return (
      <section className="space-y-3">
        <h1>碎碎念（试玩模式）</h1>
        <p>这是碎碎念模块的试玩版页面。</p>
        <p>你可以先体验基础编辑交互，但这里不会展示我的真实内容。</p>
      </section>
    );
  }

  const latestThought = await getLatestThought();

  return (
    <section className="space-y-3">
      <h1>碎碎念</h1>
      {latestThought ? (
        <article className="space-y-2">
          <h2 className="text-xl font-medium">{latestThought.title}</h2>
          {latestThought.description ? <p>{latestThought.description}</p> : null}
          <p>{latestThought.body}</p>
        </article>
      ) : null}
    </section>
  );
}
