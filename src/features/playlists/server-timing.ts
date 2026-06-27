export async function measurePlaylistServerTiming<T>(label: string, action: () => Promise<T>): Promise<T> {
  const startedAt = performance.now();

  try {
    return await action();
  } finally {
    if (process.env.NODE_ENV !== "test") {
      console.info("[playlists/server-timing]", {
        elapsedMs: Math.round(performance.now() - startedAt),
        label,
      });
    }
  }
}
