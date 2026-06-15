import { ThoughtsPageView } from "@/features/thoughts/ThoughtsPage";
import { getThoughtPageData } from "@/features/thoughts/service";

export const dynamic = "force-dynamic";

export default async function ThoughtsPage() {
  const data = await getThoughtPageData();

  return <ThoughtsPageView dataSource={data.dataSource} initialThoughts={data.thoughts} statusReason={data.statusReason} />;
}
