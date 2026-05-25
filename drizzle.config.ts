// Drizzle 的配置文件。
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/lib/db/schema.ts",//schema 定义在哪
  out: "./drizzle",//迁移文件输出到哪
  dialect: "sqlite",
  dbCredentials: {//数据库地址从哪来
    url: process.env.DATABASE_URL ?? "./.local/ghost.db",
  },
});
