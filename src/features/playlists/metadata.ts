import { parseBuffer } from "music-metadata";

export type PlaylistCoverMetadata = {
  buffer: Buffer;
  extension: "jpg" | "png" | "webp";
  mimeType: string;
};

export type PlaylistAudioMetadata = {
  artist: string;
  cover?: PlaylistCoverMetadata;
  title: string;
};

function titleFromFileName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").trim() || "未命名歌曲";
}

function getCoverExtension(mimeType: string): PlaylistCoverMetadata["extension"] {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export async function parsePlaylistAudioMetadata(buffer: Buffer, fileName: string): Promise<PlaylistAudioMetadata> {
  const metadata = await parseBuffer(buffer, "audio/mpeg");
  const picture = metadata.common.picture?.[0];
  const artist = metadata.common.artist || metadata.common.artists?.filter(Boolean).join(", ") || "未知歌手";

  return {
    artist,
    cover: picture
      ? {
          buffer: Buffer.from(picture.data),
          extension: getCoverExtension(picture.format),
          mimeType: picture.format,
        }
      : undefined,
    title: metadata.common.title || titleFromFileName(fileName),
  };
}
