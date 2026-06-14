import { notFound } from "next/navigation";
import { ThoughtRichTextDraftPage } from "@/features/thoughts/ThoughtRichTextDraftPage";
import { getThoughtBySlug } from "@/features/thoughts/service";

type ThoughtDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ThoughtDetailPage({ params }: ThoughtDetailPageProps) {
  const { slug } = await params;
  const thought = await getThoughtBySlug(slug);

  if (!thought) {
    notFound();
  }

  return <ThoughtRichTextDraftPage thought={thought} />;
}
