// 定义数据库表结构
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const displayModes = sqliteTable("display_modes", {
  moduleId: text("module_id").primaryKey(),
  displayMode: text("display_mode", { enum: ["real", "demo"] }).notNull(),
});

export const thoughts = sqliteTable("thoughts", {
  id: text("id").primaryKey(), // 主键 ID
  title: text("title").notNull(), // 标题
  slug: text("slug").notNull(), // URL 友好的唯一标识
  body: text("body").notNull(), // 正文内容
  bodyText: text("body_text").notNull().default(""),
  excerpt: text("excerpt"),
  tags: text("tags").notNull().default("[]"), // 标签（字符串形式存储）
  coverImageUrl: text("cover_image_url"),
  visibility: text("visibility", { enum: ["public", "private", "interview_hidden", "masked"] }).notNull().default("public"), // 可见性
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"), // 发布状态
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order"), // 排序权重/顺序
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull(), // 创建时间
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"),
  paperBackgroundImageUrl: text("paper_background_image_url"),
  paperBackgroundOpacity: integer("paper_background_opacity"),
});

export const albums = sqliteTable("albums", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  photoCount: integer("photo_count").notNull(),
  visibility: text("visibility", { enum: ["public", "private", "interview_hidden", "masked"] }).notNull(),
  status: text("status", { enum: ["draft", "published"] }).notNull(),
  createdAt: text("created_at"),
  sortOrder: integer("sort_order"),
});

export const albumPhotos = sqliteTable("album_photos", {
  id: text("id").primaryKey(),
  albumId: text("album_id").notNull(),
  title: text("title").notNull(),
  uploadedAt: text("uploaded_at").notNull(),
  note: text("note"),
  imageUrl: text("image_url").notNull(),
  imagePosition: text("image_position").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const albumPhotoDeletions = sqliteTable("album_photo_deletions", {
  albumId: text("album_id").notNull(),
  photoId: text("photo_id").primaryKey().notNull(),
});
