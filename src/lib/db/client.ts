// 数据库连接入口

//   作用：
//   - 读取 env.ts 里的数据库地址
//   - 用 better-sqlite3 打开 SQLite 文件
//   - 再交给 Drizzle 包一层，得到 db
  
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "@/lib/env";

const sqlite = new Database(env.DATABASE_URL);

export const db = drizzle(sqlite);
