// 专职DisplayModes业务逻辑
import {
  createDefaultDisplayModes,
  type DisplayMode,
  type DisplayModes,
  type ModuleId,
} from "./configurableModules";
import {
  listStoredDisplayModes,
  resetStoredDisplayModes,
  upsertStoredDisplayMode,
} from "./repository";

function mergeStoredModes(rows: Array<{ moduleId: string; displayMode: string }>): DisplayModes {
  const modes = createDefaultDisplayModes();

  for (const row of rows) {
    if (row.moduleId in modes && (row.displayMode === "real" || row.displayMode === "demo")) {
      modes[row.moduleId as ModuleId] = row.displayMode;
    }
  }

  return modes;
}

// 获取整个模块的显示模式
export async function getDisplayModes(): Promise<DisplayModes> {
  const rows = await listStoredDisplayModes();
  return mergeStoredModes(rows);
}

// 获取单个模块的显示模式
export async function getDisplayMode(moduleId: ModuleId): Promise<DisplayMode> {
  return (await getDisplayModes())[moduleId];
}
// 更新
export async function updateDisplayMode(moduleId: ModuleId, displayMode: DisplayMode) {
  await upsertStoredDisplayMode(moduleId, displayMode);
}
// 重置
export async function resetDisplayModes() {
  await resetStoredDisplayModes();
}
