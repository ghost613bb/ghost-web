import { notFound } from "next/navigation";
import { getDisplayMode } from "@/features/module-display-mode/service";
import { ThoughtDetailPageView } from "@/features/thoughts/ThoughtDetailPage";
import { getThoughtBySlug } from "@/features/thoughts/service";

type ThoughtDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ThoughtDetailPage({ params }: ThoughtDetailPageProps) {
  if ((await getDisplayMode("thoughts")) === "demo") {
    return (
      <section className="space-y-3">
        <h1>碎碎念（试玩模式）</h1>
        <p>这是碎碎念模块的试玩版页面。</p>
        <p>你可以先体验基础编辑交互，但这里不会展示我的真实内容。</p>
      </section>
    );
  }

  const { slug } = await params;
  const thought = await getThoughtBySlug(slug);

  if (!thought) {
    notFound();
  }

  return <ThoughtDetailPageView thought={thought} />;
}
