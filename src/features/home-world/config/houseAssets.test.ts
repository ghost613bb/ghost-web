import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { houseAssets } from "./houseAssets";

describe("houseAssets", () => {
  it("registers the study notes and album house models with the latest tuned placement", () => {
    expect(houseAssets.lowPolyPizzaRestaurant).toEqual({
      path: "/models/low_poly_pizza_restaurant/scene.gltf",
      scale: 0.5,
      position: [-1.1, 0.03, 0.7],
      rotation: [0, Math.PI / 2, 0],
    });
    expect(houseAssets.lowPolyHouse2).toEqual({
      path: "/models/low_poly_house_2/scene.gltf",
      scale: 0.5,
      position: [-1, 0, -0.45],
      rotation: [0, 0, 0],
    });
  });

  it("registers the coffee recommendation model with the tuned low poly cafe asset", () => {
    expect(houseAssets.coffeeShopIsometric).toEqual({
      path: "/models/coffee_recommend_low_poly_cafe/scene.gltf",
      scale: 0.45,
      position: [-3.6, 0, -0.6],
      rotation: [0, Math.PI / 4, 0],
    });
  });

  it("registers the thoughts model with the latest tuned low poly cinema placement", () => {
    expect(houseAssets.houseBuildingLowPoly).toEqual({
      path: "/models/low_poly_cinema/scene.gltf",
      scale: 0.45,
      position: [-0.2, 0, -0.3],
      rotation: [0, 0, 0],
    });
  });

  it("registers the mood diary model with the latest tuned burger restaurant placement", () => {
    expect(houseAssets.lowPolyBuilding).toEqual({
      path: "/models/low_poly_burger_restaurant/scene.gltf",
      scale: 0.37,
      position: [2.4, 0.04, -1.3],
      rotation: [0, 0, 0],
    });
  });

  it("registers the low poly house model for life todo list with the latest tuned placement", () => {
    expect(houseAssets.lowPolyHouse3).toEqual({
      path: "/models/low_poly_house_3/scene.gltf",
      scale: 0.45,
      position: [0.8, 0.02, -0.5],
      rotation: [0, -Math.PI, 0],
    });
  });

  it("registers the playlist lot model with the latest tuned generic shop placement", () => {
    expect(houseAssets.lowPolyBurgerRestaurant).toEqual({
      path: "/models/low_poly_generic_shop/scene.gltf",
      scale: 0.5,
      position: [1.7, 0, -1.7],
      rotation: [0, 0, 0],
    });
  });

  it("keeps the study notes pizza restaurant model files available from public assets", () => {
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/low_poly_pizza_restaurant/scene.gltf",
        ),
        "utf8",
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/low_poly_pizza_restaurant/scene.bin",
        ),
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/low_poly_pizza_restaurant/textures/Texture_buildings1_baseColor.png",
        ),
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/low_poly_pizza_restaurant/license.txt",
        ),
        "utf8",
      ),
    ).not.toThrow();
  });

  it("keeps the low poly house 2 model files available from public assets", () => {
    expect(() =>
      readFileSync(
        path.join(process.cwd(), "public/models/low_poly_house_2/scene.gltf"),
        "utf8",
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(process.cwd(), "public/models/low_poly_house_2/scene.bin"),
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/low_poly_house_2/textures/Pack3_baseColor.png",
        ),
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(process.cwd(), "public/models/low_poly_house_2/license.txt"),
        "utf8",
      ),
    ).not.toThrow();
  });

  it("keeps the coffee recommendation low poly cafe model files available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/coffee_recommend_low_poly_cafe/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/coffee_recommend_low_poly_cafe/scene.bin"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/coffee_recommend_low_poly_cafe/textures/Texture_buildings1_baseColor.png"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/coffee_recommend_low_poly_cafe/license.txt"), "utf8")).not.toThrow();
  });

  it("keeps the low poly cinema model files available from public assets", () => {
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/low_poly_cinema/scene.gltf",
        ),
        "utf8",
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/low_poly_cinema/scene.bin",
        ),
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/low_poly_cinema/textures/Texture_buildings1_baseColor.png",
        ),
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/low_poly_cinema/license.txt",
        ),
        "utf8",
      ),
    ).not.toThrow();
  });

  it("keeps the generic shop model files available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_generic_shop/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_generic_shop/scene.bin"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_generic_shop/textures/Texture_buildings1_baseColor.png"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_generic_shop/license.txt"), "utf8")).not.toThrow();
  });

  it("keeps the low poly house model files available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_house_3/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_house_3/scene.bin"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_house_3/textures/Pack3_baseColor.png"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_house_3/license.txt"), "utf8")).not.toThrow();
  });

  it("keeps the burger restaurant model files available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_burger_restaurant/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_burger_restaurant/scene.bin"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_burger_restaurant/textures/Texture_buildings1_baseColor.png"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_burger_restaurant/license.txt"), "utf8")).not.toThrow();
  });
});
