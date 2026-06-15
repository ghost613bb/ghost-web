#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const envPath = resolve(projectRoot, ".env.local");
const thoughtsPath = resolve(projectRoot, "src/data/thoughts.ts");
const dryRun = !process.argv.includes("--commit");

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
        const value = rest.join("=").trim().replace(/^[']|[']$/g, "").replace(/^[\"]|[\"]$/g, "");
        return [key, value];
      }),
  );
}

function readStaticArray(source, exportName) {
  const marker = `export const ${exportName}`;
  const start = source.indexOf(marker);

  if (start < 0) {
    throw new Error(`Cannot find ${exportName} in src/data/thoughts.ts`);
  }

  const assignmentStart = source.indexOf("=", start);

  if (assignmentStart < 0) {
    throw new Error(`Cannot find ${exportName} assignment`);
  }

  const arrayStart = source.indexOf("[", assignmentStart);

  if (arrayStart < 0) {
    throw new Error(`Cannot find ${exportName} array start`);
  }

  let depth = 0;
  let inString = false;
  let quote = "";
  let escaped = false;

  for (let index = arrayStart; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === quote) {
        inString = false;
      }

      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      quote = char;
      continue;
    }

    if (char === "[") {
      depth += 1;
    }

    if (char === "]") {
      depth -= 1;

      if (depth === 0) {
        const arrayLiteral = source.slice(arrayStart, index + 1);
        return Function(`"use strict"; return (${arrayLiteral});`)();
      }
    }
  }

  throw new Error(`Cannot parse ${exportName}`);
}

function bodyToPlainText(body) {
  return body
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function toThoughtRow(thought) {
  const createdAt = thought.createdAt ?? new Date().toISOString();

  return {
    id: thought.id,
    title: thought.title,
    slug: thought.slug,
    body: thought.body,
    body_text: thought.bodyText ?? bodyToPlainText(thought.body),
    excerpt: thought.excerpt ?? null,
    cover_image_url: thought.coverImageUrl ?? null,
    visibility: thought.visibility ?? "public",
    status: thought.status ?? "published",
    pinned: thought.pinned ?? false,
    sort_order: thought.sortOrder ?? null,
    published_at: thought.publishedAt ?? (thought.status === "published" || !thought.status ? createdAt : null),
    created_at: createdAt,
    updated_at: thought.updatedAt ?? createdAt,
    deleted_at: thought.deletedAt ?? null,
    paper_background_image_url: thought.paperBackgroundImageUrl ?? null,
    paper_background_opacity: thought.paperBackgroundOpacity ?? null,
  };
}

async function main() {
  const env = { ...process.env, ...parseEnvFile(envPath) };
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  const source = readFileSync(thoughtsPath, "utf8");
  const thoughts = readStaticArray(source, "thoughts");
  const thoughtRows = thoughts.map(toThoughtRow);

  console.log(`Mode: ${dryRun ? "dry-run" : "commit"}`);
  console.log(`thoughts: ${thoughtRows.length} rows`);

  if (dryRun) {
    console.log("Dry-run only. Re-run with --commit to write to Supabase.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    db: { schema: "public" },
    realtime: { transport: WebSocket },
  });
  const { error } = await supabase.from("thoughts").upsert(thoughtRows, { onConflict: "id" });

  if (error) {
    throw new Error(`thoughts: ${error.message}`);
  }

  console.log(`thoughts: upserted ${thoughtRows.length} rows`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
