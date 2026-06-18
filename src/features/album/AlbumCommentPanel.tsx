"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { PlaylistConfirmDialog } from "@/features/playlists/PlaylistConfirmDialog";
import type { AlbumComment } from "./types";

type AlbumCommentPanelProps = {
  albumId: string;
  comments: AlbumComment[];
  isAdminUnlocked: boolean;
  onCreatedComment: (comment: AlbumComment) => void;
  onDeletedComment: (commentId: string) => void;
};

export function AlbumCommentPanel({ albumId, comments, isAdminUnlocked, onCreatedComment, onDeletedComment }: AlbumCommentPanelProps) {
  const [author, setAuthor] = useState("Name");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDeleteCommentId, setPendingDeleteCommentId] = useState<string | null>(null);
  const [deleteCommentError, setDeleteCommentError] = useState<string | null>(null);
  const [updatingCommentId, setUpdatingCommentId] = useState<string | null>(null);
  const isCommentDisabled = !albumId || !isAdminUnlocked;
  const disabledMessage = !albumId ? "请先选择一个相册。" : "请先解锁 Admin 管理模式，再提交评论。";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isCommentDisabled) {
      setError(disabledMessage);
      return;
    }

    if (!content.trim()) {
      setError("请输入评论内容");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/albums/${encodeURIComponent(albumId)}/comments`, {
        body: JSON.stringify({ author, content }),
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = (await response.json()) as { comment?: AlbumComment; error?: string };

      if (!response.ok || !data.comment) {
        throw new Error(data.error ?? "新增相册评论失败");
      }

      onCreatedComment(data.comment);
      setContent("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "新增相册评论失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteComment = async () => {
    if (!pendingDeleteCommentId) {
      return;
    }

    setDeleteCommentError(null);
    setUpdatingCommentId(pendingDeleteCommentId);

    try {
      const response = await fetch(`/api/albums/${encodeURIComponent(albumId)}/comments/${encodeURIComponent(pendingDeleteCommentId)}`, {
        credentials: "same-origin",
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "删除相册评论失败");
      }

      onDeletedComment(pendingDeleteCommentId);
      setPendingDeleteCommentId(null);
    } catch (deleteError) {
      setDeleteCommentError(deleteError instanceof Error ? deleteError.message : "删除相册评论失败");
    } finally {
      setUpdatingCommentId(null);
    }
  };

  return (
    <div className="space-y-5">
      {pendingDeleteCommentId ? <PlaylistConfirmDialog body="确定删除这条评论吗？" confirmLabel="确认删除" error={deleteCommentError} isSubmitting={Boolean(updatingCommentId)} onCancel={() => setPendingDeleteCommentId(null)} onConfirm={() => void confirmDeleteComment()} title="删除相册评论" /> : null}
      <section className="rounded-[1.5rem] border border-[#eee3d6] bg-[#fcf7f0] p-4">
        <div className="mb-3 flex items-center gap-2">
          <MessageCircle aria-hidden="true" className="h-5 w-5 text-[#9b4d57]" />
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9a7f74]">Album Comments</p>
            <p className="text-sm font-semibold text-[#5b4347]">给这本相册留一句话。</p>
          </div>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_4.5rem]">
            <label className="sr-only" htmlFor="album-comment-author">
              评论昵称
            </label>
            <input className="rounded-[1rem] border-2 border-stone-700/50 bg-white/70 px-3 py-2 text-sm font-semibold text-stone-800" disabled={isCommentDisabled || isSubmitting} id="album-comment-author" maxLength={40} onChange={(event) => setAuthor(event.currentTarget.value)} placeholder="Name" value={author} />
            <div aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full border-2 border-stone-700/50 bg-[#fff3dc] text-xl">
              📷
            </div>
          </div>
          <label className="sr-only" htmlFor="album-comment-content">
            添加相册评论
          </label>
          <textarea className="h-24 w-full resize-none rounded-[1.2rem] border-2 border-stone-700/60 bg-white/70 p-3 text-sm font-semibold text-stone-800 placeholder:text-stone-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isCommentDisabled || isSubmitting} id="album-comment-content" maxLength={280} onChange={(event) => setContent(event.currentTarget.value)} placeholder={isCommentDisabled ? disabledMessage : "写一句留给这本相册的话..."} value={content} />
          {isCommentDisabled ? <p className="text-xs font-black text-[#7a3d3f]">{disabledMessage}</p> : null}
          {error ? <p className="rounded-[1rem] border-2 border-[#b75d66] bg-[#ffeef1] px-3 py-2 text-xs font-black text-[#7a3d3f]">{error}</p> : null}
          <div className="flex justify-end">
            <button className="rounded-[1rem] border-2 border-stone-700/70 bg-[#ffe0a8] px-4 py-1.5 text-sm font-black shadow-[0_4px_0_rgba(112,84,84,0.12)] disabled:cursor-not-allowed disabled:opacity-60" disabled={isCommentDisabled || isSubmitting} type="submit">
              {isSubmitting ? "评论中..." : "发表评论"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[1.5rem] border border-[#eee3d6] bg-white p-4 shadow-[0_10px_24px_rgba(149,116,121,0.06)]">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle aria-hidden="true" className="h-5 w-5 text-[#9b4d57]" />
          <h4 className="text-base font-black text-[#4f2525]">相册留言</h4>
        </div>
        {comments.length === 0 ? (
          <div className="rounded-[1rem] border border-[#efd7d3] bg-[#fff7f0] px-4 py-5 text-center">
            <p className="text-sm font-black text-[#4f2525]">这本相册还没有留言。</p>
            <p className="mt-1 text-xs font-semibold text-stone-500">写一句，让它有第一条回声。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => {
              const isUpdating = updatingCommentId === comment.id;

              return (
                <article className="relative rounded-[1rem] border border-[#efd7d3] bg-[#fff7f0] p-3 pl-14" key={comment.id}>
                  <span aria-hidden="true" className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-[#fde2e7] text-lg shadow-[0_3px_0_rgba(196,135,140,0.12)]">
                    {comment.avatar}
                  </span>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-black text-[#4f2525]">
                      {comment.author} <span className="text-xs font-bold text-stone-500">{comment.time}</span>
                    </p>
                    {isAdminUnlocked ? (
                      <button className="rounded-full bg-[#ffeef1] px-2 py-0.5 text-xs font-black text-[#9b4d57]" disabled={isUpdating} onClick={() => {
                        setDeleteCommentError(null);
                        setPendingDeleteCommentId(comment.id);
                      }} type="button">
                        删除
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm font-semibold leading-6 text-stone-700">{comment.content}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
