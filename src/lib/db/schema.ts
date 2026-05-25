// 定义数据库表结构
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const displayModes = sqliteTable("display_modes", {
  moduleId: text("module_id").primaryKey(),
  displayMode: text("display_mode", { enum: ["real", "demo"] }).notNull(),
});
