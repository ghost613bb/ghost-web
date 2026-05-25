// 环境变量入口
  // - 读取 DATABASE_URL
  // - 没配时默认走 ./.local/ghost.db
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default("./.local/ghost.db"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
});
