import type { PlaylistLyricLine } from "@/data/playlists";

export type PlaylistReviewInput = {
  artist: string;
  feeling?: string;
  lyrics?: PlaylistLyricLine[];
  title: string;
};

export function normalizePlaylistShortReview(value: string) {
  return value
    .replace(/^[\'\"“”‘’]+|[\'\"“”‘’]+$/g, "")
    .replace(/^短音评[:：]\s*/, "")
    .replace(/\s+/g, "")
    .replace(/[。.!！]+$/g, "")
    .trim();
}

function buildReviewPrompt(song: PlaylistReviewInput) {
  const lyrics = (song.lyrics ?? []).map((line) => line.text).join("\n").slice(0, 2200);
  const fallbackText = song.feeling?.trim() ?? "";

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

export function getPlaylistReviewConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    apiKey: env.DEEPSEEK_API_KEY,
    endpoint: env.DEEPSEEK_API_URL ?? "https://api.deepseek.com/chat/completions",
    model: env.DEEPSEEK_MODEL ?? "deepseek-v4",
  };
}

export function buildFallbackShortReview(song: Pick<PlaylistReviewInput, "artist" | "title">) {
  return `${song.artist} 的耳机片段`.slice(0, 30);
}

export async function generatePlaylistShortReview(song: PlaylistReviewInput) {
  const { apiKey, endpoint, model } = getPlaylistReviewConfig();

  if (!apiKey) {
    return {
      review: buildFallbackShortReview(song),
      warning: "缺少 DEEPSEEK_API_KEY，已使用默认短音评",
    };
  }

  try {
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
            content: buildReviewPrompt(song),
          },
        ],
        stream: false,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: unknown } }> };
    const content = data.choices?.[0]?.message?.content;

    if (typeof content !== "string" || content.trim().length === 0) {
      throw new Error("DeepSeek API returned an empty review");
    }

    const review = normalizePlaylistShortReview(content);

    if (review.length > 30) {
      throw new Error(`Generated review is too long: ${review}`);
    }

    return { review };
  } catch (error) {
    return {
      review: buildFallbackShortReview(song),
      warning: error instanceof Error ? `短音评生成失败，已使用默认短音评：${error.message}` : "短音评生成失败，已使用默认短音评",
    };
  }
}
