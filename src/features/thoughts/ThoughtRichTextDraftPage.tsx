"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { useState } from "react";

const fallbackPreviewText = "开始写一点今天的小事。";
const toolbarButtonBaseClass =
  "rounded-full border px-3.5 py-2 text-sm font-black shadow-[0_8px_18px_rgba(122,79,85,0.08)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0";
const inactiveToolbarButtonClass =
  "border-[#ead7ce] bg-[#fffaf4] text-[#7a4f55] hover:border-[#e8b7c0] hover:bg-[#fff1f4] disabled:hover:border-[#ead7ce] disabled:hover:bg-[#fffaf4]";
const activeToolbarButtonClass = "border-[#d97891] bg-[#f8cfd5] text-[#7a3f4a] hover:border-[#d97891] hover:bg-[#f8cfd5]";
const richTextFrameClass =
  "[&_blockquote]:my-3 [&_blockquote]:rounded-r-[1rem] [&_blockquote]:border-l-4 [&_blockquote]:border-[#f0b5c0] [&_blockquote]:bg-[#fff6f8]/80 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:font-semibold [&_h1]:my-3 [&_h1]:text-[1.65rem] [&_h1]:font-black [&_h1]:leading-10 [&_h1]:tracking-[0.03em] [&_h2]:my-3 [&_h2]:text-[1.35rem] [&_h2]:font-black [&_h2]:leading-9 [&_h2]:tracking-[0.03em] [&_h3]:my-2 [&_h3]:text-[1.15rem] [&_h3]:font-black [&_h3]:leading-8 [&_h4]:my-2 [&_h4]:text-[1.05rem] [&_h4]:font-black [&_h4]:leading-8 [&_h5]:my-2 [&_h5]:text-[0.95rem] [&_h5]:font-black [&_h5]:leading-7 [&_li]:my-1 [&_li]:pl-1 [&_p]:my-2 [&_p]:leading-8 [&_strong]:font-black [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6";

type ToolbarState = {
  canUndo: boolean;
  isBlockquote: boolean;
  isBold: boolean;
  isBulletList: boolean;
  isH1: boolean;
  isH2: boolean;
  isH3: boolean;
  isH4: boolean;
  isH5: boolean;
  isItalic: boolean;
};

const defaultToolbarState: ToolbarState = {
  canUndo: false,
  isBlockquote: false,
  isBold: false,
  isBulletList: false,
  isH1: false,
  isH2: false,
  isH3: false,
  isH4: false,
  isH5: false,
  isItalic: false,
};

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
  const toolbarState =
    useEditorState({
      editor,
      selector: ({ editor }): ToolbarState => {
        if (!editor) {
          return defaultToolbarState;
        }

        return {
          canUndo: editor.can().undo(),
          isBlockquote: editor.isActive("blockquote"),
          isBold: editor.isActive("bold"),
          isBulletList: editor.isActive("bulletList"),
          isH1: editor.isActive("heading", { level: 1 }),
          isH2: editor.isActive("heading", { level: 2 }),
          isH3: editor.isActive("heading", { level: 3 }),
          isH4: editor.isActive("heading", { level: 4 }),
          isH5: editor.isActive("heading", { level: 5 }),
          isItalic: editor.isActive("italic"),
        };
      },
    }) ?? defaultToolbarState;
  const editorMissing = !editor;
  const previewHtml = html.trim() || fallbackPreviewText;
  const toolbarButtonClass = (active = false) => `${toolbarButtonBaseClass} ${active ? activeToolbarButtonClass : inactiveToolbarButtonClass}`;

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
              <button aria-pressed={toolbarState.isH1} className={toolbarButtonClass(toolbarState.isH1)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} type="button">
                H1
              </button>
              <button aria-pressed={toolbarState.isH2} className={toolbarButtonClass(toolbarState.isH2)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} type="button">
                H2
              </button>
              <button aria-pressed={toolbarState.isH3} className={toolbarButtonClass(toolbarState.isH3)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} type="button">
                H3
              </button>
              <button aria-pressed={toolbarState.isH4} className={toolbarButtonClass(toolbarState.isH4)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()} type="button">
                H4
              </button>
              <button aria-pressed={toolbarState.isH5} className={toolbarButtonClass(toolbarState.isH5)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleHeading({ level: 5 }).run()} type="button">
                H5
              </button>
              <button aria-pressed={toolbarState.isBold} className={toolbarButtonClass(toolbarState.isBold)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleBold().run()} type="button">
                加粗
              </button>
              <button aria-pressed={toolbarState.isItalic} className={toolbarButtonClass(toolbarState.isItalic)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleItalic().run()} type="button">
                斜体
              </button>
              <button aria-pressed={toolbarState.isBulletList} className={toolbarButtonClass(toolbarState.isBulletList)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleBulletList().run()} type="button">
                无序列表
              </button>
              <button aria-pressed={toolbarState.isBlockquote} className={toolbarButtonClass(toolbarState.isBlockquote)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleBlockquote().run()} type="button">
                引用
              </button>
              <button className={toolbarButtonClass()} disabled={!toolbarState.canUndo} onClick={() => editor?.chain().focus().undo().run()} type="button">
                撤销
              </button>
            </nav>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <section aria-label="碎碎念富文本编辑纸张" className="relative min-h-[605px] overflow-hidden rounded-[1.2rem] border border-[#eee3d5] bg-[repeating-linear-gradient(0deg,#fffdf7_0,#fffdf7_31px,#efe6d8_32px)] px-5 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)] sm:px-7 sm:py-6">
                <div className={`min-h-[520px] rounded-[1rem] border border-dashed border-[#ecd9cd] bg-white/45 p-4 text-[1rem] font-normal leading-8 text-[#5b4347] outline-none ${richTextFrameClass}`} data-testid="thought-rich-text-editor-frame">
                  {editor ? <EditorContent editor={editor} /> : <p>富文本编辑器加载中...</p>}
                </div>
              </section>

              <aside aria-label="碎碎念富文本预览纸张" className="rounded-[1.2rem] border border-[#eee0d4] bg-[#fff9f4] p-4 shadow-[0_12px_28px_rgba(129,92,75,0.08)]">
                <p className="mb-3 rounded-full bg-[#f8cfd5] px-3 py-1.5 text-center text-xs font-black text-[#7a3f4a] shadow-[0_5px_12px_rgba(132,82,90,0.08)]">本地预览</p>
                <article className={`min-h-[360px] rounded-[1rem] border border-[#eaded1] bg-[repeating-linear-gradient(0deg,#fffdf7_0,#fffdf7_31px,#efe6d8_32px)] px-5 py-5 text-[1rem] font-normal leading-8 text-[#5b4347] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)] ${richTextFrameClass}`} data-testid="thought-rich-text-preview-frame" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
