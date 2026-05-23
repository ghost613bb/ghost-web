export type HouseAssetConfig = {
  path: string;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
};

export const houseAssets = {
  fastFoodRestaurant: {
    path: "/models/fast_food_restaurant/scene.gltf",
    scale: 0.0115,
    position: [0, 0.1, 0],
    rotation: [0, 0, 0],
  },
  lowPolyCafe: {
    path: "/models/low_poly_cafe/scene.gltf",
    scale: 0.0028,
    position: [0, 0.02, 0],
    rotation: [0, 0, 0],
  },
  houseBuildingLowPoly: {
    path: "/models/house_building_low_poly/scene.gltf",
    scale: 0.14,
    position: [0, 0.04, 0],
    rotation: [0, 0, 0],
  },
  coffeeShopIsometric: {
    path: "/models/coffee_shop_isometric/scene.gltf",
    scale: 0.28,
    position: [0, 0.015, 0],
    rotation: [0, 0, 0],
  },
  isometricCinema: {
    path: "/models/isometric_cinema/scene.gltf",
    scale: 0.25,
    position: [0, 0.06, 0],
    rotation: [0, 0, 0],
  },
  isometricMall: {
    path: "/models/isometric_mall/scene.gltf",
    scale: 0.012,
    position: [0, 0.066, 0],
    rotation: [0, 0, 0],
  },
  lowPolyMedievalHouse: {
    path: "/models/low_poly_medieval_house_1/scene.gltf",
    scale: 0.25,
    position: [0, 0.04, 0],
    rotation: [0, 0, 0],
  },
} as const satisfies Record<string, HouseAssetConfig>;

export type HouseAssetKey = keyof typeof houseAssets;
