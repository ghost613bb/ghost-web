"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { useState } from "react";

const fallbackPreviewText = "开始写一点今天的小事。";

export function ThoughtRichTextDraftPage() {
  const [html, setHtml] = useState("");
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setHtml(editor.getHTML());
    },
  });
  const toolbarButtonClass =
    "rounded-full border border-[#ead7ce] bg-[#fffaf4] px-3.5 py-2 text-sm font-black text-[#7a4f55] shadow-[0_8px_18px_rgba(122,79,85,0.08)] transition hover:-translate-y-0.5 hover:border-[#e8b7c0] hover:bg-[#fff1f4] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:border-[#ead7ce] disabled:hover:bg-[#fffaf4]";
  const editorMissing = !editor;
  const canUndo = editor ? editor.can().undo() : false;
  const canRedo = editor ? editor.can().redo() : false;
  const previewHtml = html.trim() || fallbackPreviewText;

  return (
    <main className="album-page-scrollbar h-dvh overflow-y-auto bg-[#f7f1e8] px-3 py-3 text-[#4c2b2d] sm:px-5 sm:py-4">
      <div className="mx-auto max-w-[1360px]">
        <section className="relative overflow-hidden rounded-[2.2rem] border-[2px] border-[#e4d0bd] bg-[#fffaf0] p-3 shadow-[0_24px_60px_rgba(135,95,76,0.14)] sm:p-4 lg:pl-[5.6rem]">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-[4.3rem] border-r border-[#ead9c6] bg-[linear-gradient(90deg,#fff8ea_0%,#f7ead9_100%)] lg:block" />
          <div aria-hidden="true" className="absolute left-[3.62rem] top-9 hidden h-[76%] w-5 flex-col justify-between lg:flex">
            {Array.from({ length: 8 }).map((_, index) => (
              <span className="h-3 w-10 rounded-full bg-[linear-gradient(90deg,#8a572f_0%,#d19b62_48%,#7a4829_100%)] shadow-[0_2px_5px_rgba(74,45,24,0.28)]" key={index} />
            ))}
          </div>

          <div className="rounded-[1.8rem] border border-[#eadccf] bg-[#fffdf8] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)] sm:p-4">
            <header className="mb-3 flex flex-col gap-3 border-b border-[#efe4d8] pb-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Link className="inline-flex items-center rounded-full px-2 py-1 text-sm font-black text-[#d97891] transition hover:-translate-x-0.5 hover:bg-[#fff2f5]" href="/thoughts">
                  返回碎碎念
                </Link>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-[#4c2b2d] sm:text-[2rem]">新建碎碎念</h1>
              </div>
              <p className="rounded-full border border-[#f0d8dd] bg-[#fff4f6] px-4 py-2 text-sm font-black text-[#8a5b62] shadow-[0_8px_20px_rgba(120,90,75,0.05)]">
                当前为富文本编辑体验预览，暂不保存。
              </p>
            </header>

            <nav aria-label="富文本工具栏" className="mb-3 flex flex-wrap items-center gap-2 rounded-[1rem] border border-[#eee2d4] bg-[#fffaf3] p-2 shadow-[0_8px_20px_rgba(120,90,75,0.05)]">
              <button className={toolbarButtonClass} disabled={editorMissing} onClick={() => editor?.chain().focus().setParagraph().run()} type="button">
                段落
              </button>
              <button className={toolbarButtonClass} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} type="button">
                H2
              </button>
              <button className={toolbarButtonClass} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} type="button">
                H3
              </button>
              <button className={toolbarButtonClass} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleBold().run()} type="button">
                加粗
              </button>
              <button className={toolbarButtonClass} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleItalic().run()} type="button">
                斜体
              </button>
              <button className={toolbarButtonClass} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleBulletList().run()} type="button">
                无序列表
              </button>
              <button className={toolbarButtonClass} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleBlockquote().run()} type="button">
                引用
              </button>
              <button className={toolbarButtonClass} disabled={!canUndo} onClick={() => editor?.chain().focus().undo().run()} type="button">
                撤销
              </button>
              <button className={toolbarButtonClass} disabled={!canRedo} onClick={() => editor?.chain().focus().redo().run()} type="button">
                重做
              </button>
            </nav>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <section aria-label="碎碎念富文本编辑纸张" className="relative min-h-[605px] overflow-hidden rounded-[1.2rem] border border-[#eee3d5] bg-[repeating-linear-gradient(0deg,#fffdf7_0,#fffdf7_31px,#efe6d8_32px)] px-5 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)] sm:px-7 sm:py-6">
                <div className="min-h-[520px] rounded-[1rem] border border-dashed border-[#ecd9cd] bg-white/45 p-4 text-[1rem] font-semibold leading-8 text-[#5b4347] outline-none">
                  {editor ? <EditorContent editor={editor} /> : <p>富文本编辑器加载中...</p>}
                </div>
              </section>

              <aside aria-label="碎碎念富文本预览纸张" className="rounded-[1.2rem] border border-[#eee0d4] bg-[#fff9f4] p-4 shadow-[0_12px_28px_rgba(129,92,75,0.08)]">
                <p className="mb-3 rounded-full bg-[#f8cfd5] px-3 py-1.5 text-center text-xs font-black text-[#7a3f4a] shadow-[0_5px_12px_rgba(132,82,90,0.08)]">本地预览</p>
                <article className="min-h-[360px] rounded-[1rem] border border-[#eaded1] bg-[repeating-linear-gradient(0deg,#fffdf7_0,#fffdf7_31px,#efe6d8_32px)] px-5 py-5 text-[1rem] font-semibold leading-8 text-[#5b4347] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)]" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
