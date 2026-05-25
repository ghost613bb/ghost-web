// 专职DisplayModes业务逻辑
import {
  createDefaultDisplayModes,
  type DisplayMode,
  type DisplayModes,
  type ModuleId,
} from "./configurableModules";

let displayModes: DisplayModes = createDefaultDisplayModes();
// 获取
export function getDisplayModes(): DisplayModes {
  return displayModes;
}
// 更新
export function updateDisplayMode(moduleId: ModuleId, displayMode: DisplayMode) {
  displayModes = {
    ...displayModes,
    [moduleId]: displayMode,
  };
}
// 重置
export function resetDisplayModes() {
  displayModes = createDefaultDisplayModes();
}
