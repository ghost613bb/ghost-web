import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { HomeModule } from "@/features/home-world/types";
import { HouseVisual } from "./HouseVisual";

const { cloneMock, useGLTFMock } = vi.hoisted(() => {
  const mockedScene = {
    removedNodes: [] as string[],
    traverse: (callback: (object: { name: string; parent?: { remove: (object: { name: string }) => void } }) => void) => {
      const removableParent = {
        remove: (object: { name: string }) => {
          mockedScene.removedNodes.push(object.name);
        },
      };
      const modelPart = {
        name: "CafePart",
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
      callback(modelPart);
      callback(colliderGroup);
      callback(colliderMesh);
    },
  };

  const mockedUseGLTF = vi.fn(() => ({ scene: mockedScene }));

  return {
    cloneMock: vi.fn(({ object }) => <div data-removed-nodes={object.removedNodes.join(",")} data-testid="clone" />),
    useGLTFMock: mockedUseGLTF,
  };
});

vi.mock("@react-three/drei", () => ({
  Clone: cloneMock,
  useGLTF: Object.assign(useGLTFMock, { preload: vi.fn() }),
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

const moduleWithMoodDiaryAsset = {
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

describe("HouseVisual", () => {
  it("loads the coffee recommendation visual from the dedicated low poly cafe asset", () => {
    render(<HouseVisual module={moduleWithCoffeeShopAsset} active={false} emissiveIntensity={0.25} />);

    expect(useGLTFMock).toHaveBeenCalledWith("/models/coffee_recommend_low_poly_cafe/scene.gltf");
  });

  it("renders the loaded coffee recommendation scene without removing legacy nodes", () => {
    render(<HouseVisual module={moduleWithCoffeeShopAsset} active={false} emissiveIntensity={0.25} />);

    expect(cloneMock).toHaveBeenCalled();
    expect(cloneMock.mock.calls.at(-1)?.[0].object.removedNodes).not.toContain("CafePart");
  });

  it("removes the mood diary generic shop collider mesh", () => {
    render(<HouseVisual module={moduleWithMoodDiaryAsset} active={false} emissiveIntensity={0.25} />);

    expect(cloneMock).toHaveBeenCalled();
    expect(cloneMock.mock.calls.at(-1)?.[0].object.removedNodes).toContain("Collider");
  });

  it("removes collider helper nodes from imported models", () => {
    render(<HouseVisual module={moduleWithCoffeeShopAsset} active={false} emissiveIntensity={0.25} />);

    expect(cloneMock).toHaveBeenCalled();
    expect(cloneMock.mock.calls.at(-1)?.[0].object.removedNodes).toEqual(
      expect.arrayContaining(["Collider", "Collider_Collider_0"]),
    );
  });
});
