import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { houseAssets } from "./houseAssets";

describe("houseAssets", () => {
  it("registers the study notes and album house models with public GLTF paths", () => {
    expect(houseAssets.lowPolyPizzaRestaurant).toEqual({
      path: "/models/low_poly_pizza_restaurant/scene.gltf",
      scale: 0.35,
      position: [0.2, 0.03, 0],
      rotation: [0, 0, 0],
    });
    expect(houseAssets.lowPolyHouse2).toEqual({
      path: "/models/low_poly_house_2/scene.gltf",
      scale: 0.5,
      position: [0.1, 0, -0.8],
      rotation: [0, -Math.PI / 2, 0],
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

  it("registers the generic shop model for mood diary", () => {
    expect(houseAssets.lowPolyBuilding).toEqual({
      path: "/models/low_poly_generic_shop/scene.gltf",
      scale: 0.44,
      position: [0.27, 0, -0.9],
      rotation: [0, 0, 0],
    });
  });

  it("registers the isometric mall model for the project workshop", () => {
    expect(houseAssets.isometricMall).toEqual({
      path: "/models/isometric_mall/scene.gltf",
      scale: 0.012,
      position: [0, 0.066, -0.3],
      rotation: [0, 0, 0],
    });
  });

  it("registers the apartment building model for the playlist lot", () => {
    expect(houseAssets.lowPolyApartmentBuilding3).toEqual({
      path: "/models/low_poly_apartment_building_3/scene.gltf",
      scale: 0.25,
      position: [0, 0.04, 0],
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

  it("keeps the generic shop model files available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_generic_shop/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_generic_shop/scene.bin"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_generic_shop/textures/Texture_buildings1_baseColor.png"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_generic_shop/license.txt"), "utf8")).not.toThrow();
  });

  it("keeps the isometric cinema model files available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/isometric_cinema/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/isometric_cinema/scene.bin"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/isometric_cinema/textures/rig_initialShadingGroup1_baseColor.png"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/isometric_cinema/license.txt"), "utf8")).not.toThrow();
  });

  it("keeps the isometric mall model files available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/isometric_mall/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/isometric_mall/scene.bin"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/isometric_mall/textures/Scene_-_Root_baseColor.png"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/isometric_mall/license.txt"), "utf8")).not.toThrow();
  });

  it("keeps the apartment building model files available from public assets", () => {
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_apartment_building_3/scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_apartment_building_3/scene.bin"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_apartment_building_3/textures/Pack3_baseColor.png"))).not.toThrow();
    expect(() => readFileSync(path.join(process.cwd(), "public/models/low_poly_apartment_building_3/license.txt"), "utf8")).not.toThrow();
  });
});
