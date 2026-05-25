export const configurableModules = [
  { id: "about", title: "心情日记", route: "/about" },
  { id: "album", title: "个人相册", route: "/album" },
  { id: "coffee", title: "咖啡推荐", route: "/coffee" },
  { id: "message", title: "学习笔记", route: "/message" },
  { id: "playlists", title: "歌单", route: "/playlists" },
  { id: "thoughts", title: "碎碎念", route: "/thoughts" },
  { id: "todo", title: "人生todolist", route: "/todo" },
] as const;

export type ModuleId = (typeof configurableModules)[number]["id"];
export type DisplayMode = "real" | "demo";
export type DisplayModes = Record<ModuleId, DisplayMode>;

export const moduleIds: ModuleId[] = configurableModules.map((module) => module.id);

// 先对所有模块设置默认的 display mode 为 real
// [
//   ["about", "real"],
//   ["album", "real"],
//   ["coffee", "real"],
//   ...
// ]
// fromEntries API 会把这种“键值对数组”变成对象
// {
//   about: "real",
//   album: "real",
//   coffee: "real",
//   ...
// }
export function createDefaultDisplayModes(): DisplayModes {
  return Object.fromEntries(moduleIds.map((moduleId) => [moduleId, "real"])) as DisplayModes;
}
