export type HouseAssetConfig = {
  path: string;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
};

export const houseAssets = {
  lowPolyPizzaRestaurant: {
    // 学习笔记模型
    path: "/models/low_poly_pizza_restaurant/scene.gltf",
    scale: 0.5,
    position: [-1.1, 0.03, 0.7],
    rotation: [0, Math.PI / 2, 0],
  },
  lowPolyHouse2: {
    // 个人相册模型
    path: "/models/low_poly_house_2/scene.gltf",
    scale: 0.5,
    position: [-1, 0, -0.45],
    rotation: [0, 0, 0],
  },
  houseBuildingLowPoly: {
    // 碎碎念模型
    path: "/models/low_poly_cinema/scene.gltf",
    scale: 0.45,
    position: [-0.2, 0, -0.3],
    rotation: [0, 0, 0],
  },
  lowPolyBurgerRestaurant: {
    // 歌单模型
    path: "/models/low_poly_generic_shop/scene.gltf",
    scale: 0.5,
    position: [1.7, 0, -1.7],
    rotation: [0, 0, 0],
  },
  coffeeShopIsometric: {
    // 咖啡推荐模型
    path: "/models/coffee_recommend_low_poly_cafe/scene.gltf",
    scale: 0.45,
    position: [-3.6, 0, -0.6],
    rotation: [0, Math.PI / 4, 0],
  },
  isometricCinema: {
    // 碎碎念模型
    path: "/models/isometric_cinema/scene.gltf",
    scale: 0.25,
    position: [0, 0.06, 0],
    rotation: [0, 0, 0],
  },
  lowPolyHouse3: {
    // 人生todolist模型
    path: "/models/low_poly_house_3/scene.gltf",
    scale: 0.45,
    position: [0.8, 0.02, -0.5],
    rotation: [0, -Math.PI, 0],
  },
  lowPolyBuilding: {
    // 心情日记模型
    path: "/models/low_poly_burger_restaurant/scene.gltf",
    scale: 0.37,
    position: [2.4, 0.04, -1.3],
    rotation: [0, 0, 0],
  },
} as const satisfies Record<string, HouseAssetConfig>;

export type HouseAssetKey = keyof typeof houseAssets;
