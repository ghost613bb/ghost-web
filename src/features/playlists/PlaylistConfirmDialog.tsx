"use client";

import { X } from "lucide-react";

type PlaylistConfirmDialogProps = {
  body?: string;
  confirmLabel?: string;
  error?: string | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
};

export function PlaylistConfirmDialog({ body, confirmLabel = "确认删除", error, isSubmitting = false, onCancel, onConfirm, title }: PlaylistConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#4f2525]/35 px-4 backdrop-blur-sm" onClick={isSubmitting ? undefined : onCancel} role="presentation">
      <div
        aria-label={title}
        aria-modal="true"
        className="w-full max-w-sm rounded-[1.7rem] border-[2.5px] border-stone-700/80 bg-[#fffaf3] p-5 shadow-[0_24px_60px_rgba(79,37,37,0.2)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a54454]">Confirm Action</p>
            <h2 className="text-2xl font-black text-[#4f2525]">{title}</h2>
            {body ? <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">{body}</p> : null}
          </div>
          <button aria-label={`关闭${title}`} className="rounded-full p-1 text-[#4f2525] transition hover:bg-[#f8cfd5] disabled:cursor-not-allowed disabled:opacity-50" disabled={isSubmitting} onClick={onCancel} type="button">
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        {error ? <p className="rounded-[1rem] border-2 border-[#b75d66] bg-[#ffeef1] px-3 py-2 text-sm font-black text-[#7a3d3f]" role="alert">{error}</p> : null}

        <div className="mt-5 flex justify-end gap-3">
          <button className="rounded-[1rem] border-2 border-stone-700/60 bg-white px-4 py-2 text-sm font-black text-stone-900 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} onClick={onCancel} type="button">
            取消
          </button>
          <button className="rounded-[1rem] border-2 border-[#b75d66] bg-[#f8cfd5] px-4 py-2 text-sm font-black text-[#7a3d3f] shadow-[0_4px_0_rgba(112,84,84,0.12)] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} onClick={onConfirm} type="button">
            {isSubmitting ? "处理中..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
