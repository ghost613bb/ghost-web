import { ContentTabsHeader } from "@/features/content-modules/components/ContentTabsHeader";

export function HomeOverlay() {
  return (
    <div className="relative z-10">
      <ContentTabsHeader activeTab="home" title="Ghostspace" />
    </div>
  );
}
