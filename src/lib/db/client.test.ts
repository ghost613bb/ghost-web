import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const temporaryDirectories: string[] = [];

async function importDbClientWithDatabaseUrl(databaseUrl: string) {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", databaseUrl);

  return import("./client");
}

describe("db client", () => {
  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.resetModules();

    await Promise.all(temporaryDirectories.map((directory) => rm(directory, { force: true, recursive: true })));
    temporaryDirectories.length = 0;
  });

  it("creates the parent directory before opening a sqlite file database", async () => {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "ghost-db-client-"));
    const databaseUrl = path.join(temporaryDirectory, "missing", "nested", "ghost.db");

    temporaryDirectories.push(temporaryDirectory);

    const { sqlite } = await importDbClientWithDatabaseUrl(databaseUrl);

    expect(sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get("thoughts")).toMatchObject({ name: "thoughts" });
    sqlite.close();
  });

  it("opens an in-memory sqlite database without creating a filesystem directory", async () => {
    const { sqlite } = await importDbClientWithDatabaseUrl(":memory:");

    expect(sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get("display_modes")).toMatchObject({ name: "display_modes" });
    sqlite.close();
  });
});
