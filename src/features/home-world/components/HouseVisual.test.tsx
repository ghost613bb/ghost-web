import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { HomeModule } from "@/features/home-world/types";
import { HouseVisual } from "./HouseVisual";

const { cloneMock, scene } = vi.hoisted(() => {
  const mockedScene = {
    removedNodes: [] as string[],
    traverse: (callback: (object: { name: string; parent?: { remove: (object: { name: string }) => void } }) => void) => {
      const blueFloor = {
        name: "Object_121",
        parent: {
          remove: (object: { name: string }) => {
            mockedScene.removedNodes.push(object.name);
          },
        },
      };
      callback(blueFloor);
    },
  };

  return {
    cloneMock: vi.fn(({ object }) => <div data-removed-nodes={object.removedNodes.join(",")} data-testid="clone" />),
    scene: mockedScene,
  };
});

vi.mock("@react-three/drei", () => ({
  Clone: cloneMock,
  useGLTF: Object.assign(() => ({ scene }), { preload: vi.fn() }),
}));

const moduleWithCoffeeShopAsset = {
  id: "todo",
  title: "经历塔楼",
  route: "/todo",
  intro: "一些想做的事，以及已经完成的小小里程碑。",
  position: [1.35, 0, 1.55],
  color: "#c98f5a",
  accentColor: "#ffcf8f",
  houseStyle: "cottage",
  placeholderStyle: "tower",
  assetKey: "coffeeShopIsometric",
  visibility: "public",
  sortOrder: 5,
} satisfies HomeModule;

describe("HouseVisual", () => {
  it("removes the coffee shop model background floor from raycasting", () => {
    render(<HouseVisual module={moduleWithCoffeeShopAsset} active={false} emissiveIntensity={0.25} />);

    expect(cloneMock).toHaveBeenCalled();
    expect(cloneMock.mock.calls.at(-1)?.[0].object.removedNodes).toContain("Object_121");
  });
});
