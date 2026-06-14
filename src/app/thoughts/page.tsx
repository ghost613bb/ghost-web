import { ThoughtsPageView } from "@/features/thoughts/ThoughtsPage";
import { getThoughtPageData } from "@/features/thoughts/service";

export default async function ThoughtsPage() {
  const data = await getThoughtPageData();

  return <ThoughtsPageView dataSource={data.dataSource} initialThoughts={data.thoughts} />;
}
