"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { PlaylistCollection } from "@/data/playlists";
import { playlistCollectionAccentOptions } from "./collection-validation";
import { PlaylistDropdown, type PlaylistDropdownOption } from "./PlaylistDropdown";

type PlaylistCollectionDialogProps =
  | { mode: "create"; onClose: () => void; onSaved: (collection: PlaylistCollection) => void }
  | { collection: PlaylistCollection; mode: "edit"; onClose: () => void; onSaved: (collection: PlaylistCollection) => void };

type PlaylistCollectionDialogResult = {
  collection?: PlaylistCollection;
  error?: string;
};

const collectionAccentDropdownOptions: PlaylistDropdownOption[] = playlistCollectionAccentOptions.map((option) => ({
  label: option.label,
  swatchClassName: option.className,
  value: option.className,
}));

export function PlaylistCollectionDialog(props: PlaylistCollectionDialogProps) {
  const isEditMode = props.mode === "edit";
  const currentCollection = props.mode === "edit" ? props.collection : undefined;
  const [accentClass, setAccentClass] = useState(currentCollection?.accentClass ?? playlistCollectionAccentOptions[0].className);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [description, setDescription] = useState(currentCollection?.description ?? "");
  const [emoji, setEmoji] = useState(currentCollection?.emoji ?? "🎵");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(currentCollection?.title ?? "");
  const editCollectionId = currentCollection?.id ?? "";
  const dialogLabel = isEditMode ? "编辑歌单" : "新增歌单";
  const dialogDescription = isEditMode ? "修改歌单名称、描述、图标、主题色和封面。" : "创建一个空歌单，可选上传封面，之后可以继续批量导入歌曲。";
  const submitLabel = isEditMode ? "保存歌单" : "创建歌单";
  const submittingLabel = isEditMode ? "保存中..." : "创建中...";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("请输入歌单名称");
      return;
    }

    setIsSubmitting(true);

    try {
      let response: Response;

      if (coverFile) {
        const formData = new FormData();
        formData.set("accentClass", accentClass);
        formData.set("coverFile", coverFile);
        formData.set("description", description);
        formData.set("emoji", emoji);
        formData.set("title", title);
        response = await fetch(isEditMode ? `/api/playlists/collections/${encodeURIComponent(editCollectionId)}/cover` : "/api/playlists/collections", {
          body: formData,
          credentials: "same-origin",
          method: "POST",
        });
      } else {
        response = await fetch(isEditMode ? `/api/playlists/collections/${encodeURIComponent(editCollectionId)}` : "/api/playlists/collections", {
          body: JSON.stringify({
            accentClass,
            description,
            emoji,
            title,
          }),
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          method: isEditMode ? "PATCH" : "POST",
        });
      }

      const data = (await response.json()) as PlaylistCollectionDialogResult;

      if (!response.ok || !data.collection) {
        throw new Error(data.error ?? `${isEditMode ? "编辑" : "新增"}歌单失败`);
      }

      props.onSaved(isEditMode ? { ...data.collection, songIds: currentCollection?.songIds ?? [] } : data.collection);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : `${isEditMode ? "编辑" : "新增"}歌单失败`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#4f2525]/35 px-4 backdrop-blur-sm" role="presentation">
      <section aria-label={dialogLabel} className="w-full max-w-2xl rounded-[1.7rem] border-[2.5px] border-stone-700/80 bg-[#fffaf3] p-4 shadow-[0_18px_42px_rgba(79,37,37,0.25)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a54454]">Playlist Collection</p>
            <h2 className="text-2xl font-black text-[#4f2525]">{dialogLabel}</h2>
            <p className="mt-1 text-sm font-semibold text-stone-600">{dialogDescription}</p>
          </div>
          <button aria-label={`关闭${dialogLabel}`} className="rounded-full p-1 text-[#4f2525] transition hover:bg-[#f8cfd5]" onClick={props.onClose} type="button">
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-black text-[#4f2525]">
            歌单名称
            <input className="mt-2 w-full rounded-[1rem] border-2 border-stone-700/60 bg-white/80 px-3 py-2 font-semibold text-stone-800" maxLength={60} onChange={(event) => setTitle(event.currentTarget.value)} placeholder="例如：Late Night Loop" value={title} />
          </label>

          <label className="block text-sm font-black text-[#4f2525]">
            描述
            <textarea className="mt-2 h-20 w-full resize-none rounded-[1rem] border-2 border-stone-700/60 bg-white/80 px-3 py-2 font-semibold text-stone-800" maxLength={160} onChange={(event) => setDescription(event.currentTarget.value)} placeholder="写一句这个歌单的用途或氛围" value={description} />
          </label>

          <div className="grid gap-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
            <label className="block text-sm font-black text-[#4f2525]">
              图标
              <input className="mt-2 w-full rounded-[1rem] border-2 border-stone-700/60 bg-white/80 px-3 py-2 text-center text-lg font-semibold text-stone-800" maxLength={16} onChange={(event) => setEmoji(event.currentTarget.value)} value={emoji} />
            </label>

            <PlaylistDropdown label="主题色" onChange={setAccentClass} options={collectionAccentDropdownOptions} value={accentClass} />
          </div>

          <label className="block text-sm font-black text-[#4f2525]">
            歌单封面
            <input accept="image/jpeg,image/png,image/webp" aria-label="歌单封面" className="mt-2 block w-full text-sm font-semibold text-stone-700 file:mr-3 file:rounded-full file:border-2 file:border-stone-700/70 file:bg-[#ffe6ad] file:px-3 file:py-1 file:font-black" onChange={(event) => setCoverFile(event.currentTarget.files?.[0] ?? null)} type="file" />
            <span className="mt-1 block text-xs font-semibold text-stone-500">可选，支持 JPG / PNG / WebP，最大 5MB。</span>
          </label>

          {currentCollection?.coverImageSrc ? <img alt={`${currentCollection.title}当前歌单封面`} className="h-28 w-full rounded-[1rem] border border-[#ead7ce] object-cover" src={currentCollection.coverImageSrc} /> : null}
          {error ? <p className="rounded-[1rem] border-2 border-[#b75d66] bg-[#ffeef1] px-3 py-2 text-sm font-black text-[#7a3d3f]">{error}</p> : null}

          <div className="flex justify-end gap-3">
            <button className="rounded-[1rem] border-2 border-stone-700/60 bg-white px-4 py-2 text-sm font-black text-stone-900" onClick={props.onClose} type="button">
              取消
            </button>
            <button className="rounded-[1rem] border-2 border-stone-700/70 bg-[#f8cfd5] px-4 py-2 text-sm font-black text-stone-900 shadow-[0_4px_0_rgba(112,84,84,0.12)] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
