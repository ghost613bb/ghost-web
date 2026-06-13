"use client";

import { useState } from "react";
import { Disc3, MessageCircle } from "lucide-react";
import type { PlaylistNote, PlaylistSong } from "@/data/playlists";
import type { PlaylistDataSource } from "./service";

type CommentPlayerPanelProps = {
  dataSource?: PlaylistDataSource;
  featuredSong: PlaylistSong;
  isAdminUnlocked: boolean;
  notes: PlaylistNote[];
  onCreatedNote: (note: PlaylistNote) => void;
  onDeletedNote: (noteId: string) => void;
  onUpdatedNote: (note: PlaylistNote) => void;
};

export function CommentPlayerPanel({ dataSource, featuredSong, isAdminUnlocked, notes, onCreatedNote, onDeletedNote, onUpdatedNote }: CommentPlayerPanelProps) {
  const [author, setAuthor] = useState("Name");
  const [avatar, setAvatar] = useState("🎧");
  const [content, setContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingAuthor, setEditingAuthor] = useState("Name");
  const [editingAvatar, setEditingAvatar] = useState("🎧");
  const [editingContent, setEditingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingNoteId, setUpdatingNoteId] = useState<string | null>(null);
  const isCommentDisabled = dataSource !== "supabase" || !isAdminUnlocked;
  const visibleNotes = notes.filter((note) => note.songId === featuredSong.id);
  const disabledMessage = dataSource !== "supabase" ? "当前为本地 fallback，歌曲评论需要 Supabase 数据源。" : "请先解锁 Admin 管理模式，再提交评论。";

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
      const response = await fetch(`/api/playlists/songs/${encodeURIComponent(featuredSong.id)}/notes`, {
        body: JSON.stringify({
          author,
          avatar,
          content,
        }),
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = (await response.json()) as { error?: string; note?: PlaylistNote };

      if (!response.ok || !data.note) {
        throw new Error(data.error ?? "新增歌曲评论失败");
      }

      onCreatedNote(data.note);
      setContent("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "新增歌曲评论失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingNote = (note: PlaylistNote) => {
    setEditingNoteId(note.id);
    setEditingAuthor(note.author);
    setEditingAvatar(note.avatar);
    setEditingContent(note.content);
    setError(null);
  };

  const handleUpdateNote = async (noteId: string) => {
    setError(null);

    if (!editingContent.trim()) {
      setError("请输入评论内容");
      return;
    }

    setUpdatingNoteId(noteId);

    try {
      const response = await fetch(`/api/playlists/songs/${encodeURIComponent(featuredSong.id)}/notes/${encodeURIComponent(noteId)}`, {
        body: JSON.stringify({
          author: editingAuthor,
          avatar: editingAvatar,
          content: editingContent,
        }),
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });
      const data = (await response.json()) as { error?: string; note?: PlaylistNote };

      if (!response.ok || !data.note) {
        throw new Error(data.error ?? "编辑歌曲评论失败");
      }

      onUpdatedNote(data.note);
      setEditingNoteId(null);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "编辑歌曲评论失败");
    } finally {
      setUpdatingNoteId(null);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm("确定删除这条评论吗？")) {
      return;
    }

    setError(null);
    setUpdatingNoteId(noteId);

    try {
      const response = await fetch(`/api/playlists/songs/${encodeURIComponent(featuredSong.id)}/notes/${encodeURIComponent(noteId)}`, {
        credentials: "same-origin",
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "删除歌曲评论失败");
      }

      onDeletedNote(noteId);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "删除歌曲评论失败");
    } finally {
      setUpdatingNoteId(null);
    }
  };

  return (
    <aside aria-label="耳机留言播放器" className="space-y-4 xl:sticky xl:top-5 xl:self-start">
      <section className="rounded-[1.7rem] border-[2.5px] border-stone-700/80 bg-[#fff4d8] p-4 shadow-[0_14px_28px_rgba(112,84,84,0.09)]">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#aa6a70] bg-[#fbd4d9] text-lg">
            <Disc3 aria-hidden="true" className="h-5 w-5 text-[#7a3d3f]" />
          </span>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#4f2525]">Discussion & Player</h2>
            <p className="text-xs font-bold text-stone-600">{featuredSong.title}</p>
          </div>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_4.5rem]">
            <label className="sr-only" htmlFor="playlist-comment-author">
              评论昵称
            </label>
            <input className="rounded-[1rem] border-2 border-stone-700/50 bg-white/70 px-3 py-2 text-sm font-semibold text-stone-800" disabled={isCommentDisabled || isSubmitting} id="playlist-comment-author" maxLength={40} onChange={(event) => setAuthor(event.currentTarget.value)} placeholder="Name" value={author} />
            <label className="sr-only" htmlFor="playlist-comment-avatar">
              评论头像
            </label>
            <input className="rounded-[1rem] border-2 border-stone-700/50 bg-white/70 px-3 py-2 text-center text-sm font-semibold text-stone-800" disabled={isCommentDisabled || isSubmitting} id="playlist-comment-avatar" maxLength={16} onChange={(event) => setAvatar(event.currentTarget.value)} value={avatar} />
          </div>
          <label className="sr-only" htmlFor="playlist-comment">
            添加可爱评论
          </label>
          <textarea className="h-20 w-full resize-none rounded-[1.2rem] border-2 border-stone-700/60 bg-white/70 p-3 text-sm font-semibold text-stone-800 placeholder:text-stone-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isCommentDisabled || isSubmitting} id="playlist-comment" maxLength={280} onChange={(event) => setContent(event.currentTarget.value)} placeholder={isCommentDisabled ? disabledMessage : "Add a cute comment..."} value={content} />
          {isCommentDisabled ? <p className="text-xs font-black text-[#7a3d3f]">{disabledMessage}</p> : null}
          {error ? <p className="rounded-[1rem] border-2 border-[#b75d66] bg-[#ffeef1] px-3 py-2 text-xs font-black text-[#7a3d3f]">{error}</p> : null}
          <div className="flex justify-end">
            <button className="rounded-[1rem] border-2 border-stone-700/70 bg-[#ffe0a8] px-4 py-1.5 text-sm font-black shadow-[0_4px_0_rgba(112,84,84,0.12)] disabled:cursor-not-allowed disabled:opacity-60" disabled={isCommentDisabled || isSubmitting} type="submit">
              {isSubmitting ? "Commenting..." : "Comment"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[1.7rem] border-[2.5px] border-stone-700/80 bg-[#fffaf3] p-4 shadow-[0_14px_28px_rgba(112,84,84,0.09)]">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle aria-hidden="true" className="h-5 w-5 text-[#9b4d57]" />
          <h2 className="text-lg font-black text-[#4f2525]">耳机留言</h2>
        </div>
        {visibleNotes.length === 0 ? (
          <div className="rounded-[1rem] border border-[#efd7d3] bg-[#fff7f0] px-4 py-5 text-center">
            <p className="text-sm font-black text-[#4f2525]">这片声波还没有回信。</p>
            <p className="mt-1 text-xs font-semibold text-stone-500">写一句，让它有第一个回声。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleNotes.map((note) => {
              const isEditing = editingNoteId === note.id;
              const isUpdating = updatingNoteId === note.id;

              return (
                <article className="relative rounded-[1rem] border border-[#efd7d3] bg-[#fff7f0] p-3 pl-11" key={note.id}>
                  <span aria-hidden="true" className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-full border-2 border-[#c4878c] bg-[#fde2e7] text-sm">
                    {isEditing ? editingAvatar : note.avatar}
                  </span>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_4rem]">
                        <input aria-label="编辑评论昵称" className="rounded-[0.85rem] border border-[#efd7d3] bg-white/80 px-2 py-1 text-sm font-semibold text-stone-800" maxLength={40} onChange={(event) => setEditingAuthor(event.currentTarget.value)} value={editingAuthor} />
                        <input aria-label="编辑评论头像" className="rounded-[0.85rem] border border-[#efd7d3] bg-white/80 px-2 py-1 text-center text-sm font-semibold text-stone-800" maxLength={16} onChange={(event) => setEditingAvatar(event.currentTarget.value)} value={editingAvatar} />
                      </div>
                      <textarea aria-label="编辑评论内容" className="h-20 w-full resize-none rounded-[0.95rem] border border-[#efd7d3] bg-white/80 px-2 py-1 text-sm font-semibold text-stone-800" maxLength={280} onChange={(event) => setEditingContent(event.currentTarget.value)} value={editingContent} />
                      <div className="flex justify-end gap-2">
                        <button className="rounded-full border border-[#efd7d3] bg-white px-2.5 py-1 text-xs font-black text-[#4f2525]" disabled={isUpdating} onClick={() => setEditingNoteId(null)} type="button">
                          取消
                        </button>
                        <button className="rounded-full border border-[#c4878c] bg-[#ffe0a8] px-2.5 py-1 text-xs font-black text-[#4f2525] disabled:opacity-60" disabled={isUpdating} onClick={() => void handleUpdateNote(note.id)} type="button">
                          {isUpdating ? "保存中..." : "保存"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-black text-[#4f2525]">
                          {note.author} <span className="text-xs font-bold text-stone-500">{note.time}</span>
                        </p>
                        {isAdminUnlocked ? (
                          <div className="flex shrink-0 gap-1">
                            <button className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-black text-[#7a3d3f]" disabled={isUpdating} onClick={() => startEditingNote(note)} type="button">
                              编辑
                            </button>
                            <button className="rounded-full bg-[#ffeef1] px-2 py-0.5 text-xs font-black text-[#9b4d57]" disabled={isUpdating} onClick={() => void handleDeleteNote(note.id)} type="button">
                              删除
                            </button>
                          </div>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm font-semibold leading-5 text-stone-700">{note.content}</p>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </aside>
  );
}
