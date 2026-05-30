import { getDisplayMode } from "@/features/module-display-mode/service";
import { ThoughtsPageView } from "@/features/thoughts/ThoughtsPage";
import { listThoughts } from "@/features/thoughts/service";

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

  return <ThoughtsPageView initialThoughts={await listThoughts()} />;
}
