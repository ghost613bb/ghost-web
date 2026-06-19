"use client";

import { useEffect, useId, useState } from "react";

export type AlbumPhotoUploadPayload = {
  note: string;
  photoFile?: File;
};

type AlbumPhotoUploadDialogProps = {
  initialNote?: string;
  onClose: () => void;
  onSubmit: (payload: AlbumPhotoUploadPayload) => Promise<void>;
  requireFile?: boolean;
  showFileInput?: boolean;
  submitErrorMessage: string;
  submitLabel?: string;
  title: string;
};

export function AlbumPhotoUploadDialog({
  initialNote = "",
  onClose,
  onSubmit,
  requireFile = true,
  showFileInput = true,
  submitErrorMessage,
  submitLabel = "上传照片",
  title,
}: AlbumPhotoUploadDialogProps) {
  const titleId = useId();
  const noteId = useId();
  const uploadId = useId();
  const [photoNote, setPhotoNote] = useState(initialNote);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [photoFile]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#6b3f49]/22 px-4 py-6 backdrop-blur-[2px]">
      <button aria-label="关闭上传照片" className="absolute inset-0" onClick={onClose} type="button" />
      <form
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative z-10 w-full max-w-[640px] rounded-[2rem] border-[3px] border-[#6f343b] bg-[#fcf8ef] px-5 py-5 shadow-[0_24px_60px_rgba(111,52,59,0.16)] sm:px-8 sm:py-7"
        onSubmit={async (event) => {
          event.preventDefault();

          if (requireFile && !photoFile) {
            setSubmitError("请先选择照片");
            return;
          }

          setSubmitError("");
          setIsSubmitting(true);

          try {
            await onSubmit({
              note: photoNote.trim(),
              photoFile: photoFile ?? undefined,
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
            {title}
          </h2>
        </div>

        <div className="space-y-4 text-[#6f343b]">
          <div>
            <label className="block text-[1.05rem] font-black sm:text-[1.15rem]" htmlFor={noteId}>
              照片备注
            </label>
            <div className="relative mt-2">
              <textarea
                className="min-h-32 w-full rounded-[1.75rem] border-[3px] border-[#6f343b] bg-[linear-gradient(180deg,#fff6f6_0%,#fdeef0_100%)] px-5 py-4 text-sm text-[#6f343b] outline-none placeholder:text-[#c7a9af] focus:bg-white sm:text-base"
                id={noteId}
                onChange={(event) => setPhotoNote(event.target.value)}
                placeholder="写一点关于这张照片的心情吧"
                rows={4}
                value={photoNote}
              />
            </div>
          </div>

          {showFileInput ? (
            <div>
              <p className="mb-2 text-[1.05rem] font-black sm:text-[1.15rem]">照片文件{requireFile ? "" : "（可选）"}</p>
              <label className="block cursor-pointer" htmlFor={uploadId}>
                <input
                  accept="image/*"
                  aria-label="上传照片文件"
                  className="sr-only"
                  id={uploadId}
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setPhotoFile(file);
                  }}
                  type="file"
                />
                <div className="relative min-h-40 overflow-hidden rounded-[1.6rem] border-[3px] border-dashed border-[#6f343b] bg-[#fffdf7] transition hover:-translate-y-0.5 hover:bg-white">
                  {photoPreviewUrl ? <img alt="照片本地预览" className="absolute inset-0 h-full w-full object-cover" src={photoPreviewUrl} /> : null}
                  {photoPreviewUrl ? <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,253,247,0.18)_0%,rgba(255,253,247,0.74)_68%,rgba(255,253,247,0.96)_100%)]" /> : null}
                  <div className="relative flex min-h-40 flex-col items-center justify-center px-4 py-5 text-center text-[#6f343b]">
                    <span className="mt-2 text-[1.35rem] font-black leading-none sm:text-[1.25rem]">{photoFile ? "重新选择" : "点击上传"}</span>
                    <span className="mt-2 text-sm font-medium text-[#8d6368]">{photoFile ? photoFile.name : "选择本地图片添加到相册。"}</span>
                  </div>
                </div>
              </label>
            </div>
          ) : null}
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
