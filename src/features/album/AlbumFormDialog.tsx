"use client";

import { useEffect, useId, useState } from "react";
import type { Album } from "./types";

export type AlbumFormPayload = {
  coverFile?: File;
  description: string;
  title: string;
};

type AlbumFormDialogProps = {
  album?: Album;
  heading: string;
  onClose: () => void;
  onSubmit: (payload: AlbumFormPayload) => Promise<void>;
  submitErrorMessage: string;
  submitLabel: string;
};

export function AlbumFormDialog({ album, heading, onClose, onSubmit, submitErrorMessage, submitLabel }: AlbumFormDialogProps) {
  const titleId = useId();
  const nameId = useId();
  const noteId = useId();
  const uploadId = useId();
  const [albumName, setAlbumName] = useState(album?.title ?? "");
  const [albumNote, setAlbumNote] = useState(album?.description ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(album?.coverImage ?? null);
  const [nameError, setNameError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl(album?.coverImage ?? null);
      return;
    }

    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [album?.coverImage, coverFile]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#6b3f49]/22 px-4 py-6 backdrop-blur-[2px]">
      <button aria-label={`关闭${heading}`} className="absolute inset-0" onClick={onClose} type="button" />
      <form
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative z-10 w-full max-w-[640px] rounded-[2rem] border-[3px] border-[#6f343b] bg-[#fcf8ef] px-5 py-5 shadow-[0_24px_60px_rgba(111,52,59,0.16)] sm:px-8 sm:py-7"
        onSubmit={async (event) => {
          event.preventDefault();

          const trimmedName = albumName.trim();
          const trimmedNote = albumNote.trim();

          if (!trimmedName) {
            setNameError("请先填写相册名称");
            return;
          }

          setSubmitError("");
          setIsSubmitting(true);

          try {
            await onSubmit({
              title: trimmedName,
              description: trimmedNote,
              coverFile: coverFile ?? undefined,
            });
          } catch (error) {
            setSubmitError(error instanceof Error ? error.message : submitErrorMessage);
            setIsSubmitting(false);
          }
        }}
        role="dialog"
      >
        <div className="relative mb-5 text-center">
          <div aria-hidden="true" className="absolute left-1/2 top-[62%] h-5 w-42 -translate-x-1/2 rounded-full bg-[#f6d6da] sm:h-6 sm:w-52" />
          <h2 id={titleId} className="relative text-[1.95rem] font-black tracking-tight text-[#6f343b] sm:text-[2.75rem]">
            {heading}
          </h2>
        </div>

        <div className="space-y-4 text-[#6f343b]">
          <div>
            <label className="block text-[1.05rem] font-black sm:text-[1.15rem]" htmlFor={nameId}>
              相册名称
            </label>
            <div className="relative mt-2">
              <input
                className="h-14 w-full rounded-full border-[3px] border-[#6f343b] bg-[linear-gradient(90deg,#fff5f6_0%,#fdecef_100%)] px-5 pr-14 text-base text-[#6f343b] outline-none placeholder:text-[#c7a9af] focus:bg-white"
                id={nameId}
                onChange={(event) => {
                  setAlbumName(event.target.value);
                  if (nameError) {
                    setNameError("");
                  }
                }}
                placeholder="请输入相册名称"
                type="text"
                value={albumName}
              />
              <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[1.65rem]">
                🌥️
              </span>
            </div>
            {nameError ? <p className="mt-2 text-sm font-semibold text-[#b14f5d]">{nameError}</p> : null}
          </div>

          <div>
            <label className="block text-[1.05rem] font-black sm:text-[1.15rem]" htmlFor={noteId}>
              备注/留言
            </label>
            <div className="relative mt-2">
              <textarea
                className="min-h-36 w-full rounded-[1.75rem] border-[3px] border-[#6f343b] bg-[linear-gradient(180deg,#fff6f6_0%,#fdeef0_100%)] px-5 py-4 text-sm text-[#6f343b] outline-none placeholder:text-[#c7a9af] focus:bg-white sm:text-base"
                id={noteId}
                onChange={(event) => setAlbumNote(event.target.value)}
                placeholder="写点想留在相册里的话吧"
                rows={4}
                value={albumNote}
              />
              <span aria-hidden="true" className="absolute -left-4 top-13 text-[1.8rem] drop-shadow-[0_3px_0_rgba(255,255,255,0.7)]">
                ⭐
              </span>
              <span aria-hidden="true" className="absolute left-0 bottom-2 text-[1.9rem] drop-shadow-[0_3px_0_rgba(255,255,255,0.7)]">
                🐱
              </span>
              <span aria-hidden="true" className="absolute right-5 top-[-0.7rem] text-[1.7rem]">
                😊
              </span>
              <span aria-hidden="true" className="absolute right-0 top-5 text-[1.8rem]">
                💙
              </span>
              <span aria-hidden="true" className="absolute right-7 bottom-3 text-[1.7rem]">
                😊
              </span>
              <span aria-hidden="true" className="absolute right-18 bottom-3 text-[1.7rem]">
                ❤️
              </span>
              <span aria-hidden="true" className="absolute right-0 bottom-4 text-[1.7rem]">
                🐾
              </span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[1.05rem] font-black sm:text-[1.15rem]">封面上传</p>
            <label aria-label={coverFile ? "重新选择封面" : "点击上传"} className="block cursor-pointer" htmlFor={uploadId} role="button" tabIndex={0}>
              <input
                accept="image/*"
                aria-label="上传本地封面"
                className="sr-only"
                id={uploadId}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setCoverFile(file);
                }}
                type="file"
              />
              <div className="relative min-h-30 overflow-hidden rounded-[1.6rem] border-[3px] border-dashed border-[#6f343b] bg-[#fffdf7] transition hover:-translate-y-0.5 hover:bg-white">
                {coverPreviewUrl ? (
                  <img alt="封面本地预览" className="absolute inset-0 h-full w-full object-cover" src={coverPreviewUrl} />
                ) : (
                  <img alt="封面预览占位" className="absolute inset-0 h-full w-full object-cover opacity-55" src="/album-cover-placeholder.jpeg" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,253,247,0.12)_0%,rgba(255,253,247,0.72)_68%,rgba(255,253,247,0.96)_100%)]" />
                <div className="relative flex min-h-30 flex-col items-center justify-center px-4 py-5 text-center text-[#6f343b]">
                  <span className="mt-2 text-[1.35rem] font-black leading-none sm:text-[1.25rem]">{coverFile ? "重新选择" : "点击上传"}</span>
                  <span className="mt-2 text-sm font-medium text-[#8d6368]">{coverFile ? coverFile.name : "选择本地图片作为相册封面。"}</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {submitError ? <p className="mt-4 text-sm font-semibold text-[#b14f5d]">{submitError}</p> : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <button
            className="min-w-[10.5rem] rounded-full border-[3px] border-[#6f343b] bg-[#f4b2be] px-6 py-2.5 text-[1.15rem] font-black text-[#6f343b] transition hover:-translate-y-0.5 hover:bg-[#f6bec8] disabled:cursor-not-allowed disabled:opacity-70 sm:text-[1.25rem]"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "保存中" : submitLabel}
          </button>
          <button
            className="min-w-[10.5rem] rounded-full border-[3px] border-[#6f343b] bg-[#fcf8ef] px-6 py-2.5 text-[1.15rem] font-black text-[#6f343b] transition hover:-translate-y-0.5 hover:bg-[#fffdf7] sm:text-[1.25rem]"
            onClick={onClose}
            type="button"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
