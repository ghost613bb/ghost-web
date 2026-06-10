#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const envPath = resolve(projectRoot, ".env.local");
const playlistsPath = resolve(projectRoot, "src/data/playlists.ts");
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
        const value = rest.join("=").trim().replace(/^['\"]|['\"]$/g, "");
        return [key, value];
      }),
  );
}

function readStaticArray(source, exportName) {
  const marker = `export const ${exportName}`;
  const start = source.indexOf(marker);

  if (start < 0) {
    throw new Error(`Cannot find ${exportName} in src/data/playlists.ts`);
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

function toSongRow(song) {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    description: song.description ?? null,
    feeling: song.feeling ?? null,
    audio_src: song.audioSrc ?? null,
    cover_image_src: song.coverImageSrc ?? null,
    lyric_lines: song.lyrics ?? [],
    short_review: song.shortReview ?? null,
    tags: song.tags ?? [],
    visibility: song.visibility ?? "public",
    status: song.status ?? "published",
    sort_order: song.sortOrder ?? 0,
    created_at: song.createdAt ?? null,
  };
}

function toCollectionRow(collection, index) {
  return {
    id: collection.id,
    title: collection.title,
    description: collection.description ?? null,
    emoji: collection.emoji ?? null,
    accent_class: collection.accentClass ?? null,
    sort_order: index + 1,
  };
}

function toCollectionSongRows(collections) {
  return collections.flatMap((collection) =>
    collection.songIds.map((songId, index) => ({
      collection_id: collection.id,
      song_id: songId,
      sort_order: index + 1,
    })),
  );
}

function toNoteRow(note) {
  return {
    id: note.id,
    song_id: note.songId,
    author: note.author,
    content: note.content,
    avatar: note.avatar ?? null,
  };
}

async function upsertRows(supabase, table, rows, options = {}) {
  if (rows.length === 0) {
    console.log(`${table}: 0 rows, skipped`);
    return;
  }

  const { error } = await supabase.from(table).upsert(rows, options);

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  console.log(`${table}: upserted ${rows.length} rows`);
}

async function main() {
  const env = { ...process.env, ...parseEnvFile(envPath) };
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and a Supabase key in .env.local");
  }

  const source = readFileSync(playlistsPath, "utf8");
  const songs = readStaticArray(source, "playlistSongs");
  const collections = readStaticArray(source, "playlistCollections");
  const notes = readStaticArray(source, "playlistNotes");
  const songRows = songs.map(toSongRow);
  const collectionRows = collections.map(toCollectionRow);
  const collectionSongRows = toCollectionSongRows(collections);
  const noteRows = notes.map(toNoteRow);

  console.log(`Mode: ${dryRun ? "dry-run" : "commit"}`);
  console.log(`playlist_songs: ${songRows.length} rows`);
  console.log(`playlist_collections: ${collectionRows.length} rows`);
  console.log(`playlist_collection_songs: ${collectionSongRows.length} rows`);
  console.log(`playlist_notes: ${noteRows.length} rows`);

  if (dryRun) {
    console.log("Dry-run only. Re-run with --commit to write to Supabase.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    db: { schema: "public" },
    realtime: { transport: WebSocket },
  });

  await upsertRows(supabase, "playlist_songs", songRows, { onConflict: "id" });
  await upsertRows(supabase, "playlist_collections", collectionRows, { onConflict: "id" });
  await upsertRows(supabase, "playlist_collection_songs", collectionSongRows, { onConflict: "collection_id,song_id" });
  await upsertRows(supabase, "playlist_notes", noteRows, { onConflict: "id" });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
