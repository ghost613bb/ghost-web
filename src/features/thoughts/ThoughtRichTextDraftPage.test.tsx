import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEditorState } from "@tiptap/react";
import { ThoughtRichTextDraftPage } from "./ThoughtRichTextDraftPage";

const mockStarterKit = vi.hoisted(() => ({
  configure: vi.fn((options: unknown) => ({ name: "StarterKit", options })),
}));

const mockEditor = {
  chain: vi.fn(),
  can: vi.fn(),
  isActive: vi.fn(),
};

let capturedUseEditorOptions: { extensions?: unknown[]; onUpdate?: unknown } | undefined;
let editorState = {
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

vi.mock("@tiptap/starter-kit", () => ({
  default: mockStarterKit,
}));

vi.mock("@tiptap/extension-underline", () => ({
  default: "Underline",
}));

vi.mock("@tiptap/extension-text-style", () => ({
  TextStyle: "TextStyle",
}));

vi.mock("@tiptap/extension-color", () => ({
  default: "Color",
}));

vi.mock("@tiptap/extension-task-list", () => ({
  default: "TaskList",
}));

vi.mock("@tiptap/extension-task-item", () => ({
  default: "TaskItem",
}));

vi.mock("@tiptap/react", () => ({
  EditorContent: ({ editor }: { editor: unknown }) => <div data-testid="editor-content">Editor ready: {String(Boolean(editor))}</div>,
  useEditor: vi.fn((options: { extensions?: unknown[]; onUpdate?: unknown }) => {
    capturedUseEditorOptions = options;
    return mockEditor;
  }),
  useEditorState: vi.fn(() => editorState),
}));

function chainResult() {
  return {
    focus: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    setParagraph: vi.fn().mockReturnThis(),
    toggleHeading: vi.fn().mockReturnThis(),
    toggleBold: vi.fn().mockReturnThis(),
    toggleItalic: vi.fn().mockReturnThis(),
    toggleStrike: vi.fn().mockReturnThis(),
    toggleUnderline: vi.fn().mockReturnThis(),
    toggleBulletList: vi.fn().mockReturnThis(),
    toggleOrderedList: vi.fn().mockReturnThis(),
    toggleTaskList: vi.fn().mockReturnThis(),
    toggleBlockquote: vi.fn().mockReturnThis(),
    undo: vi.fn().mockReturnThis(),
    unsetColor: vi.fn().mockReturnThis(),
    run: vi.fn(),
  };
}

describe("ThoughtRichTextDraftPage", () => {
  beforeEach(() => {
    capturedUseEditorOptions = undefined;
    editorState = {
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
    mockStarterKit.configure.mockClear();
    mockEditor.chain.mockImplementation(chainResult);
    mockEditor.can.mockReturnValue({ undo: () => editorState.canUndo });
    mockEditor.isActive.mockImplementation((name: string, attrs?: { level?: number }) => {
      if (name === "heading" && attrs?.level === 1) return editorState.isH1;
      if (name === "heading" && attrs?.level === 2) return editorState.isH2;
      if (name === "heading" && attrs?.level === 3) return editorState.isH3;
      if (name === "heading" && attrs?.level === 4) return editorState.isH4;
      if (name === "heading" && attrs?.level === 5) return editorState.isH5;
      if (name === "bold") return editorState.isBold;
      if (name === "italic") return editorState.isItalic;
      if (name === "strike") return editorState.isStrike;
      if (name === "underline") return editorState.isUnderline;
      if (name === "bulletList") return editorState.isBulletList;
      if (name === "orderedList") return editorState.isOrderedList;
      if (name === "taskList") return editorState.isTaskList;
      if (name === "blockquote") return editorState.isBlockquote;
      return false;
    });
  });

  it("renders a local rich text draft with compact toolbar controls and no save actions", () => {
    render(<ThoughtRichTextDraftPage />);

    expect(screen.getByRole("heading", { level: 1, name: "新建碎碎念" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回碎碎念" })).toHaveAttribute("href", "/thoughts");
    expect(screen.getByText("当前为富文本编辑体验预览，暂不保存。")).toBeInTheDocument();
    expect(screen.getByLabelText("富文本工具栏")).toBeInTheDocument();

    ["撤销", "标题", "列表", "加粗", "删除线", "斜体", "下划线", "文字颜色"].forEach((name) => {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: "无序列表" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "H1" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "H1" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "H5" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "段落" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "重做" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "引用" })).not.toBeInTheDocument();

    expect(mockStarterKit.configure).toHaveBeenCalledWith({ underline: false });
    expect(capturedUseEditorOptions?.extensions).toEqual([{ name: "StarterKit", options: { underline: false } }, "Underline", "TextStyle", "Color", "TaskList", "TaskItem"]);
    expect(screen.getByLabelText("碎碎念富文本编辑纸张")).toBeInTheDocument();
    expect(screen.queryByLabelText("碎碎念富文本预览纸张")).not.toBeInTheDocument();
    expect(screen.queryByTestId("thought-rich-text-preview-frame")).not.toBeInTheDocument();
    expect(screen.queryByText("本地预览")).not.toBeInTheDocument();
    expect(screen.queryByText("开始写一点今天的小事。")).not.toBeInTheDocument();
    expect(capturedUseEditorOptions).not.toHaveProperty("onUpdate");
    expect(screen.queryByRole("button", { name: "保存" })).not.toBeInTheDocument();
  });

  it("styles rich text nodes so toolbar actions are visible in the editor", () => {
    render(<ThoughtRichTextDraftPage />);

    const editorFrame = screen.getByTestId("thought-rich-text-editor-frame");

    expect(editorFrame.className).toContain("[&_h1]:text-[1.65rem]");
    expect(editorFrame.className).toContain("[&_h2]:text-[1.35rem]");
    expect(editorFrame.className).toContain("[&_h3]:text-[1.15rem]");
    expect(editorFrame.className).toContain("[&_h4]:text-[1.05rem]");
    expect(editorFrame.className).toContain("[&_h5]:text-[0.95rem]");
    expect(editorFrame.className).not.toContain("[&_h2]:text-[#d97891]");
    expect(editorFrame.className).not.toContain("[&_h3]:text-[#d97891]");
    expect(editorFrame.className).toContain("[&_.ProseMirror-focused]:outline-none");
    expect(editorFrame.className).toContain("[&_.ProseMirror]:outline-none");
    expect(editorFrame.className).toContain("[&_strong]:font-black");
    expect(editorFrame.className).toContain("[&_s]:line-through");
    expect(editorFrame.className).toContain("[&_u]:underline");
    expect(editorFrame.className).toContain("[&_ul]:list-disc");
    expect(editorFrame.className).toContain("[&_ol]:list-decimal");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']]:list-none");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]]:flex");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]>label]:mt-1");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]>div]:flex-1");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:accent-[#d97891]");
    expect(editorFrame.className).toContain("[&_blockquote]:border-l-4");

    expect(screen.queryByTestId("thought-rich-text-preview-frame")).not.toBeInTheDocument();
  });

  it("runs heading and color dropdown commands and subscribes to editor state so toolbar buttons rerender", () => {
    const h3Chain = chainResult();
    const colorChain = chainResult();
    const defaultColorChain = chainResult();
    mockEditor.chain.mockReturnValueOnce(h3Chain).mockReturnValueOnce(colorChain).mockReturnValueOnce(defaultColorChain).mockImplementation(chainResult);
    const { rerender } = render(<ThoughtRichTextDraftPage />);

    fireEvent.click(screen.getByRole("button", { name: "标题" }));
    expect(screen.getByRole("menuitem", { name: "H1" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: "H3" }));
    expect(h3Chain.toggleHeading).toHaveBeenCalledWith({ level: 3 });
    expect(h3Chain.run).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "文字颜色" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "粉色" }));
    expect(colorChain.setColor).toHaveBeenCalledWith("#d97891");
    expect(colorChain.run).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "文字颜色" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "默认" }));
    expect(defaultColorChain.unsetColor).toHaveBeenCalledTimes(1);
    expect(defaultColorChain.run).toHaveBeenCalledTimes(1);

    expect(useEditorState).toHaveBeenCalledWith(
      expect.objectContaining({
        editor: mockEditor,
        selector: expect.any(Function),
      }),
    );
    expect(screen.getByRole("button", { name: "撤销" })).toBeDisabled();

    editorState = {
      ...editorState,
      canUndo: true,
      isBold: true,
      isH3: true,
      isStrike: true,
      isUnderline: true,
    };
    rerender(<ThoughtRichTextDraftPage />);

    expect(screen.getByRole("button", { name: "撤销" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "加粗" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "标题" })).toHaveTextContent("H3");
    expect(screen.getByRole("button", { name: "删除线" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "下划线" })).toHaveAttribute("aria-pressed", "true");
  });

  it("runs inline style commands from compact toolbar buttons", () => {
    const boldChain = chainResult();
    const strikeChain = chainResult();
    const italicChain = chainResult();
    const underlineChain = chainResult();
    mockEditor.chain
      .mockReturnValueOnce(boldChain)
      .mockReturnValueOnce(strikeChain)
      .mockReturnValueOnce(italicChain)
      .mockReturnValueOnce(underlineChain)
      .mockImplementation(chainResult);
    render(<ThoughtRichTextDraftPage />);

    fireEvent.click(screen.getByRole("button", { name: "加粗" }));
    expect(boldChain.toggleBold).toHaveBeenCalledTimes(1);
    expect(boldChain.run).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "删除线" }));
    expect(strikeChain.toggleStrike).toHaveBeenCalledTimes(1);
    expect(strikeChain.run).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "斜体" }));
    expect(italicChain.toggleItalic).toHaveBeenCalledTimes(1);
    expect(italicChain.run).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "下划线" }));
    expect(underlineChain.toggleUnderline).toHaveBeenCalledTimes(1);
    expect(underlineChain.run).toHaveBeenCalledTimes(1);
  });

  it("opens the list dropdown and runs bullet, ordered, and task list commands", () => {
    const bulletChain = chainResult();
    const orderedChain = chainResult();
    const taskChain = chainResult();
    mockEditor.chain.mockReturnValueOnce(bulletChain).mockReturnValueOnce(orderedChain).mockReturnValueOnce(taskChain).mockImplementation(chainResult);
    render(<ThoughtRichTextDraftPage />);

    fireEvent.click(screen.getByRole("button", { name: "列表" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "无序列表" }));
    expect(bulletChain.toggleBulletList).toHaveBeenCalledTimes(1);
    expect(bulletChain.run).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "列表" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "有序列表" }));
    expect(orderedChain.toggleOrderedList).toHaveBeenCalledTimes(1);
    expect(orderedChain.run).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "列表" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "任务列表" }));
    expect(taskChain.toggleTaskList).toHaveBeenCalledTimes(1);
    expect(taskChain.run).toHaveBeenCalledTimes(1);
  });
});
