import { NextResponse } from "next/server";
import { parsePlaylistAudioMetadata } from "@/features/playlists/metadata";
import { buildPlaylistAudioPath, buildPlaylistSongCoverPath } from "@/features/storage/paths";
import {
  ensureSupabasePlaylistCollection,
  getNextSupabasePlaylistSongSortOrder,
  insertSupabasePlaylistCollectionSongs,
  insertSupabasePlaylistSongs,
  requireSupabasePlaylistWriteEnv,
  uploadSupabasePlaylistAsset,
  type PlaylistSongInsert,
} from "@/features/playlists/repository";
import { generatePlaylistShortReview } from "@/features/playlists/review";
import { parseLrcToLyricLines } from "@/features/playlists/lyrics";
import { requireAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

// 单次导入的基础限制，避免一次请求上传过多或过大的文件。
const maxSongsPerImport = 30;
const maxAudioSize = 20 * 1024 * 1024;
const maxLyricSize = 512 * 1024;

type ImportWarning = {
  fileName?: string;
  message: string;
};

// 判断 FormData 字段是否真的是上传文件，顺便把类型收窄成 File。
function isUploadedFile(value: FormDataEntryValue): value is File {
  return typeof value !== "string" && typeof value.arrayBuffer === "function" && typeof value.name === "string" && typeof value.size === "number";
}

// 取文件扩展名并统一转小写，后续用它判断 MP3/LRC/NCM。
function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

// 去掉文件名最后一段扩展名，用于从文件名里推导歌曲名或匹配歌词。
function stripExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}

// 生成用于匹配音频和歌词的基础文件名，忽略大小写和首尾空格。
function normalizeBaseName(fileName: string) {
  return stripExtension(fileName).trim().toLowerCase();
}

// 把歌曲标题转成适合放进 Supabase Storage 的 ASCII 路径片段。
function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 48) || "song";
}

// 校验音频文件：当前只允许非空、20MB 内的 MP3，并明确拦截 NCM。
function validateAudioFile(file: File) {
  const extension = getExtension(file.name);

  if (extension === "ncm") {
    throw new Error(`${file.name} 暂不支持直接导入 NCM，请先本地转换为 MP3 后上传`);
  }

  if (extension !== "mp3" && file.type !== "audio/mpeg") {
    throw new Error(`${file.name} 不是支持的 MP3 文件`);
  }

  if (file.size === 0) {
    throw new Error(`${file.name} 是空文件`);
  }

  if (file.size > maxAudioSize) {
    throw new Error(`${file.name} 超过 20MB`);
  }
}

// 校验歌词文件：只接受 LRC，并限制文件体积，避免异常大文本进入解析流程。
function validateLyricFile(file: File) {
  if (getExtension(file.name) !== "lrc") {
    throw new Error(`${file.name} 不是 LRC 文件`);
  }

  if (file.size > maxLyricSize) {
    throw new Error(`${file.name} 超过 512KB`);
  }
}

// 从 FormData 的同名字段里收集多个上传文件，过滤掉普通字符串字段。
function collectFiles(formData: FormData, key: string) {
  return formData.getAll(key).filter(isUploadedFile);
}

// 处理歌单导入请求：校验上传内容、上传资源、生成短评，最后写入歌单数据。
export async function POST(request: Request) {
  try {
    requireSupabasePlaylistWriteEnv();

    const unauthorizedResponse = requireAdminRequest(request, "无权限导入歌单");

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    // 从 multipart/form-data 中取出音频、歌词和目标歌单 ID。
    const formData = await request.formData();
    const audioFiles = collectFiles(formData, "audioFiles");
    const lyricFiles = collectFiles(formData, "lyricFiles");
    const rawCollectionId = formData.get("collectionId");
    const collectionId = typeof rawCollectionId === "string" ? rawCollectionId.trim() : "";

    if (!collectionId) {
      return NextResponse.json({ error: "请选择要导入的歌单" }, { status: 400 });
    }

    if (audioFiles.length === 0) {
      return NextResponse.json({ error: "请先选择 MP3 文件" }, { status: 400 });
    }

    if (audioFiles.length > maxSongsPerImport) {
      return NextResponse.json({ error: `一次最多导入 ${maxSongsPerImport} 首歌` }, { status: 400 });
    }

    // 先做本地文件校验，再确认目标歌单存在，避免上传后才失败。
    audioFiles.forEach(validateAudioFile);
    lyricFiles.forEach(validateLyricFile);
    await ensureSupabasePlaylistCollection(collectionId);

    const warnings: ImportWarning[] = [];
    // 用“去扩展名后的文件名”匹配 MP3 和 LRC，例如 song.mp3 对应 song.lrc。
    const lyricFilesByBaseName = new Map(lyricFiles.map((file) => [normalizeBaseName(file.name), file]));
    const nextSortOrder = await getNextSupabasePlaylistSongSortOrder();
    const songsToInsert: PlaylistSongInsert[] = [];

    for (const [index, audioFile] of audioFiles.entries()) {
      // 每首歌独立读取音频、匹配歌词，并组装成待写入数据库的歌曲记录。
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      const baseName = normalizeBaseName(audioFile.name);
      const matchedLyricFile = lyricFilesByBaseName.get(baseName);
      const lyrics = matchedLyricFile ? parseLrcToLyricLines(await matchedLyricFile.text()) : [];

      if (!matchedLyricFile) {
        warnings.push({ fileName: audioFile.name, message: "没有匹配到同名 LRC，已仅导入音频" });
      }

      let metadata;

      // 优先从 MP3 元数据读取歌名、歌手和封面；失败时退回到文件名和未知歌手。
      try {
        metadata = await parsePlaylistAudioMetadata(audioBuffer, audioFile.name);
      } catch (error) {
        metadata = { artist: "未知歌手", title: stripExtension(audioFile.name) };
        warnings.push({ fileName: audioFile.name, message: error instanceof Error ? `MP3 元数据解析失败：${error.message}` : "MP3 元数据解析失败" });
      }

      // songId 同时用于数据库主键和存储路径，带上序号与标题片段便于排查文件。
      const songId = `song-${Date.now()}-${index + 1}-${slugify(metadata.title)}`;
      const audioPath = buildPlaylistAudioPath(songId);
      const audioSrc = await uploadSupabasePlaylistAsset({
        buffer: audioBuffer,
        contentType: "audio/mpeg",
        path: audioPath,
      });
      let coverImageSrc: string | undefined;

      if (metadata.cover) {
        coverImageSrc = await uploadSupabasePlaylistAsset({
          buffer: metadata.cover.buffer,
          contentType: metadata.cover.mimeType,
          path: buildPlaylistSongCoverPath(songId, metadata.cover.extension),
        });
      } else {
        warnings.push({ fileName: audioFile.name, message: "没有解析到内嵌封面" });
      }

      // 根据标题、歌手和歌词生成短音评；生成失败时会返回 warning 和兜底文案。
      const reviewResult = await generatePlaylistShortReview({
        artist: metadata.artist,
        lyrics,
        title: metadata.title,
      });

      if (reviewResult.warning) {
        warnings.push({ fileName: audioFile.name, message: reviewResult.warning });
      }

      songsToInsert.push({
        artist: metadata.artist,
        audioSrc,
        coverImageSrc,
        feeling: reviewResult.review,
        id: songId,
        lyrics,
        shortReview: reviewResult.review,
        sortOrder: nextSortOrder + index,
        title: metadata.title,
      });
    }

    // 导入完成前检查是否有孤立 LRC，提示用户这些歌词没有被任何 MP3 使用。
    const usedLyricBaseNames = new Set(audioFiles.map((file) => normalizeBaseName(file.name)));

    lyricFiles.forEach((file) => {
      if (!usedLyricBaseNames.has(normalizeBaseName(file.name))) {
        warnings.push({ fileName: file.name, message: "没有匹配到同名 MP3，已忽略该 LRC" });
      }
    });

    // 先写入歌曲本体，再建立歌单与歌曲的关联关系。
    await insertSupabasePlaylistSongs(songsToInsert);
    await insertSupabasePlaylistCollectionSongs(collectionId, songsToInsert.map((song) => song.id));

    return NextResponse.json({
      songs: songsToInsert.map((song) => ({
        artist: song.artist,
        audioSrc: song.audioSrc,
        coverImageSrc: song.coverImageSrc,
        id: song.id,
        lyricsCount: song.lyrics.length,
        shortReview: song.shortReview,
        title: song.title,
      })),
      warnings,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "歌单导入失败" }, { status: 400 });
  }
}
