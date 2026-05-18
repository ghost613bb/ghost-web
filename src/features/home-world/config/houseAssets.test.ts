import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { houseAssets } from "./houseAssets";

describe("houseAssets", () => {
  it("registers the restaurant and cafe models with public GLTF paths", () => {
    expect(houseAssets.fastFoodRestaurant).toEqual({
      path: "/models/fast_food_restaurant/scene.gltf",
      scale: 0.0115,
      position: [0, 0.1, 0],
      rotation: [0, 0, 0],
    });
    expect(houseAssets.lowPolyCafe).toEqual({
      path: "/models/low_poly_cafe/scene.gltf",
      scale: 0.0028,
      position: [0, 0.02, 0],
      rotation: [0, 0, 0],
    });
  });

  it("registers the coffee shop and cinema isometric models near the fast food restaurant visual size", () => {
    expect(houseAssets.coffeeShopIsometric).toEqual({
      path: "/models/coffee_shop_isometric/scene.gltf",
      scale: 0.28,
      position: [0, 0.06, 0],
      rotation: [0, 0, 0],
    });
    expect(houseAssets.isometricCinema).toEqual({
      path: "/models/isometric_cinema/scene.gltf",
      scale: 0.035,
      position: [0, 0.06, 0],
      rotation: [0, 0, 0],
    });
  });

  it("keeps the fast food restaurant model files available from public assets", () => {
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/fast_food_restaurant/scene.gltf",
        ),
        "utf8",
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/fast_food_restaurant/scene.bin",
        ),
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/fast_food_restaurant/textures/FastFood_RestaurantSG_baseColor.png",
        ),
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/fast_food_restaurant/license.txt",
        ),
        "utf8",
      ),
    ).not.toThrow();
  });

  it("keeps the low poly cafe model files available from public assets", () => {
    expect(() =>
      readFileSync(
        path.join(process.cwd(), "public/models/low_poly_cafe/scene.gltf"),
        "utf8",
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(process.cwd(), "public/models/low_poly_cafe/scene.bin"),
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/low_poly_cafe/textures/Cafe_baseColor.jpeg",
        ),
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(process.cwd(), "public/models/low_poly_cafe/license.txt"),
        "utf8",
      ),
    ).not.toThrow();
  });

  it("keeps the coffee shop isometric model files available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/coffee_shop_isometric/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/coffee_shop_isometric/scene.bin"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/coffee_shop_isometric/license.txt"), "utf8")).not.toThrow();
  });

  it("keeps the isometric cinema model files available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/isometric_cinema/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/isometric_cinema/scene.bin"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/isometric_cinema/textures/rig_initialShadingGroup1_baseColor.png"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/isometric_cinema/license.txt"), "utf8")).not.toThrow();
  });
});
