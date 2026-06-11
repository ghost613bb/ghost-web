import type { PlaylistLyricLine } from "@/data/playlists";

// 匹配 LRC 时间标签，例如 [01:23]、[01:23.45]、[01:23.456]。
const timestampPattern = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
// LRC 里这些行是歌曲元信息，不是逐句歌词，解析时直接跳过。
const metadataPattern = /^\[(?:ti|ar|al|by|offset|length|re|ve):/i;

// 把 LRC 时间标签拆出来的分、秒、毫秒部分换算成播放器使用的秒数。
function parseTimestamp(minutes: string, seconds: string, fraction = "0") {
  // LRC 小数位可能是 1~3 位，这里统一补齐/截断成毫秒。
  const normalizedFraction = fraction.padEnd(3, "0").slice(0, 3);

  return Number(minutes) * 60 + Number(seconds) + Number(normalizedFraction) / 1000;
}

// 将整段 LRC 文本解析成按时间排序的歌词行，供播放器按播放进度高亮。
export function parseLrcToLyricLines(source: string): PlaylistLyricLine[] {
  return source
    .split(/\r?\n/)
    .flatMap((rawLine) => {
      const line = rawLine.trim();

      // 空行和 [ti:xxx] 这类元信息行不会展示在歌词列表里。
      if (!line || metadataPattern.test(line)) {
        return [];
      }

      // 一行歌词可能有多个时间标签，表示同一句歌词在多个时间点重复出现。
      const timestamps = [...line.matchAll(timestampPattern)];
      const text = line.replace(timestampPattern, "").trim();

      // 没有时间标签或只有时间没有歌词内容的行，都无法用于同步歌词。
      if (timestamps.length === 0 || !text) {
        return [];
      }

      return timestamps.map((match) => ({
        text,
        time: parseTimestamp(match[1] ?? "0", match[2] ?? "0", match[3]),
      }));
    })
    .sort((a, b) => a.time - b.time);
}
