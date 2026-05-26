// 专职：数据库读写操作
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { displayModes as displayModesTable } from "@/lib/db/schema";
import type { DisplayMode, ModuleId } from "./configurableModules";

export async function listStoredDisplayModes() {
  return db.select().from(displayModesTable);
}

export async function upsertStoredDisplayMode(moduleId: ModuleId, displayMode: DisplayMode) {
  await db
    .insert(displayModesTable)
    .values({ moduleId, displayMode })
    .onConflictDoUpdate({
      target: displayModesTable.moduleId,
      set: { displayMode },
    });
}

export async function resetStoredDisplayModes() {
  await db.delete(displayModesTable).where(eq(displayModesTable.moduleId, displayModesTable.moduleId));
}
