import { ThoughtsPageView } from "@/features/thoughts/ThoughtsPage";
import { listThoughts } from "@/features/thoughts/service";

export default async function ThoughtsPage() {
  return <ThoughtsPageView initialThoughts={await listThoughts()} />;
}
