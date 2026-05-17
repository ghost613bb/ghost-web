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
} as const satisfies Record<string, HouseAssetConfig>;

export type HouseAssetKey = keyof typeof houseAssets;
