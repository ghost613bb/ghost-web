import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { HomeModule } from "@/features/home-world/types";
import { HouseVisual } from "./HouseVisual";

const { cloneMock, scene } = vi.hoisted(() => {
  const mockedScene = {
    removedNodes: [] as string[],
    traverse: (callback: (object: { name: string; parent?: { remove: (object: { name: string }) => void } }) => void) => {
      const removableParent = {
        remove: (object: { name: string }) => {
          mockedScene.removedNodes.push(object.name);
        },
      };
      const blueFloor = {
        name: "Object_121",
        parent: removableParent,
      };
      const colliderGroup = {
        name: "Collider",
        parent: removableParent,
      };
      const colliderMesh = {
        name: "Collider_Collider_0",
        parent: removableParent,
      };
      callback(blueFloor);
      callback(colliderGroup);
      callback(colliderMesh);
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
  id: "playlists",
  title: "咖啡推荐",
  route: "/coffee",
  intro: "留给喜欢的咖啡店、豆子和风味笔记。",
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

  it("removes collider helper nodes from imported models", () => {
    render(<HouseVisual module={moduleWithCoffeeShopAsset} active={false} emissiveIntensity={0.25} />);

    expect(cloneMock).toHaveBeenCalled();
    expect(cloneMock.mock.calls.at(-1)?.[0].object.removedNodes).toEqual(
      expect.arrayContaining(["Collider", "Collider_Collider_0"]),
    );
  });
});
