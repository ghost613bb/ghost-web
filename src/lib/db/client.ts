// 数据库连接入口

//   作用：
//   - 读取 env.ts 里的数据库地址
//   - 用 better-sqlite3 打开 SQLite 文件
//   - 再交给 Drizzle 包一层，得到 db
  
import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "@/lib/env";

function ensureSqliteDirectory(databaseUrl: string) {
  if (databaseUrl === ":memory:" || databaseUrl.startsWith("file:")) {
    return;
  }

  mkdirSync(path.dirname(databaseUrl), { recursive: true });
}

function ensureColumn(tableName: string, columnName: string, columnDefinition: string) {
  const columns = sqlite.prepare(`PRAGMA table_info(${tableName})`).all() as { name: string }[];
  if (!columns.some((column) => column.name === columnName)) {
    sqlite.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
  }
}

ensureSqliteDirectory(env.DATABASE_URL);

export const sqlite = new Database(env.DATABASE_URL);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS display_modes (
    module_id text PRIMARY KEY NOT NULL,
    display_mode text NOT NULL
  );

  CREATE TABLE IF NOT EXISTS thoughts (
    id text PRIMARY KEY NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    body text NOT NULL,
    tags text NOT NULL,
    visibility text NOT NULL,
    status text NOT NULL,
    created_at text,
    sort_order integer,
    paper_background_image_url text,
    paper_background_opacity integer
  );

  CREATE TABLE IF NOT EXISTS albums (
    id text PRIMARY KEY NOT NULL,
    title text NOT NULL,
    description text,
    cover_image text,
    photo_count integer NOT NULL,
    visibility text NOT NULL,
    status text NOT NULL,
    created_at text,
    sort_order integer
  );

  CREATE TABLE IF NOT EXISTS album_photos (
    id text PRIMARY KEY NOT NULL,
    album_id text NOT NULL,
    title text NOT NULL,
    uploaded_at text NOT NULL,
    note text,
    image_url text NOT NULL,
    image_position text NOT NULL,
    sort_order integer NOT NULL
  );

  CREATE TABLE IF NOT EXISTS album_photo_deletions (
    album_id text NOT NULL,
    photo_id text PRIMARY KEY NOT NULL
  );
`);

ensureColumn("thoughts", "paper_background_image_url", "text");
ensureColumn("thoughts", "paper_background_opacity", "integer");

export const db = drizzle(sqlite);
