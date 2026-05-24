export type HouseAssetConfig = {
  path: string;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
};

export const houseAssets = {
  fastFoodRestaurant: {
    // 学习笔记模型
    path: "/models/fast_food_restaurant/scene.gltf",
    scale: 0.012,
    position: [0, 0.03, 0],
    rotation: [0, 0, 0],
  },
  lowPolyCafe: {
    // 个人相册模型
    path: "/models/low_poly_cafe/scene.gltf",
    scale: 0.0036,
    position: [0, 0, -0.3],
    rotation: [0, 0, 0],
  },
  houseBuildingLowPoly: {
    // 碎碎念模型
    path: "/models/house_building_low_poly/scene.gltf",
    scale: 0.18,
    position: [0, 0, -0.5],
    rotation: [0, 0, 0],
  },
  lowPolyBuilding: {
    // 心情日记模型
    path: "/models/low_poly_generic_shop/scene.gltf",
    scale: 0.44,
    // x是左右，y是上下，z是前后（以左上至右下为正方向）
    position: [0.27, 0, -0.9],
    rotation: [0, 0, 0],
  },
  coffeeShopIsometric: {
    // 咖啡推荐模型
    path: "/models/coffee_shop_isometric/scene.gltf",
    scale: 0.3,
    position: [0.19, 0.015, -0.3],
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
    position: [0, 0.066, -0.3],
    rotation: [0, 0, 0],
  },
  lowPolyApartmentBuilding3: {
    // 歌单模型
    path: "/models/low_poly_apartment_building_3/scene.gltf",
    scale: 0.25,
    position: [0, 0.04, 0],
    rotation: [0, 0, 0],
  },
} as const satisfies Record<string, HouseAssetConfig>;

export type HouseAssetKey = keyof typeof houseAssets;
