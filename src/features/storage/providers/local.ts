import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageScope, StorageWriteInput, StorageWriteResult } from "../types";

type LocalStorageConfig = {
  baseDir: string;
  publicBasePath: string;
};

function getDefaultLocalStorageConfig(scope: StorageScope): LocalStorageConfig {
  switch (scope) {
    case "thoughts":
      return {
        baseDir: process.env.THOUGHT_UPLOAD_DIR ?? path.join(process.cwd(), "public/uploads/thoughts"),
        publicBasePath: "/uploads/thoughts",
      };
    case "albums":
      return {
        baseDir: process.env.ALBUM_UPLOAD_DIR ?? path.join(process.cwd(), "public/uploads/albums"),
        publicBasePath: "/uploads/albums",
      };
    case "playlists":
      return {
        baseDir: path.join(process.cwd(), "public/uploads/playlists"),
        publicBasePath: "/uploads/playlists",
      };
    case "coffee":
      return {
        baseDir: path.join(process.cwd(), "public/uploads/coffee"),
        publicBasePath: "/uploads/coffee",
      };
  }
}

export async function uploadLocalStorageObject(input: StorageWriteInput): Promise<StorageWriteResult> {
  const storageConfig = getDefaultLocalStorageConfig(input.scope);
  const outputPath = path.join(storageConfig.baseDir, input.objectPath);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, input.buffer);

  return {
    objectPath: input.objectPath,
    provider: "local",
    scope: input.scope,
    url: `${storageConfig.publicBasePath}/${input.objectPath}`,
  };
}
