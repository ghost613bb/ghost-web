import { describe, expect, it } from "vitest";
import { homeModules } from "./homeModules";

describe("homeModules", () => {
  it("contains the seven home modules in sorted order", () => {
    expect(homeModules.map((module) => module.id)).toEqual([
      "about",
      "thoughts",
      "museum",
      "album",
      "playlists",
      "todo",
      "message",
    ]);
  });

  it("uses unique ids", () => {
    expect(new Set(homeModules.map((module) => module.id)).size).toBe(
      homeModules.length,
    );
  });

  it("keeps home modules publicly navigable", () => {
    expect(homeModules.every((module) => module.visibility === "public")).toBe(
      true,
    );
  });

  it("renders the requested tab titles in homepage order", () => {
    expect(homeModules.map((module) => module.title)).toEqual([
      "个人相册",
      "碎碎念",
      "歌单",
      "心情日记",
      "咖啡推荐",
      "人生todolist",
      "学习笔记",
    ]);
  });

  it("maps each homepage tab to its updated destination and uses the low poly building model for mood diary", () => {
    expect(homeModules.map((module) => module.placeholderStyle)).toEqual([
      "cottage",
      "library",
      "cottage",
      "greenhouse",
      "workshop",
      "tower",
      "mail",
    ]);

    expect(homeModules.find((module) => module.id === "about")).toMatchObject({
      title: "个人相册",
      route: "/album",
      assetKey: "lowPolyHouse2",
    });
    expect(homeModules.find((module) => module.id === "thoughts")).toMatchObject({
      title: "碎碎念",
      route: "/thoughts",
      assetKey: "houseBuildingLowPoly",
    });
    expect(homeModules.find((module) => module.id === "museum")).toMatchObject({
      title: "歌单",
      route: "/playlists",
      assetKey: "lowPolyApartmentBuilding3",
    });
    expect(homeModules.find((module) => module.id === "album")).toMatchObject({
      title: "心情日记",
      route: "/about",
      assetKey: "lowPolyBuilding",
    });
    expect(homeModules.find((module) => module.id === "playlists")).toMatchObject({
      title: "咖啡推荐",
      route: "/coffee",
      assetKey: "coffeeShopIsometric",
    });
    expect(homeModules.find((module) => module.id === "todo")).toMatchObject({
      title: "人生todolist",
      route: "/todo",
      assetKey: "isometricMall",
    });
    expect(homeModules.find((module) => module.id === "message")).toMatchObject({
      title: "学习笔记",
      route: "/message",
      assetKey: "lowPolyPizzaRestaurant",
    });
    expect(homeModules.filter((module) => module.assetKey === "coffeeShopIsometric")).toHaveLength(1);
  });

  it("uses the manually tuned wide isometric town layout", () => {
    expect(homeModules.map((module) => module.position)).toEqual([
      [-2.5, 0, 0.4],
      [-1.3, 0, -1.2],
      [0, 0, -1.95],
      [1.3, 0, -0.9],
      [2.75, 0, -0.05],
      [1.35, 0, 1.55],
      [-1.35, 0, 1.55],
    ]);
  });
});
