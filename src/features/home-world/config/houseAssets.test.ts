import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { houseAssets } from "./houseAssets";

describe("houseAssets", () => {
  it("registers the restaurant and cafe models with public GLTF paths", () => {
    expect(houseAssets.fastFoodRestaurant).toEqual({
      path: "/models/fast_food_restaurant/scene.gltf",
      scale: 0.012,
      position: [0, 0.03, 0],
      rotation: [0, 0, 0],
    });
    expect(houseAssets.lowPolyCafe).toEqual({
      path: "/models/low_poly_cafe/scene.gltf",
      scale: 0.0036,
      position: [0, 0, -0.3],
      rotation: [0, 0, 0],
    });
  });

  it("registers the coffee shop and cinema isometric models near the fast food restaurant visual size", () => {
    expect(houseAssets.coffeeShopIsometric).toEqual({
      path: "/models/coffee_shop_isometric/scene.gltf",
      scale: 0.3,
      position: [0.19, 0.015, -0.3],
      rotation: [0, 0, 0],
    });
    expect(houseAssets.isometricCinema).toEqual({
      path: "/models/isometric_cinema/scene.gltf",
      scale: 0.25,
      position: [0, 0.06, 0],
      rotation: [0, 0, 0],
    });
  });

  it("registers the blog library house building model", () => {
    expect(houseAssets.houseBuildingLowPoly).toEqual({
      path: "/models/house_building_low_poly/scene.gltf",
      scale: 0.18,
      position: [0, 0, -0.5],
      rotation: [0, 0, 0],
    });
  });

  it("registers the low poly building model for mood diary", () => {
    expect(houseAssets.lowPolyBuilding).toEqual({
      path: "/models/low_poly_building/scene.gltf",
      scale: 0.29,
      position: [1.2, 0, -0.4],
      rotation: [0, -Math.PI / 2, 0],
    });
  });

  it("registers the low poly house model for life todo list", () => {
    expect(houseAssets.lowPolyHouse3).toEqual({
      path: "/models/low_poly_house_3/scene.gltf",
      scale: 0.24,
      position: [0, 0.02, -0.02],
      rotation: [0, -Math.PI / 4, 0],
    });
  });

  it("registers the medieval house model large enough for the right-side empty lot", () => {
    expect(houseAssets.lowPolyMedievalHouse).toEqual({
      path: "/models/low_poly_medieval_house_1/scene.gltf",
      scale: 0.25,
      position: [0, 0.04, 0],
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

  it("removes the blog library house building source base plane from the model asset", () => {
    const scene = JSON.parse(
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/house_building_low_poly/scene.gltf",
        ),
        "utf8",
      ),
    );

    expect(scene.nodes.map((node: { name?: string }) => node.name)).not.toContain(
      "Plane_2",
    );
    expect(scene.nodes.map((node: { name?: string }) => node.name)).not.toContain(
      "Object_13",
    );
    expect(scene.meshes.map((mesh: { name?: string }) => mesh.name)).not.toContain(
      "Object_7",
    );
    expect(
      scene.materials.map(
        (material: { pbrMetallicRoughness?: { baseColorFactor?: number[] } }) =>
          material.pbrMetallicRoughness?.baseColorFactor,
      ),
    ).not.toContainEqual([0.33108273651581677, 1, 0.9460033963762664, 1]);
  });

  it("keeps the blog library house building model files available from public assets", () => {
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/house_building_low_poly/scene.gltf",
        ),
        "utf8",
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/house_building_low_poly/scene.bin",
        ),
      ),
    ).not.toThrow();
    expect(() =>
      readFileSync(
        path.join(
          process.cwd(),
          "public/models/house_building_low_poly/license.txt",
        ),
        "utf8",
      ),
    ).not.toThrow();
  });

  it("keeps the low poly building model files available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_building/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_building/scene.bin"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_building/textures/Material_baseColor.png"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_building/license.txt"), "utf8")).not.toThrow();
  });

  it("keeps the isometric cinema model files available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/isometric_cinema/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/isometric_cinema/scene.bin"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/isometric_cinema/textures/rig_initialShadingGroup1_baseColor.png"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/isometric_cinema/license.txt"), "utf8")).not.toThrow();
  });

  it("keeps the low poly house model files available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_house_3/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_house_3/scene.bin"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_house_3/textures/Pack3_baseColor.png"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_house_3/license.txt"), "utf8")).not.toThrow();
  });

  it("keeps the low poly medieval house model files available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_medieval_house_1/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_medieval_house_1/scene.bin"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_medieval_house_1/textures/Medieval_baseColor.png"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_medieval_house_1/license.txt"), "utf8")).not.toThrow();
  });
});
