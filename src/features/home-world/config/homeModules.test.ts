import { describe, expect, it } from "vitest";
import { homeModules } from "./homeModules";

describe("homeModules", () => {
  it("contains the seven first-version modules in sorted order", () => {
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

  it("keeps first-version home modules publicly navigable", () => {
    expect(homeModules.every((module) => module.visibility === "public")).toBe(
      true,
    );
  });

  it("uses real models for the about cafe, thoughts house, medieval house, skills greenhouse, project workshop mall, todo coffee shop, and message fast food restaurant", () => {
    expect(homeModules.map((module) => module.placeholderStyle)).toEqual([
      "cottage",
      "library",
      "cottage",
      "greenhouse",
      "workshop",
      "tower",
      "mail",
    ]);
    expect(homeModules.map((module) => module.assetKey)).toEqual([
      "lowPolyCafe",
      "houseBuildingLowPoly",
      "lowPolyMedievalHouse",
      "isometricCinema",
      "isometricMall",
      "coffeeShopIsometric",
      "fastFoodRestaurant",
    ]);
    expect(homeModules.find((module) => module.id === "about")).toMatchObject({
      title: "关于我小屋",
      route: "/about",
      assetKey: "lowPolyCafe",
    });
    expect(homeModules.find((module) => module.id === "thoughts")).toMatchObject({
      title: "博客图书馆",
      route: "/thoughts",
      assetKey: "houseBuildingLowPoly",
    });
    expect(homeModules.find((module) => module.id === "museum")).toMatchObject({
      title: "博物小馆",
      route: "/about",
      assetKey: "lowPolyMedievalHouse",
    });
    expect(homeModules.find((module) => module.id === "album")).toMatchObject({
      title: "技能温室",
      route: "/album",
      assetKey: "isometricCinema",
    });
    expect(homeModules.find((module) => module.id === "playlists")).toMatchObject({
      title: "项目工坊",
      route: "/playlists",
      assetKey: "isometricMall",
    });
    expect(homeModules.find((module) => module.id === "todo")).toMatchObject({
      title: "经历塔楼",
      route: "/todo",
      assetKey: "coffeeShopIsometric",
    });
    expect(homeModules.find((module) => module.id === "message")).toMatchObject(
      {
        title: "联系邮局",
        route: "/message",
        assetKey: "fastFoodRestaurant",
      },
    );
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
