import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { HomeModule } from "@/features/home-world/types";
import { HouseNode } from "./HouseNode";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@react-three/drei", () => ({
  Html: ({ children }: { children: ReactNode }) => <div data-testid="house-node-html">{children}</div>,
}));

vi.mock("./HouseVisual", () => ({
  HouseVisual: () => <div data-testid="house-visual" />,
}));

const moduleWithOffsetAsset = {
  id: "about",
  title: "个人相册",
  route: "/album",
  intro: "收集照片、片段和当下想留住的画面。",
  position: [-2.5, 0, 0.4],
  color: "#f6b26b",
  accentColor: "#ffe2b7",
  houseStyle: "cottage",
  placeholderStyle: "cottage",
  assetKey: "lowPolyHouse2",
  visibility: "public",
  sortOrder: 1,
} satisfies HomeModule;

const moduleWithRaisedAsset = {
  id: "album",
  title: "心情日记",
  route: "/about",
  intro: "记录一些不想被快速略过的情绪起伏。",
  position: [1.3, 0, -0.9],
  color: "#8fd6c8",
  accentColor: "#d8fff6",
  houseStyle: "gallery",
  placeholderStyle: "greenhouse",
  assetKey: "lowPolyBuilding",
  visibility: "public",
  sortOrder: 4,
} satisfies HomeModule;

describe("HouseNode", () => {
  it("positions the hover ring under the tuned model xz offset", () => {
    const { container } = render(<HouseNode module={moduleWithOffsetAsset} active={false} onActiveChange={vi.fn()} />);

    expect(container.querySelector("mesh")?.getAttribute("position")).toBe("-0.12,0.02,-1.05");
  });

  it("keeps the hover ring on the ground when the model has a local y offset", () => {
    const { container } = render(<HouseNode module={moduleWithRaisedAsset} active={false} onActiveChange={vi.fn()} />);

    expect(container.querySelector("mesh")?.getAttribute("position")).toBe("-0.5,0.02,-0.7");
  });
});
