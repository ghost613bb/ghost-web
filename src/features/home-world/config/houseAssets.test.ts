import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { houseAssets } from "./houseAssets";

describe("houseAssets", () => {
  it("registers the fast food restaurant model with a public GLTF path", () => {
    expect(houseAssets.fastFoodRestaurant).toEqual({
      path: "/models/fast_food_restaurant/scene.gltf",
      scale: 0.013,
      position: [0, 0.1, 0],
      rotation: [0, 0, 0],
    });
  });

  it("registers the coffee shop isometric model near the fast food restaurant visual size", () => {
    expect(houseAssets.coffeeShopIsometric).toEqual({
      path: "/models/coffee_shop_isometric/scene.gltf",
      scale: 0.28,
      position: [0, 0.06, 0],
      rotation: [0, 0, 0],
    });
  });

  it("keeps the fast food restaurant model files available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/fast_food_restaurant/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/fast_food_restaurant/scene.bin"))).not.toThrow();
    expect(() =>
      readFileSync(path.join(process.cwd(), "public/models/fast_food_restaurant/textures/FastFood_RestaurantSG_baseColor.png")),
    ).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/fast_food_restaurant/license.txt"), "utf8")).not.toThrow();
  });

  it("keeps the coffee shop isometric model files available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/coffee_shop_isometric/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/coffee_shop_isometric/scene.bin"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/coffee_shop_isometric/license.txt"), "utf8")).not.toThrow();
  });
});
