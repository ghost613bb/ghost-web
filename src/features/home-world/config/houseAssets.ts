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
  coffeeShopIsometric: {
    path: "/models/coffee_shop_isometric/scene.gltf",
    scale: 0.28,
    position: [0, 0.06, 0],
    rotation: [0, 0, 0],
  },
  isometricCinema: {
    path: "/models/isometric_cinema/scene.gltf",
    scale: 0.13,
    position: [0, 0.06, 0],
    rotation: [0, 0, 0],
  },
} as const satisfies Record<string, HouseAssetConfig>;

export type HouseAssetKey = keyof typeof houseAssets;
