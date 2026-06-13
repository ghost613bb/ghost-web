"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { PlaylistCollection } from "@/data/playlists";
import { PlaylistDropdown } from "./PlaylistDropdown";

type PlaylistBatchImportDialogProps = {
  activeCollectionId: string;
  collections: PlaylistCollection[];
  onClose: () => void;
};

type PlaylistImportResult = {
  songs?: Array<{ title: string }>;
  warnings?: Array<{ fileName?: string; message: string }>;
};

function getImportFileBaseName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").trim().toLowerCase();
}

export function PlaylistBatchImportDialog({ activeCollectionId, collections, onClose }: PlaylistBatchImportDialogProps) {
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [lyricFiles, setLyricFiles] = useState<File[]>([]);
  const [collectionId, setCollectionId] = useState(activeCollectionId);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PlaylistImportResult | null>(null);
  const lyricBaseNames = new Set(lyricFiles.map((file) => getImportFileBaseName(file.name)));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (audioFiles.length === 0) {
      setError("请先选择 MP3 文件");
      return;
    }

    const formData = new FormData();

    formData.set("collectionId", collectionId);
    audioFiles.forEach((file) => formData.append("audioFiles", file));
    lyricFiles.forEach((file) => formData.append("lyricFiles", file));

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/playlists/import", {
        body: formData,
        credentials: "same-origin",
        method: "POST",
      });
      const data = (await response.json()) as PlaylistImportResult & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "导入失败");
      }

      setResult(data);
      window.setTimeout(() => window.location.reload(), 900);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "导入失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#4f2525]/35 px-4 backdrop-blur-sm" role="presentation">
      <section aria-label="批量导入歌曲" className="album-page-scrollbar max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[1.7rem] border-[2.5px] border-stone-700/80 bg-[#fffaf3] p-4 shadow-[0_18px_42px_rgba(79,37,37,0.25)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a54454]">Playlist Import</p>
            <h2 className="text-2xl font-black text-[#4f2525]">批量导入歌曲</h2>
            <p className="mt-1 text-sm font-semibold text-stone-600">上传 MP3 和同名 LRC，自动解析封面、歌词和短音评。</p>
          </div>
          <button aria-label="关闭批量导入" className="rounded-full p-1 text-[#4f2525] transition hover:bg-[#f8cfd5]" onClick={onClose} type="button">
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block rounded-[1.2rem] border-2 border-dashed border-stone-700/60 bg-[#fff4d8] p-3 text-sm font-black text-[#4f2525]">
            MP3 文件
            <input accept=".mp3,audio/mpeg" className="mt-2 block w-full text-sm font-semibold text-stone-700 file:mr-3 file:rounded-full file:border-2 file:border-stone-700/70 file:bg-[#f8cfd5] file:px-3 file:py-1 file:font-black" multiple onChange={(event) => setAudioFiles(Array.from(event.currentTarget.files ?? []))} type="file" />
          </label>

          <label className="block rounded-[1.2rem] border-2 border-dashed border-stone-700/60 bg-[#fff4d8] p-3 text-sm font-black text-[#4f2525]">
            LRC 歌词文件
            <input accept=".lrc" className="mt-2 block w-full text-sm font-semibold text-stone-700 file:mr-3 file:rounded-full file:border-2 file:border-stone-700/70 file:bg-[#ffe6ad] file:px-3 file:py-1 file:font-black" multiple onChange={(event) => setLyricFiles(Array.from(event.currentTarget.files ?? []))} type="file" />
          </label>

          <PlaylistDropdown label="导入到歌单" onChange={setCollectionId} options={collections.map((collection) => ({ label: collection.title, value: collection.id }))} value={collectionId} />

          {audioFiles.length > 0 ? (
            <div className="rounded-[1.1rem] border border-[#eed8c6] bg-white/60 p-3">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#a54454]">匹配预览</p>
              <div className="album-page-scrollbar max-h-64 space-y-2 overflow-y-auto pr-1 text-sm font-semibold text-stone-700">
                {audioFiles.map((file) => {
                  const hasLyric = lyricBaseNames.has(getImportFileBaseName(file.name));

                  return (
                    <p className="flex items-center justify-between gap-3" key={file.name}>
                      <span className="truncate">{file.name}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-black ${hasLyric ? "bg-[#dff3cf] text-[#42672d]" : "bg-[#ffe6ad] text-[#7a3d3f]"}`}>{hasLyric ? "已匹配 LRC" : "无同名 LRC"}</span>
                    </p>
                  );
                })}
              </div>
            </div>
          ) : null}

          {error ? <p className="rounded-[1rem] border-2 border-[#b75d66] bg-[#ffeef1] px-3 py-2 text-sm font-black text-[#7a3d3f]">{error}</p> : null}
          {result ? (
            <div className="rounded-[1rem] border-2 border-[#8fa875] bg-[#f1f8dd] px-3 py-2 text-sm font-black text-[#42672d]">
              已导入 {result.songs?.length ?? 0} 首歌，页面即将刷新。
              {result.warnings?.map((warning) => (
                <p className="mt-1 text-xs" key={`${warning.fileName ?? "warning"}-${warning.message}`}>
                  {warning.fileName ? `${warning.fileName}：` : ""}
                  {warning.message}
                </p>
              ))}
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <button className="rounded-[1rem] border-2 border-stone-700/60 bg-white px-4 py-2 text-sm font-black text-stone-900" onClick={onClose} type="button">
              取消
            </button>
            <button className="rounded-[1rem] border-2 border-stone-700/70 bg-[#f8cfd5] px-4 py-2 text-sm font-black text-stone-900 shadow-[0_4px_0_rgba(112,84,84,0.12)] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? "导入中..." : "开始导入"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
