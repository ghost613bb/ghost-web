import type { Visibility } from "@/features/content-modules/types";

export type HouseStyle = "cottage" | "tower" | "gallery" | "music" | "mailbox";

export type HomeModule = {
  id: string;
  title: string;
  route: string;
  intro: string;
  position: [number, number, number];
  color: string;
  accentColor: string;
  houseStyle: HouseStyle;
  visibility: Visibility;
  sortOrder: number;
};
