import type { Visibility } from "@/features/content-modules/types";

export type HouseStyle = "cottage" | "tower" | "gallery" | "music" | "mailbox";

export type PlaceholderStyle = "cottage" | "workshop" | "library" | "greenhouse" | "tower" | "mail";

export type HomeModule = {
  id: string;
  title: string;
  route: string;
  intro: string;
  position: [number, number, number];
  color: string;
  accentColor: string;
  houseStyle: HouseStyle;
  placeholderStyle: PlaceholderStyle;
  assetKey?: string;
  visibility: Visibility;
  sortOrder: number;
};
