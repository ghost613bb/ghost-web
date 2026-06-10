#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const envPath = resolve(projectRoot, ".env.local");
const dryRun = !process.argv.includes("--commit");
const force = process.argv.includes("--force");

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const [rawKey, ...rest] = line.split("=");
        const key = rawKey.replace(/^export\s+/, "").trim();
        const value = rest.join("=").trim().replace(/^['\"]|['\"]$/g, "");
        return [key, value];
      }),
  );
}

function parseLyrics(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((line) => {
      if (!line || typeof line !== "object") {
        return null;
      }

      if (typeof line.text !== "string") {
        return null;
      }

      return line.text.trim();
    })
    .filter(Boolean);
}

function normalizeReview(value) {
  return value
    .replace(/^['\"“”‘’]+|['\"“”‘’]+$/g, "")
    .replace(/^短音评[:：]\s*/, "")
    .replace(/\s+/g, "")
    .replace(/[。.!！]+$/g, "")
    .trim();
}

function buildPrompt(song) {
  const lyrics = parseLyrics(song.lyric_lines).join("\n").slice(0, 2200);
  const fallbackText = [song.feeling].filter(Boolean).join("\n");

  return `请根据歌曲信息生成一句中文短音评，用于个人歌单页面的「听感」列。

要求：
- 8 到 24 个中文字符，最多 30 个中文字符
- 只输出一句话，不要解释
- 不要出现“这首歌”
- 不要出现“表达了”“讲述了”
- 不要像乐评文章，不要营销腔
- 要有一点画面感或听感
- 可以偏情绪、氛围、质感

歌曲名：${song.title}
歌手：${song.artist}
${lyrics ? `歌词：\n${lyrics}` : `补充信息：\n${fallbackText || "无"}`}`;
}

async function generateReview({ apiKey, endpoint, model, song }) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "你是一个个人歌单 App 的短音评助手。你只返回一句中文短音评。",
        },
        {
          role: "user",
          content: buildPrompt(song),
        },
      ],
      stream: false,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("DeepSeek API returned an empty review");
  }

  const review = normalizeReview(content);

  if (review.length > 30) {
    throw new Error(`Generated review is too long: ${review}`);
  }

  return review;
}

async function main() {
  const env = { ...process.env, ...parseEnvFile(envPath) };
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const deepseekApiKey = env.DEEPSEEK_API_KEY;
  const deepseekModel = env.DEEPSEEK_MODEL ?? "deepseek-v4";
  const deepseekEndpoint = env.DEEPSEEK_API_URL ?? "https://api.deepseek.com/chat/completions";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase env in .env.local");
  }

  if (!deepseekApiKey) {
    throw new Error("Missing DEEPSEEK_API_KEY in .env.local");
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    db: { schema: "public" },
    realtime: { transport: WebSocket },
  });

  const { data: songs, error } = await supabase
    .from("playlist_songs")
    .select("id,title,artist,feeling,lyric_lines,short_review,status,sort_order")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`playlist_songs: ${error.message}`);
  }

  const targetSongs = (songs ?? []).filter((song) => force || !song.short_review);

  console.log(`Mode: ${dryRun ? "dry-run" : "commit"}`);
  console.log(`Model: ${deepseekModel}`);
  console.log(`Target songs: ${targetSongs.length}/${songs?.length ?? 0}`);

  for (const song of targetSongs) {
    const review = await generateReview({
      apiKey: deepseekApiKey,
      endpoint: deepseekEndpoint,
      model: deepseekModel,
      song,
    });

    console.log(`${song.title} / ${song.artist} -> ${review}`);

    if (!dryRun) {
      const { error: updateError } = await supabase.from("playlist_songs").update({ short_review: review }).eq("id", song.id);

      if (updateError) {
        throw new Error(`${song.id}: ${updateError.message}`);
      }
    }
  }

  if (dryRun) {
    console.log("Dry-run only. Re-run with --commit to write short_review to Supabase.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
