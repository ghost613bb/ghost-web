"use client";

import { mergeAttributes, Node as TiptapNode } from "@tiptap/core";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ArrowLeft, Bold, ChevronDown, ChevronsLeft, ChevronsRight, Code2, ImagePlus, Italic, List, ListMinus, ListOrdered, ListPlus, ListTodo, Palette, SmilePlus, Strikethrough, Table2, Underline as UnderlineIcon, Undo2, Video as VideoIcon } from "lucide-react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type ChangeEvent, type FormEvent, type MouseEvent as ReactMouseEvent } from "react";
import type { Thought } from "@/data/thoughts";

const toolbarButtonBaseClass =
  "inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-[0.85rem] border px-2.5 text-sm font-black shadow-[0_8px_18px_rgba(122,79,85,0.08)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0";
const toolbarIconButtonClass = "w-10 px-0";
const inactiveToolbarButtonClass =
  "border-[#ead7ce] bg-[#fffaf4] text-[#7a4f55] hover:border-[#e8b7c0] hover:bg-[#fff1f4] disabled:hover:border-[#ead7ce] disabled:hover:bg-[#fffaf4]";
const activeToolbarButtonClass = "border-[#d97891] bg-[#f8cfd5] text-[#7a3f4a] hover:border-[#d97891] hover:bg-[#f8cfd5]";
const toolbarMenuClass = "absolute left-0 top-12 z-20 min-w-28 overflow-hidden rounded-[0.9rem] border border-[#ead7ce] bg-[#fffdf8] p-1 shadow-[0_18px_34px_rgba(122,79,85,0.16)]";
const toolbarMenuItemClass = "flex w-full items-center gap-2 rounded-[0.7rem] px-3 py-2 text-left text-sm font-black text-[#6f4b51] transition hover:bg-[#fff1f4]";
const toolbarDividerClass = "mx-1 h-7 w-px bg-[#ead7ce]";
const richTextFrameClass =
  "[&_.ProseMirror-focused]:outline-none [&_.ProseMirror]:leading-[32px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:pt-1 [&_blockquote]:my-3 [&_blockquote]:rounded-r-[1rem] [&_blockquote]:border-l-4 [&_blockquote]:border-[#f0b5c0] [&_blockquote]:bg-[#fff6f8]/80 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:font-semibold [&_h1]:my-0 [&_h1]:text-[1.625rem] [&_h1]:font-black [&_h1]:leading-[32px] [&_h1]:tracking-[0.03em] [&_h2]:my-0 [&_h2]:text-[1.35rem] [&_h2]:font-black [&_h2]:leading-[32px] [&_h2]:tracking-[0.03em] [&_h3]:my-0 [&_h3]:text-[1.12rem] [&_h3]:font-black [&_h3]:leading-[32px] [&_li]:my-0 [&_li]:pl-1 [&_ol]:my-0 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-0 [&_p]:leading-[32px] [&_s]:line-through [&_s]:decoration-2 [&_strong]:font-black [&_u]:underline [&_u]:decoration-2 [&_u]:underline-offset-4 [&_ul]:my-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ul[data-type='taskList']]:my-0 [&_ul[data-type='taskList']]:list-none [&_ul[data-type='taskList']]:pl-1 [&_ul[data-type='taskList']_li[data-checked]]:flex [&_ul[data-type='taskList']_li[data-checked]]:items-start [&_ul[data-type='taskList']_li[data-checked]]:gap-2 [&_ul[data-type='taskList']_li[data-checked]]:pl-0 [&_ul[data-type='taskList']_li[data-checked]]:leading-[32px] [&_ul[data-type='taskList']_li[data-checked]>label]:flex [&_ul[data-type='taskList']_li[data-checked]>label]:h-[32px] [&_ul[data-type='taskList']_li[data-checked]>label]:items-center [&_ul[data-type='taskList']_li[data-checked]>div]:flex-1 [&_ul[data-type='taskList']_li[data-checked]>div]:leading-[32px] [&_ul[data-type='taskList']_li[data-checked]>div_p]:my-0 [&_ul[data-type='taskList']_li[data-checked]>div_p]:leading-[32px] [&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:h-4 [&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:w-4 [&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:appearance-none [&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:rounded-[0.28rem] [&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:border [&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:border-[#d97891] [&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:bg-white [&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:bg-center [&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:bg-no-repeat [&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']:checked]:bg-[#d97891] [&_[data-type='taskItem']]:flex [&_[data-type='taskItem']]:items-start [&_[data-type='taskItem']]:gap-2 [&_[data-type='taskItem']]:pl-0 [&_[data-type='taskItem']]:leading-[32px] [&_[data-type='taskItem']_label]:flex [&_[data-type='taskItem']_label]:h-[32px] [&_[data-type='taskItem']_label]:items-center [&_[data-type='taskItem']_div]:leading-[32px] [&_[data-type='taskItem']_div_p]:my-0 [&_[data-type='taskItem']_div_p]:leading-[32px] [&_[data-type='taskItem']_input]:h-4 [&_[data-type='taskItem']_input]:w-4 [&_[data-type='taskItem']_input]:appearance-none [&_[data-type='taskItem']_input]:rounded-[0.28rem] [&_[data-type='taskItem']_input]:border [&_[data-type='taskItem']_input]:border-[#d97891] [&_[data-type='taskItem']_input]:bg-white [&_[data-type='taskItem']_input]:bg-center [&_[data-type='taskItem']_input]:bg-no-repeat [&_[data-type='taskItem']_input:checked]:bg-[#d97891] [&_[data-type='taskList']]:my-0 [&_[data-type='taskList']]:list-none [&_[data-type='taskList']]:pl-1 [&_a]:font-black [&_a]:text-[#d97891] [&_a]:underline [&_a]:decoration-2 [&_a]:underline-offset-4 [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-[1rem] [&_img]:border [&_img]:border-[#efd8cf] [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-[1rem] [&_pre]:border [&_pre]:border-[#ead7ce] [&_pre]:bg-[#fff6ec] [&_pre]:px-4 [&_pre]:py-3 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-6 [&_pre]:text-[#6f4b51] [&_pre_code]:font-mono [&_table]:my-3 [&_table]:w-full [&_table]:table-fixed [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:overflow-hidden [&_table]:rounded-[1rem] [&_table]:bg-[#fffaf4] [&_table]:transition-[table-layout] [&_table]:duration-300 [&_.ProseMirror-focused_table]:table-fixed [&_td]:border [&_td]:border-[#ead7ce] [&_td]:px-3 [&_td]:py-2 [&_td]:break-words [&_th]:border [&_th]:border-[#e4c9bf] [&_th]:bg-[#fff1f4] [&_th]:px-3 [&_th]:py-2 [&_th]:font-black [&_th]:break-words [&_tr:first-child>*:first-child]:rounded-tl-[1rem] [&_tr:first-child>*:last-child]:rounded-tr-[1rem] [&_tr:last-child>*:first-child]:rounded-bl-[1rem] [&_tr:last-child>*:last-child]:rounded-br-[1rem] [&_video]:my-3 [&_video]:max-w-full [&_video]:rounded-[1rem] [&_video]:border [&_video]:border-[#efd8cf] [&_video]:bg-[#2f2528]";

const headingLevels = [1, 2, 3] as const;
const Video = TiptapNode.create({
  name: "video",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [{ tag: "video[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes, { controls: "true" }), 0];
  },
  addCommands() {
    return {
      setVideo:
        (options: { src: string }) =>
          ({ commands }) =>
            commands.insertContent({ type: this.name, attrs: options }),
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType;
    };
  }
}

const colorOptions = [
  { label: "默认", value: null, swatch: "#5b4347" },
  { label: "深棕", value: "#5b4347", swatch: "#5b4347" },
  { label: "粉色", value: "#d97891", swatch: "#d97891" },
  { label: "蓝色", value: "#4f79a8", swatch: "#4f79a8" },
  { label: "绿色", value: "#5f8a68", swatch: "#5f8a68" },
  { label: "黄色", value: "#b8860b", swatch: "#b8860b" },
] as const;

const defaultPaperBackgroundOpacity = 52;
const customPaperTemplateStorageKey = "ghost.thoughts.customPaperTemplates";
const paperLineGradient = "repeating-linear-gradient(0deg, transparent 0, transparent 31px, #efe6d8 32px)";
const paperTemplateOptions = [
  { label: "糖果波纹", imageUrl: "/thought-backgrounds/candy-waves.jpg" },
  { label: "粉心回响", imageUrl: "/thought-backgrounds/pink-heart.jpg" },
  { label: "海盐边框", imageUrl: "/thought-backgrounds/sea-salt-frame.jpg" },
] as const;

type PaperTemplateOption = {
  imageUrl: string;
  label: string;
  id?: string;
  source?: "builtin" | "custom";
};

type PendingCustomPaperTemplate = PaperTemplateOption | null;
type CustomPaperTemplateMenu = {
  templateId: string;
  x: number;
  y: number;
} | null;

type RenamingCustomPaperTemplate = {
  label: string;
  templateId: string;
} | null;

type ThoughtRichTextDraftPageProps = {
  thought?: Thought;
};

type SaveToast = {
  message: string;
  type: "error" | "success" | "saving";
} | null;

type ToolbarState = {
  canUndo: boolean;
  isBlockquote: boolean;
  isBold: boolean;
  isBulletList: boolean;
  isCodeBlock: boolean;
  isH1: boolean;
  isH2: boolean;
  isH3: boolean;
  isH4: boolean;
  isH5: boolean;
  isH6: boolean;
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
  isCodeBlock: false,
  isH1: false,
  isH2: false,
  isH3: false,
  isH4: false,
  isH5: false,
  isH6: false,
  isItalic: false,
  isOrderedList: false,
  isStrike: false,
  isTaskList: false,
  isUnderline: false,
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

function looksLikeEditorHtml(body: string) {
  return /<(p|h[1-6]|ul|ol|li|blockquote|pre|img|video|table|tbody|tr|td|th)(\s|>|\/)/i.test(body);
}

function thoughtBodyToEditorContent(body: string) {
  if (looksLikeEditorHtml(body)) {
    return body;
  }

  return body
    .split("\n")
    .map((line) => (line ? `<p>${escapeHtml(line)}</p>` : "<p></p>"))
    .join("");
}

function formatThoughtDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getThoughtSlug(title: string, timestamp: number) {
  const normalizedTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalizedTitle ? `${normalizedTitle}-${timestamp}` : `thought-${timestamp}`;
}

export function ThoughtRichTextDraftPage({ thought }: ThoughtRichTextDraftPageProps = {}) {
  const router = useRouter();
  const [attachmentUploadError, setAttachmentUploadError] = useState("");
  const [attachmentUploadStatus, setAttachmentUploadStatus] = useState<"idle" | "uploading" | "uploaded">("idle");
  const [currentThought, setCurrentThought] = useState<Thought | null>(thought ?? null);
  const [customPaperTemplateMenu, setCustomPaperTemplateMenu] = useState<CustomPaperTemplateMenu>(null);
  const [customPaperTemplates, setCustomPaperTemplates] = useState<PaperTemplateOption[]>([]);
  const [pendingCustomPaperTemplate, setPendingCustomPaperTemplate] = useState<PendingCustomPaperTemplate>(null);
  const [paperBackgroundImageUrl, setPaperBackgroundImageUrl] = useState("");
  const [paperBackgroundOpacity, setPaperBackgroundOpacity] = useState(defaultPaperBackgroundOpacity);
  const [renamingCustomPaperTemplate, setRenamingCustomPaperTemplate] = useState<RenamingCustomPaperTemplate>(null);
  const [renameCustomPaperTemplateLabel, setRenameCustomPaperTemplateLabel] = useState("");
  const [deleteThoughtDialogOpen, setDeleteThoughtDialogOpen] = useState(false);
  const [deleteThoughtError, setDeleteThoughtError] = useState("");
  const [isDeletingThought, setIsDeletingThought] = useState(false);
  const [isSavingThought, setIsSavingThought] = useState(false);
  const [saveToast, setSaveToast] = useState<SaveToast>(null);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [emojiMenuOpen, setEmojiMenuOpen] = useState(false);
  const [backgroundPanelCollapsed, setBackgroundPanelCollapsed] = useState(false);
  const [tableHeaderDeletePending, setTableHeaderDeletePending] = useState(false);
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);
  const customPaperTemplateMenuRef = useRef<HTMLDivElement | null>(null);
  const paperBackgroundImageUrlRef = useRef("");
  const toolbarRef = useRef<HTMLElement | null>(null);
  const pageTitle = currentThought ? "编辑碎碎念" : "新建碎碎念";
  const editorInitialContent = currentThought ? thoughtBodyToEditorContent(currentThought.body) : "";
  const editor = useEditor({
    extensions: [StarterKit.configure({ underline: false }), Underline, TextStyle, Color, TaskList, TaskItem, Image, LinkExtension, Table, TableRow, TableHeader, TableCell, Video],
    content: editorInitialContent,
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
          isCodeBlock: editor.isActive("codeBlock"),
          isH1: editor.isActive("heading", { level: 1 }),
          isH2: editor.isActive("heading", { level: 2 }),
          isH3: editor.isActive("heading", { level: 3 }),
          isH4: editor.isActive("heading", { level: 4 }),
          isH5: editor.isActive("heading", { level: 5 }),
          isH6: editor.isActive("heading", { level: 6 }),
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
  const visiblePaperTemplateOptions: PaperTemplateOption[] = [...paperTemplateOptions.map((template) => ({ ...template, source: "builtin" as const })), ...customPaperTemplates];
  const paperBackgroundCustomized = paperBackgroundImageUrl.length > 0;
  const editorLayoutClass = backgroundPanelCollapsed ? "grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start" : "grid gap-4 xl:grid-cols-[minmax(0,70rem)_minmax(18rem,1fr)] xl:items-start";
  const editorAreaClass = "min-w-0 w-full max-w-full";
  const editorPaperSizeClass = "h-[545px] min-w-0 w-full";
  const backgroundPanelClass = backgroundPanelCollapsed
    ? "h-[604px] w-11 min-w-0 overflow-hidden rounded-full border border-[#ead7ce] bg-[#fffdf8]/90 p-1.5 shadow-[0_14px_28px_rgba(122,79,85,0.08)]"
    : "h-full min-w-0 self-stretch rounded-[1.2rem] border border-[#ead7ce] bg-[#fffdf8] p-3 shadow-[0_14px_30px_rgba(122,79,85,0.08)] xl:sticky xl:top-4";
  const paperBackgroundStyle: CSSProperties | undefined = paperBackgroundCustomized
    ? {
      backgroundImage: `${paperLineGradient}, linear-gradient(rgba(255, 253, 247, ${1 - paperBackgroundOpacity / 100}), rgba(255, 253, 247, ${1 - paperBackgroundOpacity / 100})), url(${paperBackgroundImageUrl}), linear-gradient(#fffdf7, #fffdf7)`,
      backgroundPosition: "0 0, 0 0, center, 0 0",
      backgroundSize: "auto, auto, cover, auto",
    }
    : undefined;
  const closeMenus = () => {
    setColorMenuOpen(false);
    setCustomPaperTemplateMenu(null);
    setEmojiMenuOpen(false);
    setTableMenuOpen(false);
  };

  function persistCustomPaperTemplates(templates: PaperTemplateOption[]) {
    window.localStorage.setItem(customPaperTemplateStorageKey, JSON.stringify(templates));
  }

  function getCustomPaperTemplateId() {
    return `custom-paper-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function buildThoughtPayload(html: string, text: string): Thought {
    if (currentThought) {
      return {
        ...currentThought,
        body: html,
      };
    }

    const timestamp = Date.now();
    const title = text.split("\n").find((line) => line.trim())?.trim().slice(0, 24) || "未命名碎碎念";

    return {
      id: `thought-created-${timestamp}`,
      title,
      slug: getThoughtSlug(title, timestamp),
      body: html,
      tags: ["日常"],
      visibility: "public",
      status: "published",
      createdAt: formatThoughtDate(new Date()),
      sortOrder: timestamp,
    };
  }

  async function saveThought() {
    if (!editor || isSavingThought) {
      return;
    }

    const html = editor.getHTML();
    const text = editor.getText().trim();
    if (!text && !/<(img|video)(\s|>|\/)/i.test(html)) {
      setSaveToast({ message: "先写一点内容再保存", type: "error" });
      return;
    }

    setIsSavingThought(true);
    setSaveToast({ message: "保存中...", type: "saving" });

    try {
      const response = await fetch("/api/thoughts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildThoughtPayload(html, text)),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "保存失败");
      }

      setCurrentThought(data.thought);
      setSaveToast({ message: "保存成功", type: "success" });
      router.replace(`/thoughts/${data.thought.slug}`);
      router.refresh();
    } catch (error) {
      setSaveToast({ message: error instanceof Error ? error.message : "保存失败", type: "error" });
    } finally {
      setIsSavingThought(false);
    }
  }

  async function confirmDeleteThought() {
    if (!currentThought) {
      router.push("/thoughts");
      return;
    }

    setIsDeletingThought(true);
    setDeleteThoughtError("");

    try {
      const response = await fetch(`/api/thoughts/${encodeURIComponent(currentThought.id)}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "删除失败");
      }

      router.push("/thoughts");
      router.refresh();
    } catch (error) {
      setDeleteThoughtError(error instanceof Error ? error.message : "删除失败");
    } finally {
      setIsDeletingThought(false);
    }
  }

  function deleteTableRow() {
    editor?.chain().focus().deleteRow().run();
    closeMenus();
  }

  function runTableCommand(command: "addColumnAfter" | "addRowAfter" | "deleteColumn" | "deleteRow" | "insertTable") {
    if (command === "deleteRow" && editor?.isActive("tableHeader")) {
      setTableHeaderDeletePending(true);
      closeMenus();
      return;
    }

    const chain = editor?.chain().focus();

    if (command === "insertTable") {
      chain?.insertTable({ cols: 3, rows: 3, withHeaderRow: true }).run();
    } else {
      chain?.[command]().run();
    }

    closeMenus();
  }

  function handleEmojiClick(emojiData: EmojiClickData) {
    editor?.chain().focus().insertContent(` ${emojiData.emoji} `).run();
    closeMenus();
  }

  function resetPaperBackground() {
    if (paperBackgroundImageUrlRef.current) {
      URL.revokeObjectURL(paperBackgroundImageUrlRef.current);
      paperBackgroundImageUrlRef.current = "";
    }

    setPendingCustomPaperTemplate(null);
    setPaperBackgroundImageUrl("");
    setPaperBackgroundOpacity(defaultPaperBackgroundOpacity);
  }

  function applyPaperTemplate(imageUrl: string) {
    if (paperBackgroundImageUrlRef.current) {
      URL.revokeObjectURL(paperBackgroundImageUrlRef.current);
      paperBackgroundImageUrlRef.current = "";
    }

    setPendingCustomPaperTemplate(null);
    setPaperBackgroundImageUrl(imageUrl);
    setPaperBackgroundOpacity(defaultPaperBackgroundOpacity);
  }

  function saveCustomPaperTemplate() {
    if (!pendingCustomPaperTemplate) {
      return;
    }

    setCustomPaperTemplates((templates) => {
      const nextTemplates = [...templates, pendingCustomPaperTemplate];
      persistCustomPaperTemplates(nextTemplates);
      return nextTemplates;
    });
    setPendingCustomPaperTemplate(null);
  }

  function handleCustomPaperTemplateContextMenu(event: ReactMouseEvent<HTMLButtonElement>, template: PaperTemplateOption) {
    if (template.source !== "custom" || !template.id) {
      return;
    }

    event.preventDefault();
    setCustomPaperTemplateMenu({
      templateId: template.id,
      x: event.clientX,
      y: event.clientY,
    });
  }

  function openRenameCustomPaperTemplateDialog(templateId: string) {
    const template = customPaperTemplates.find((item) => item.id === templateId);
    if (!template) {
      setCustomPaperTemplateMenu(null);
      return;
    }

    setRenamingCustomPaperTemplate({ label: template.label, templateId });
    setRenameCustomPaperTemplateLabel(template.label);
    setCustomPaperTemplateMenu(null);
  }

  function cancelRenameCustomPaperTemplate() {
    setRenamingCustomPaperTemplate(null);
    setRenameCustomPaperTemplateLabel("");
  }

  function renameCustomPaperTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!renamingCustomPaperTemplate) {
      return;
    }

    const nextLabel = renameCustomPaperTemplateLabel.trim();
    if (!nextLabel) {
      return;
    }

    setCustomPaperTemplates((templates) => {
      const nextTemplates = templates.map((item) => (item.id === renamingCustomPaperTemplate.templateId ? { ...item, label: nextLabel } : item));
      persistCustomPaperTemplates(nextTemplates);
      return nextTemplates;
    });
    cancelRenameCustomPaperTemplate();
  }

  function deleteCustomPaperTemplate(templateId: string) {
    const deletedTemplate = customPaperTemplates.find((template) => template.id === templateId);

    if (deletedTemplate?.imageUrl === paperBackgroundImageUrl) {
      resetPaperBackground();
    }

    setCustomPaperTemplates((templates) => {
      const nextTemplates = templates.filter((template) => template.id !== templateId);
      persistCustomPaperTemplates(nextTemplates);
      return nextTemplates;
    });
    setCustomPaperTemplateMenu(null);
  }

  function handlePaperBackgroundChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (paperBackgroundImageUrlRef.current) {
      URL.revokeObjectURL(paperBackgroundImageUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(file);
    paperBackgroundImageUrlRef.current = nextUrl;
    setPaperBackgroundImageUrl(nextUrl);
    setPaperBackgroundOpacity(defaultPaperBackgroundOpacity);
    setPendingCustomPaperTemplate(null);

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") {
        return;
      }

      setPendingCustomPaperTemplate({
        id: getCustomPaperTemplateId(),
        imageUrl: reader.result,
        label: `自定义背景 ${customPaperTemplates.length + 1}`,
        source: "custom",
      });
    });
    reader.readAsDataURL(file);
  }

  async function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !editor) {
      return;
    }

    setAttachmentUploadError("");
    setAttachmentUploadStatus("uploading");

    const formData = new FormData();
    formData.set("attachmentFile", file);
    formData.set("attachmentFileName", file.name);

    try {
      const response = await fetch("/api/thoughts/attachments", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "附件上传失败");
      }

      if (data.attachment.type === "image") {
        editor.chain().focus().setImage({ src: data.attachment.url }).run();
      } else if (data.attachment.type === "video") {
        editor.chain().focus().setVideo({ src: data.attachment.url }).run();
      }

      setAttachmentUploadStatus("uploaded");
    } catch (error) {
      setAttachmentUploadError(error instanceof Error ? error.message : "附件上传失败");
      setAttachmentUploadStatus("idle");
    }
  }

  useEffect(() => {
    if (attachmentUploadStatus !== "uploaded" && !attachmentUploadError) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAttachmentUploadStatus("idle");
      setAttachmentUploadError("");
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [attachmentUploadError, attachmentUploadStatus]);

  useEffect(() => {
    if (!saveToast || saveToast.type === "saving") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSaveToast(null);
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [saveToast]);

  useEffect(() => {
    try {
      const storedTemplates = window.localStorage.getItem(customPaperTemplateStorageKey);
      if (!storedTemplates) {
        return;
      }

      const parsedTemplates = JSON.parse(storedTemplates);
      if (!Array.isArray(parsedTemplates)) {
        return;
      }

      setCustomPaperTemplates(
        parsedTemplates
          .filter((template): template is PaperTemplateOption => typeof template?.label === "string" && typeof template?.imageUrl === "string")
          .map((template, index) => ({ ...template, id: template.id ?? `custom-paper-${index + 1}`, source: "custom" })),
      );
    } catch {
      setCustomPaperTemplates([]);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (paperBackgroundImageUrlRef.current) {
        URL.revokeObjectURL(paperBackgroundImageUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!toolbarRef.current?.contains(event.target as Node) && !customPaperTemplateMenuRef.current?.contains(event.target as Node)) {
        closeMenus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <main className="album-page-scrollbar h-dvh overflow-y-auto bg-[#f7f1e8] px-3 py-3 text-[#4c2b2d] sm:px-5 sm:py-4">
      <div className="mx-auto max-w-[1600px]">
        <section aria-label="新建碎碎念编辑本" className="relative max-w-[1600px] overflow-hidden rounded-[2.2rem] border-[2px] border-[#e4d0bd] bg-[#fffaf0] p-3 shadow-[0_24px_60px_rgba(135,95,76,0.14)] sm:p-4 lg:pl-[5.6rem]">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-[4.3rem] border-r border-[#ead9c6] bg-[linear-gradient(90deg,#fff8ea_0%,#f7ead9_100%)] lg:block" />
          <div aria-hidden="true" className="absolute left-[3.62rem] top-9 hidden h-[76%] w-5 flex-col justify-between lg:flex">
            {Array.from({ length: 8 }).map((_, index) => (
              <span className="h-3 w-10 rounded-full bg-[linear-gradient(90deg,#8a572f_0%,#d19b62_48%,#7a4829_100%)] shadow-[0_2px_5px_rgba(74,45,24,0.28)]" key={index} />
            ))}
          </div>

          <div aria-label="新建碎碎念内容滚动区" className="rounded-[1.8rem] border border-[#eadccf] bg-[#fffdf8] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)] sm:p-4">
            <header className="mb-3 flex flex-col gap-3 border-b border-[#efe4d8] pb-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Link aria-label="返回碎碎念" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#d97891] transition hover:-translate-x-0.5 hover:bg-[#fff2f5]" href="/thoughts">
                  <ArrowLeft aria-hidden="true" size={22} strokeWidth={3} />
                </Link>
                <h1 className="text-xl font-black tracking-tight text-[#4c2b2d] sm:text-2xl">{pageTitle}</h1>
              </div>
              <div aria-label="碎碎念操作" className="flex flex-wrap items-center gap-2">
                <button className="rounded-[0.9rem] border border-[#ead7ce] bg-[#fffdf8] px-4 py-2 text-sm font-black text-[#6f4b51] shadow-[0_8px_20px_rgba(120,90,75,0.05)] transition hover:border-[#e8b7c0] hover:bg-[#fff7f8] disabled:cursor-not-allowed disabled:opacity-45" disabled={editorMissing || isSavingThought || attachmentUploadStatus === "uploading"} onClick={saveThought} type="button">
                  {isSavingThought ? "保存中" : "保存"}
                </button>
                <button className="rounded-[0.9rem] border border-[#ead7ce] bg-[#fffdf8] px-4 py-2 text-sm font-black text-[#6f4b51] shadow-[0_8px_20px_rgba(120,90,75,0.05)] transition hover:border-[#e8b7c0] hover:bg-[#fff7f8]" onClick={() => { setDeleteThoughtError(""); setDeleteThoughtDialogOpen(true); }} type="button">
                  删除
                </button>
              </div>
            </header>

            <div aria-label="碎碎念编辑布局" className={editorLayoutClass}>
              <div aria-label="富文本编辑区" className={editorAreaClass}>
                <nav aria-label="富文本工具栏" className="mb-3 flex min-w-0 w-full max-w-full flex-wrap items-center gap-1.5 rounded-[1rem] border border-[#eee2d4] bg-[#fffaf3] p-2 shadow-[0_8px_20px_rgba(120,90,75,0.05)]" ref={toolbarRef}>
              {headingLevels.map((level) => (
                <button
                  aria-label={`H${level}`}
                  aria-pressed={activeHeadingLevel === level}
                  className={toolbarButtonClass(activeHeadingLevel === level)}
                  disabled={editorMissing}
                  key={level}
                  onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
                  title={`H${level}`}
                  type="button"
                >
                  H{level}
                </button>
              ))}
              <span aria-hidden="true" className={toolbarDividerClass} data-testid="toolbar-divider" />
              <button aria-label="无序列表" aria-pressed={toolbarState.isBulletList} className={toolbarButtonClass(toolbarState.isBulletList, true)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="无序列表" type="button">
                <List aria-hidden="true" size={18} strokeWidth={2.6} />
              </button>
              <button aria-label="有序列表" aria-pressed={toolbarState.isOrderedList} className={toolbarButtonClass(toolbarState.isOrderedList, true)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="有序列表" type="button">
                <ListOrdered aria-hidden="true" size={18} strokeWidth={2.6} />
              </button>
              <button aria-label="任务列表" aria-pressed={toolbarState.isTaskList} className={toolbarButtonClass(toolbarState.isTaskList, true)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleTaskList().run()} title="任务列表" type="button">
                <ListTodo aria-hidden="true" size={18} strokeWidth={2.6} />
              </button>
              <span aria-hidden="true" className={toolbarDividerClass} data-testid="toolbar-divider" />
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
              <button aria-label="代码块" aria-pressed={toolbarState.isCodeBlock} className={toolbarButtonClass(toolbarState.isCodeBlock, true)} disabled={editorMissing} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} title="代码块" type="button">
                <Code2 aria-hidden="true" size={17} strokeWidth={2.6} />
              </button>
              <div className="relative">
                <button
                  aria-expanded={tableMenuOpen}
                  aria-haspopup="menu"
                  aria-label="表格"
                  className={toolbarButtonClass(false)}
                  disabled={editorMissing}
                  onClick={() => {
                    setColorMenuOpen(false);
                    setEmojiMenuOpen(false);
                    setTableMenuOpen((open) => !open);
                  }}
                  title="表格"
                  type="button"
                >
                  <Table2 aria-hidden="true" size={17} strokeWidth={2.6} />
                  <ChevronDown aria-hidden="true" size={15} strokeWidth={2.6} />
                </button>
                {tableMenuOpen ? (
                  <div className={toolbarMenuClass} role="menu">
                    <button className={toolbarMenuItemClass} onClick={() => runTableCommand("insertTable")} role="menuitem" type="button">插入表格</button>
                    <button className={toolbarMenuItemClass} onClick={() => runTableCommand("addRowAfter")} role="menuitem" type="button">新增表格行</button>
                    <button className={toolbarMenuItemClass} onClick={() => runTableCommand("deleteRow")} role="menuitem" type="button">删除表格行</button>
                    <button className={toolbarMenuItemClass} onClick={() => runTableCommand("addColumnAfter")} role="menuitem" type="button">新增表格列</button>
                    <button className={toolbarMenuItemClass} onClick={() => runTableCommand("deleteColumn")} role="menuitem" type="button">删除表格列</button>
                  </div>
                ) : null}
              </div>
              <div className="relative">
                <button
                  aria-expanded={emojiMenuOpen}
                  aria-haspopup="dialog"
                  aria-label="表情包"
                  className={toolbarButtonClass(emojiMenuOpen, true)}
                  disabled={editorMissing}
                  onClick={() => {
                    setColorMenuOpen(false);
                    setTableMenuOpen(false);
                    setEmojiMenuOpen((open) => !open);
                  }}
                  title="表情包"
                  type="button"
                >
                  <SmilePlus aria-hidden="true" size={17} strokeWidth={2.6} />
                </button>
                {emojiMenuOpen ? (
                  <div className="absolute left-0 top-12 z-20 overflow-hidden rounded-[1rem] border border-[#ead7ce] bg-[#fffdf8] shadow-[0_18px_34px_rgba(122,79,85,0.16)]" role="dialog" aria-label="表情选择器弹层">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                ) : null}
              </div>
              <div className="relative">
                <button
                  aria-expanded={colorMenuOpen}
                  aria-haspopup="menu"
                  aria-label="文字颜色"
                  className={toolbarButtonClass()}
                  disabled={editorMissing}
                  onClick={() => {
                    setEmojiMenuOpen(false);
                    setTableMenuOpen(false);
                    setColorMenuOpen((open) => !open);
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
              <input aria-label="上传背景图" accept="image/*" className="sr-only" onChange={handlePaperBackgroundChange} ref={backgroundInputRef} type="file" />
              <input aria-label="上传图片附件" accept="image/*" className="sr-only" onChange={handleAttachmentChange} ref={imageInputRef} type="file" />
              <button aria-label="图片" className={toolbarButtonClass(false, true)} disabled={editorMissing || attachmentUploadStatus === "uploading"} onClick={() => imageInputRef.current?.click()} title="上传图片附件" type="button">
                <ImagePlus aria-hidden="true" size={17} strokeWidth={2.6} />
              </button>
              <input aria-label="上传视频附件" accept="video/*" className="sr-only" onChange={handleAttachmentChange} ref={videoInputRef} type="file" />
              <button aria-label="视频" className={toolbarButtonClass(false, true)} disabled={editorMissing || attachmentUploadStatus === "uploading"} onClick={() => videoInputRef.current?.click()} title="上传视频附件" type="button">
                <VideoIcon aria-hidden="true" size={17} strokeWidth={2.6} />
              </button>
              <button aria-label="撤销" className={toolbarButtonClass(false, true)} disabled={!toolbarState.canUndo} onClick={() => editor?.chain().focus().undo().run()} title="撤销" type="button">
                <Undo2 aria-hidden="true" size={17} strokeWidth={2.6} />
              </button>
                </nav>
                {attachmentUploadStatus === "uploading" ? <div className="fixed right-6 top-6 z-50 rounded-[1rem] border border-[#ead7ce] bg-[#fffaf4] px-4 py-3 text-sm font-black text-[#8a5b62] shadow-[0_18px_34px_rgba(122,79,85,0.16)]" role="status">附件上传中...</div> : null}
                {attachmentUploadStatus === "uploaded" ? <div className="fixed right-6 top-6 z-50 rounded-[1rem] border border-[#d8ead8] bg-[#f4fff5] px-4 py-3 text-sm font-black text-[#5f8a68] shadow-[0_18px_34px_rgba(95,138,104,0.16)]" role="status">附件上传完成</div> : null}
                {attachmentUploadError ? <div className="fixed right-6 top-6 z-50 rounded-[1rem] border border-[#f0c6cf] bg-[#fff4f6] px-4 py-3 text-sm font-black text-[#c65f73] shadow-[0_18px_34px_rgba(198,95,115,0.16)]" role="alert">{attachmentUploadError}</div> : null}
                {saveToast?.type === "saving" ? <div className="fixed right-6 top-24 z-50 rounded-[1rem] border border-[#ead7ce] bg-[#fffaf4] px-4 py-3 text-sm font-black text-[#8a5b62] shadow-[0_18px_34px_rgba(122,79,85,0.16)]" role="status">{saveToast.message}</div> : null}
                {saveToast?.type === "success" ? <div className="fixed right-6 top-24 z-50 rounded-[1rem] border border-[#d8ead8] bg-[#f4fff5] px-4 py-3 text-sm font-black text-[#5f8a68] shadow-[0_18px_34px_rgba(95,138,104,0.16)]" role="status">{saveToast.message}</div> : null}
                {saveToast?.type === "error" ? <div className="fixed right-6 top-24 z-50 rounded-[1rem] border border-[#f0c6cf] bg-[#fff4f6] px-4 py-3 text-sm font-black text-[#c65f73] shadow-[0_18px_34px_rgba(198,95,115,0.16)]" role="alert">{saveToast.message}</div> : null}
                <section aria-label="碎碎念富文本编辑纸张" className={`album-page-scrollbar thought-rich-text-editor relative ${editorPaperSizeClass} overflow-y-auto rounded-[1.2rem] border border-[#eee3d5] bg-[repeating-linear-gradient(0deg,#fffdf7_0,#fffdf7_31px,#efe6d8_32px)] px-5 py-5 text-[1rem] font-normal leading-8 text-[#5b4347] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)] sm:px-7 sm:py-6 ${richTextFrameClass}`} style={paperBackgroundStyle}>
                  {editor ? <EditorContent editor={editor} /> : <p>富文本编辑器加载中...</p>}
                </section>
              </div>
              <aside aria-label="背景模板选择" className={backgroundPanelClass}>
                {backgroundPanelCollapsed ? (
                  <button aria-label="展开背景模板" className="group flex h-full w-full flex-col items-center justify-center gap-3 rounded-full bg-[linear-gradient(180deg,#fff9fb_0%,#fff3f5_100%)] px-1 py-3 text-sm font-black text-[#9a5260] transition hover:bg-[#ffe8ee] hover:text-[#7a3f4a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d97891]" onClick={() => setBackgroundPanelCollapsed(false)} type="button">
                    <ChevronsLeft aria-hidden="true" className="shrink-0 transition group-hover:-translate-x-0.5" size={17} strokeWidth={2.8} />
                    <span className="[writing-mode:vertical-rl]">背景模板</span>
                  </button>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-base font-black text-[#4c2b2d]">背景模板</h2>
                      <button className="group inline-flex items-center gap-1 rounded-full border border-[#ead7ce] bg-[linear-gradient(180deg,#fff9fb_0%,#fff3f5_100%)] px-2.5 py-1 text-xs font-black text-[#9a5260] shadow-[0_8px_18px_rgba(122,79,85,0.08)] transition hover:border-[#e8b7c0] hover:bg-[#ffe8ee] hover:text-[#7a3f4a]" onClick={() => setBackgroundPanelCollapsed(true)} type="button">
                        收起
                        <ChevronsRight aria-hidden="true" className="transition group-hover:translate-x-0.5" size={14} strokeWidth={2.8} />
                      </button>
                    </div>
                    <div aria-label="背景模板列表" className="album-page-scrollbar mt-3 grid max-h-[23.875rem] grid-cols-2 gap-2 overflow-y-auto pr-1">
                      {visiblePaperTemplateOptions.map((template) => (
                        <button aria-label={template.label} className="group rounded-[1rem] border border-[#ead7ce] bg-[#fffaf4] p-2 text-left shadow-[0_8px_18px_rgba(122,79,85,0.08)] transition hover:-translate-y-0.5 hover:border-[#e8b7c0] hover:bg-[#fff7f8]" key={template.id ?? template.label} onClick={() => applyPaperTemplate(template.imageUrl)} onContextMenu={(event) => handleCustomPaperTemplateContextMenu(event, template)} type="button">
                          <span className="block h-20 rounded-[0.8rem] border border-[#f0e2d6] bg-cover bg-center" style={{ backgroundImage: `url(${template.imageUrl})` }} />
                          <span className="mt-2 block text-xs font-black text-[#6f4b51]">{template.label}</span>
                        </button>
                      ))}
                    </div>
                    {customPaperTemplateMenu ? (
                      <div className="fixed z-50 w-28 rounded-[0.85rem] border border-[#ead7ce] bg-[#fffdf8] p-1 shadow-[0_18px_34px_rgba(122,79,85,0.16)]" ref={customPaperTemplateMenuRef} role="menu" style={{ left: customPaperTemplateMenu.x, top: customPaperTemplateMenu.y }}>
                        <button className="block w-full rounded-[0.65rem] px-3 py-2 text-left text-xs font-black text-[#6f4b51] transition hover:bg-[#fff1f4]" onClick={() => openRenameCustomPaperTemplateDialog(customPaperTemplateMenu.templateId)} role="menuitem" type="button">
                          重命名
                        </button>
                        <button className="block w-full rounded-[0.65rem] px-3 py-2 text-left text-xs font-black text-[#c65f73] transition hover:bg-[#fff1f4]" onClick={() => deleteCustomPaperTemplate(customPaperTemplateMenu.templateId)} role="menuitem" type="button">
                          删除
                        </button>
                      </div>
                    ) : null}
                    <button className="mt-3 w-full rounded-[0.9rem] border border-[#d97891] bg-[#f48ca0] px-3 py-2 text-sm font-black text-white shadow-[0_10px_24px_rgba(217,120,145,0.22)] transition hover:bg-[#e97991]" onClick={() => backgroundInputRef.current?.click()} type="button">
                      自定义背景
                    </button>
                    {paperBackgroundCustomized ? (
                      <>
                        <p className="mt-2 text-xs font-bold text-[#9a7377]">已选择背景图</p>
                        <label className="mt-2 block rounded-[0.85rem] border border-[#f0e2d6] bg-[#fffaf4] px-3 py-2 text-sm font-black text-[#6f4b51]">
                          <span className="flex items-center justify-between">
                            背景透明度
                            <span>{paperBackgroundOpacity}%</span>
                          </span>
                          <input aria-label="背景透明度" className="mt-2 w-full accent-[#d97891]" max="100" min="0" onChange={(event) => setPaperBackgroundOpacity(Number(event.target.value))} type="range" value={paperBackgroundOpacity} />
                        </label>
                        {pendingCustomPaperTemplate ? (
                          <div className="fixed bottom-5 right-5 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-[1rem] border border-[#ead7ce] bg-[#fff7f8] p-3 shadow-[0_18px_34px_rgba(122,79,85,0.18)]">
                            <p className="text-xs font-black leading-5 text-[#8a5b62]">把这张自定义背景保存到模板，下次可直接选择。</p>
                            <div className="mt-2 flex gap-2">
                              <button className="flex-1 rounded-[0.75rem] bg-[#f48ca0] px-2 py-2 text-xs font-black text-white transition hover:bg-[#e97991]" onClick={saveCustomPaperTemplate} type="button">
                                保存为背景模板
                              </button>
                              <button className="rounded-[0.75rem] border border-[#ead7ce] bg-[#fffdf8] px-2 py-2 text-xs font-black text-[#7a4f55] transition hover:bg-[#fff1f4]" onClick={() => setPendingCustomPaperTemplate(null)} type="button">
                                暂不保存
                              </button>
                            </div>
                          </div>
                        ) : null}
                        <button className="mt-2 w-full rounded-[0.9rem] border border-[#ead7ce] bg-[#fffaf4] px-3 py-2 text-sm font-black text-[#7a4f55] transition hover:bg-[#fff1f4]" onClick={resetPaperBackground} type="button">
                          恢复默认背景
                        </button>
                      </>
                    ) : null}
                  </>
                )}
              </aside>
            </div>
            {renamingCustomPaperTemplate ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4c2b2d]/20 px-4">
                <form aria-modal="true" className="w-full max-w-sm rounded-[1.4rem] border border-[#ead7ce] bg-[#fffdf8] p-5 text-[#5b4347] shadow-[0_24px_60px_rgba(122,79,85,0.2)]" onSubmit={renameCustomPaperTemplate} role="dialog" aria-label="重命名背景模板">
                  <h2 className="text-lg font-black text-[#4c2b2d]">重命名背景模板</h2>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#8a5b62]">给「{renamingCustomPaperTemplate.label}」换一个更好记的名字。</p>
                  <label className="mt-4 block text-sm font-black text-[#6f4b51]">
                    模板名称
                    <input autoFocus className="mt-2 w-full rounded-[0.85rem] border border-[#ead7ce] bg-[#fffaf4] px-3 py-2 text-sm font-black text-[#5b4347] outline-none transition placeholder:text-[#b89699] focus:border-[#d97891] focus:bg-[#fff7f8]" onChange={(event) => setRenameCustomPaperTemplateLabel(event.target.value)} value={renameCustomPaperTemplateLabel} />
                  </label>
                  <div className="mt-5 flex justify-end gap-2">
                    <button className="rounded-[0.85rem] border border-[#ead7ce] bg-[#fffaf4] px-4 py-2 text-sm font-black text-[#7a4f55] transition hover:bg-[#fff1f4]" onClick={cancelRenameCustomPaperTemplate} type="button">
                      取消
                    </button>
                    <button className="rounded-[0.85rem] border border-[#d97891] bg-[#f8cfd5] px-4 py-2 text-sm font-black text-[#7a3f4a] transition hover:bg-[#f4b8c2] disabled:cursor-not-allowed disabled:opacity-45" disabled={!renameCustomPaperTemplateLabel.trim()} type="submit">
                      确认重命名
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
            {deleteThoughtDialogOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4c2b2d]/20 px-4">
                <div aria-modal="true" className="w-full max-w-sm rounded-[1.4rem] border border-[#ead7ce] bg-[#fffdf8] p-5 text-[#5b4347] shadow-[0_24px_60px_rgba(122,79,85,0.2)]" role="dialog" aria-label="删除碎碎念确认弹窗">
                  <h2 className="text-lg font-black text-[#4c2b2d]">{currentThought ? "删除碎碎念" : "放弃草稿"}</h2>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#8a5b62]">{currentThought ? `确认删除「${currentThought.title}」吗？删除后会从碎碎念列表中移除。` : "确认放弃当前未保存的碎碎念吗？当前编辑内容不会保存。"}</p>
                  {deleteThoughtError ? <p className="mt-3 rounded-[0.75rem] border border-[#f0c6cf] bg-[#fff4f6] px-3 py-2 text-sm font-black text-[#c65f73]" role="alert">{deleteThoughtError}</p> : null}
                  <div className="mt-5 flex justify-end gap-2">
                    <button className="rounded-[0.85rem] border border-[#ead7ce] bg-[#fffaf4] px-4 py-2 text-sm font-black text-[#7a4f55] transition hover:bg-[#fff1f4]" disabled={isDeletingThought} onClick={() => setDeleteThoughtDialogOpen(false)} type="button">
                      取消
                    </button>
                    <button className="rounded-[0.85rem] border border-[#d97891] bg-[#f8cfd5] px-4 py-2 text-sm font-black text-[#7a3f4a] transition hover:bg-[#f4b8c2] disabled:cursor-not-allowed disabled:opacity-45" disabled={isDeletingThought} onClick={confirmDeleteThought} type="button">
                      {isDeletingThought ? "删除中" : currentThought ? "确认删除" : "确认放弃"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            {tableHeaderDeletePending ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4c2b2d]/20 px-4">
                <div aria-modal="true" className="w-full max-w-sm rounded-[1.4rem] border border-[#ead7ce] bg-[#fffdf8] p-5 text-[#5b4347] shadow-[0_24px_60px_rgba(122,79,85,0.2)]" role="dialog" aria-label="删除表头行">
                  <h2 className="text-lg font-black text-[#4c2b2d]">删除表头行</h2>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#8a5b62]">确定要删除表头行吗？删除后表格会失去表头结构。</p>
                  <div className="mt-5 flex justify-end gap-2">
                    <button className="rounded-[0.85rem] border border-[#ead7ce] bg-[#fffaf4] px-4 py-2 text-sm font-black text-[#7a4f55] transition hover:bg-[#fff1f4]" onClick={() => setTableHeaderDeletePending(false)} type="button">
                      取消
                    </button>
                    <button className="rounded-[0.85rem] border border-[#d97891] bg-[#f8cfd5] px-4 py-2 text-sm font-black text-[#7a3f4a] transition hover:bg-[#f4b8c2]" onClick={() => { setTableHeaderDeletePending(false); deleteTableRow(); }} type="button">
                      确认删除
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
