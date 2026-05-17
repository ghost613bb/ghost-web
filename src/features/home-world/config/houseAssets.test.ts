import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { houseAssets } from "./houseAssets";

describe("houseAssets", () => {
  it("registers the fast food restaurant model with a public GLTF path", () => {
    expect(houseAssets.fastFoodRestaurant).toEqual({
      path: "/models/fast_food_restaurant/scene.gltf",
      scale: 0.0115,
      position: [0, 0.1, 0],
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
});
