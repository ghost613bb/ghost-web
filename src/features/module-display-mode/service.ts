// 专职DisplayModes业务逻辑
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { displayModes as displayModesTable } from "@/lib/db/schema";
import {
  createDefaultDisplayModes,
  type DisplayMode,
  type DisplayModes,
  type ModuleId,
} from "./configurableModules";

function mergeStoredModes(rows: Array<{ moduleId: string; displayMode: string }>): DisplayModes {
  const modes = createDefaultDisplayModes();

  for (const row of rows) {
    if (row.moduleId in modes && (row.displayMode === "real" || row.displayMode === "demo")) {
      modes[row.moduleId as ModuleId] = row.displayMode;
    }
  }

  return modes;
}

// 获取
export async function getDisplayModes(): Promise<DisplayModes> {
  const rows = await db.select().from(displayModesTable);
  return mergeStoredModes(rows);
}
// 更新
export async function updateDisplayMode(moduleId: ModuleId, displayMode: DisplayMode) {
  await db
    .insert(displayModesTable)
    .values({ moduleId, displayMode })
    .onConflictDoUpdate({
      target: displayModesTable.moduleId,
      set: { displayMode },
    });
}
// 重置
export async function resetDisplayModes() {
  await db.delete(displayModesTable).where(eq(displayModesTable.moduleId, displayModesTable.moduleId));
}
