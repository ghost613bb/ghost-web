"use client";

import Color from "@tiptap/extension-color";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, ChevronDown, Italic, List, Palette, Strikethrough, Type, Underline as UnderlineIcon, Undo2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const toolbarButtonBaseClass =
  "inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-[0.85rem] border px-2.5 text-sm font-black shadow-[0_8px_18px_rgba(122,79,85,0.08)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0";
const toolbarIconButtonClass = "w-10 px-0";
const inactiveToolbarButtonClass =
  "border-[#ead7ce] bg-[#fffaf4] text-[#7a4f55] hover:border-[#e8b7c0] hover:bg-[#fff1f4] disabled:hover:border-[#ead7ce] disabled:hover:bg-[#fffaf4]";
const activeToolbarButtonClass = "border-[#d97891] bg-[#f8cfd5] text-[#7a3f4a] hover:border-[#d97891] hover:bg-[#f8cfd5]";
const toolbarMenuClass = "absolute left-0 top-12 z-20 min-w-28 overflow-hidden rounded-[0.9rem] border border-[#ead7ce] bg-[#fffdf8] p-1 shadow-[0_18px_34px_rgba(122,79,85,0.16)]";
const toolbarMenuItemClass = "flex w-full items-center gap-2 rounded-[0.7rem] px-3 py-2 text-left text-sm font-black text-[#6f4b51] transition hover:bg-[#fff1f4]";
const richTextFrameClass =
  "[&_.ProseMirror-focused]:outline-none [&_.ProseMirror]:outline-none [&_blockquote]:my-3 [&_blockquote]:rounded-r-[1rem] [&_blockquote]:border-l-4 [&_blockquote]:border-[#f0b5c0] [&_blockquote]:bg-[#fff6f8]/80 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:font-semibold [&_h1]:my-3 [&_h1]:text-[1.65rem] [&_h1]:font-black [&_h1]:leading-10 [&_h1]:tracking-[0.03em] [&_h2]:my-3 [&_h2]:text-[1.35rem] [&_h2]:font-black [&_h2]:leading-9 [&_h2]:tracking-[0.03em] [&_h3]:my-2 [&_h3]:text-[1.15rem] [&_h3]:font-black [&_h3]:leading-8 [&_h4]:my-2 [&_h4]:text-[1.05rem] [&_h4]:font-black [&_h4]:leading-8 [&_h5]:my-2 [&_h5]:text-[0.95rem] [&_h5]:font-black [&_h5]:leading-7 [&_li]:my-1 [&_li]:pl-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_p]:leading-8 [&_s]:line-through [&_s]:decoration-2 [&_strong]:font-black [&_u]:underline [&_u]:decoration-2 [&_u]:underline-offset-4 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul[data-type='taskList']]:my-3 [&_ul[data-type='taskList']]:list-none [&_ul[data-type='taskList']]:pl-1 [&_ul[data-type='taskList']_li[data-checked]]:flex [&_ul[data-type='taskList']_li[data-checked]]:items-start [&_ul[data-type='taskList']_li[data-checked]]:gap-2 [&_ul[data-type='taskList']_li[data-checked]]:pl-0 [&_ul[data-type='taskList']_li[data-checked]>label]:mt-1 [&_ul[data-type='taskList']_li[data-checked]>div]:flex-1 [&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:h-4 [&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:w-4 [&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:accent-[#d97891] [&_[data-type='taskItem']]:flex [&_[data-type='taskItem']]:items-start [&_[data-type='taskItem']]:gap-2 [&_[data-type='taskItem']]:pl-0 [&_[data-type='taskItem']_label]:mt-1 [&_[data-type='taskItem']_input]:h-4 [&_[data-type='taskItem']_input]:w-4 [&_[data-type='taskItem']_input]:accent-[#d97891] [&_[data-type='taskList']]:my-3 [&_[data-type='taskList']]:list-none [&_[data-type='taskList']]:pl-1";

const headingLevels = [1, 2, 3, 4, 5] as const;
const colorOptions = [
  { label: "默认", value: null, swatch: "#5b4347" },
  { label: "深棕", value: "#5b4347", swatch: "#5b4347" },
  { label: "粉色", value: "#d97891", swatch: "#d97891" },
  { label: "蓝色", value: "#4f79a8", swatch: "#4f79a8" },
  { label: "绿色", value: "#5f8a68", swatch: "#5f8a68" },
  { label: "黄色", value: "#b8860b", swatch: "#b8860b" },
] as const;

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
  isOrderedList: boolean;
  isStrike: boolean;
  isTaskList: boolean;
  isUnderline: boolean;
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
  isOrderedList: false,
  isStrike: false,
  isTaskList: false,
  isUnderline: false,
};

export function ThoughtRichTextDraftPage() {
  const [headingMenuOpen, setHeadingMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [listMenuOpen, setListMenuOpen] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit.configure({ underline: false }), Underline, TextStyle, Color, TaskList, TaskItem],
    content: "",
    immediatelyRender: false,
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
          isOrderedList: editor.isActive("orderedList"),
          isStrike: editor.isActive("strike"),
          isTaskList: editor.isActive("taskList"),
          isUnderline: editor.isActive("underline"),
        };
      },
    }) ?? defaultToolbarState;
  const editorMissing = !editor;
  const toolbarButtonClass = (active = false, iconOnly = false) => `${toolbarButtonBaseClass} ${iconOnly ? toolbarIconButtonClass : ""} ${active ? activeToolbarButtonClass : inactiveToolbarButtonClass}`;
  const activeHeadingLevel = headingLevels.find((level) => toolbarState[`isH${level}` as keyof ToolbarState]);
  const headingButtonText = activeHeadingLevel ? `H${activeHeadingLevel}` : "标题";
  const listActive = toolbarState.isBulletList || toolbarState.isOrderedList || toolbarState.isTaskList;
  const closeMenus = () => {
    setHeadingMenuOpen(false);
    setColorMenuOpen(false);
    setListMenuOpen(false);
  };

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

            <nav aria-label="富文本工具栏" className="mb-3 flex flex-wrap items-center gap-1.5 rounded-[1rem] border border-[#eee2d4] bg-[#fffaf3] p-2 shadow-[0_8px_20px_rgba(120,90,75,0.05)]">
              <button aria-label="撤销" className={toolbarButtonClass(false, true)} disabled={!toolbarState.canUndo} onClick={() => editor?.chain().focus().undo().run()} title="撤销" type="button">
                <Undo2 aria-hidden="true" size={17} strokeWidth={2.6} />
              </button>
              <div className="relative">
                <button
                  aria-expanded={headingMenuOpen}
                  aria-haspopup="menu"
                  aria-label="标题"
                  className={toolbarButtonClass(Boolean(activeHeadingLevel))}
                  disabled={editorMissing}
                  onClick={() => {
                    setHeadingMenuOpen((open) => !open);
                    setColorMenuOpen(false);
                    setListMenuOpen(false);
                  }}
                  type="button"
                >
                  <Type aria-hidden="true" size={17} strokeWidth={2.6} />
                  <span>{headingButtonText}</span>
                  <ChevronDown aria-hidden="true" size={15} strokeWidth={2.6} />
                </button>
                {headingMenuOpen ? (
                  <div className={toolbarMenuClass} role="menu">
                    {headingLevels.map((level) => (
                      <button
                        className={toolbarMenuItemClass}
                        key={level}
                        onClick={() => {
                          editor?.chain().focus().toggleHeading({ level }).run();
                          closeMenus();
                        }}
                        role="menuitem"
                        type="button"
                      >
                        H{level}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="relative">
                <button
                  aria-expanded={listMenuOpen}
                  aria-haspopup="menu"
                  aria-label="列表"
                  aria-pressed={listActive}
                  className={toolbarButtonClass(listActive)}
                  disabled={editorMissing}
                  onClick={() => {
                    setListMenuOpen((open) => !open);
                    setHeadingMenuOpen(false);
                    setColorMenuOpen(false);
                  }}
                  title="列表"
                  type="button"
                >
                  <List aria-hidden="true" size={18} strokeWidth={2.6} />
                  <ChevronDown aria-hidden="true" size={15} strokeWidth={2.6} />
                </button>
                {listMenuOpen ? (
                  <div className={toolbarMenuClass} role="menu">
                    <button
                      className={toolbarMenuItemClass}
                      onClick={() => {
                        editor?.chain().focus().toggleBulletList().run();
                        closeMenus();
                      }}
                      role="menuitem"
                      type="button"
                    >
                      无序列表
                    </button>
                    <button
                      className={toolbarMenuItemClass}
                      onClick={() => {
                        editor?.chain().focus().toggleOrderedList().run();
                        closeMenus();
                      }}
                      role="menuitem"
                      type="button"
                    >
                      有序列表
                    </button>
                    <button
                      className={toolbarMenuItemClass}
                      onClick={() => {
                        editor?.chain().focus().toggleTaskList().run();
                        closeMenus();
                      }}
                      role="menuitem"
                      type="button"
                    >
                      任务列表
                    </button>
                  </div>
                ) : null}
              </div>
              <button aria-label="加粗" aria-pressed={toolbarState.isBold} className={toolbarButtonClass(toolbarState.isBold, true)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleBold().run()} title="加粗" type="button">
                <Bold aria-hidden="true" size={17} strokeWidth={2.8} />
              </button>
              <button aria-label="删除线" aria-pressed={toolbarState.isStrike} className={toolbarButtonClass(toolbarState.isStrike, true)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleStrike().run()} title="删除线" type="button">
                <Strikethrough aria-hidden="true" size={17} strokeWidth={2.6} />
              </button>
              <button aria-label="斜体" aria-pressed={toolbarState.isItalic} className={toolbarButtonClass(toolbarState.isItalic, true)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleItalic().run()} title="斜体" type="button">
                <Italic aria-hidden="true" size={17} strokeWidth={2.6} />
              </button>
              <button aria-label="下划线" aria-pressed={toolbarState.isUnderline} className={toolbarButtonClass(toolbarState.isUnderline, true)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleUnderline().run()} title="下划线" type="button">
                <UnderlineIcon aria-hidden="true" size={17} strokeWidth={2.6} />
              </button>
              <div className="relative">
                <button
                  aria-expanded={colorMenuOpen}
                  aria-haspopup="menu"
                  aria-label="文字颜色"
                  className={toolbarButtonClass()}
                  disabled={editorMissing}
                  onClick={() => {
                    setColorMenuOpen((open) => !open);
                    setHeadingMenuOpen(false);
                    setListMenuOpen(false);
                  }}
                  type="button"
                >
                  <Palette aria-hidden="true" size={17} strokeWidth={2.6} />
                  <ChevronDown aria-hidden="true" size={15} strokeWidth={2.6} />
                </button>
                {colorMenuOpen ? (
                  <div className={toolbarMenuClass} role="menu">
                    {colorOptions.map((color) => (
                      <button
                        className={toolbarMenuItemClass}
                        key={color.label}
                        onClick={() => {
                          const command = editor?.chain().focus();
                          if (color.value) {
                            command?.setColor(color.value).run();
                          } else {
                            command?.unsetColor().run();
                          }
                          closeMenus();
                        }}
                        role="menuitem"
                        type="button"
                      >
                        <span aria-hidden="true" className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: color.swatch }} />
                        {color.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </nav>

            <section aria-label="碎碎念富文本编辑纸张" className={`relative min-h-[605px] overflow-hidden rounded-[1.2rem] border border-[#eee3d5] bg-[repeating-linear-gradient(0deg,#fffdf7_0,#fffdf7_31px,#efe6d8_32px)] px-5 py-5 text-[1rem] font-normal leading-8 text-[#5b4347] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)] sm:px-7 sm:py-6 ${richTextFrameClass}`}>
              {editor ? <EditorContent editor={editor} /> : <p>富文本编辑器加载中...</p>}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
