import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
  isH6: false,
  isCodeBlock: false,
  isItalic: false,
  isLink: false,
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

vi.mock("@tiptap/extension-image", () => ({
  default: "Image",
}));

vi.mock("@tiptap/extension-link", () => ({
  default: "Link",
}));

vi.mock("@tiptap/extension-table", () => ({
  Table: "Table",
  TableCell: "TableCell",
  TableHeader: "TableHeader",
  TableRow: "TableRow",
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

vi.mock("emoji-picker-react", () => ({
  default: ({ onEmojiClick }: { onEmojiClick: (emojiData: { emoji: string }) => void }) => (
    <div aria-label="表情选择器" role="group">
      <button onClick={() => onEmojiClick({ emoji: "😊" })} type="button">
        选择笑脸
      </button>
    </div>
  ),
}));

function chainResult() {
  return {
    focus: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    addColumnAfter: vi.fn().mockReturnThis(),
    addRowAfter: vi.fn().mockReturnThis(),
    deleteColumn: vi.fn().mockReturnThis(),
    deleteRow: vi.fn().mockReturnThis(),
    extendMarkRange: vi.fn().mockReturnThis(),
    insertTable: vi.fn().mockReturnThis(),
    insertContent: vi.fn().mockReturnThis(),
    setImage: vi.fn().mockReturnThis(),
    setLink: vi.fn().mockReturnThis(),
    setParagraph: vi.fn().mockReturnThis(),
    setVideo: vi.fn().mockReturnThis(),
    toggleHeading: vi.fn().mockReturnThis(),
    toggleBold: vi.fn().mockReturnThis(),
    toggleItalic: vi.fn().mockReturnThis(),
    toggleStrike: vi.fn().mockReturnThis(),
    toggleUnderline: vi.fn().mockReturnThis(),
    toggleBulletList: vi.fn().mockReturnThis(),
    toggleOrderedList: vi.fn().mockReturnThis(),
    toggleTaskList: vi.fn().mockReturnThis(),
    toggleBlockquote: vi.fn().mockReturnThis(),
    toggleCodeBlock: vi.fn().mockReturnThis(),
    toggleLink: vi.fn().mockReturnThis(),
    undo: vi.fn().mockReturnThis(),
    unsetLink: vi.fn().mockReturnThis(),
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
      isH6: false,
      isCodeBlock: false,
      isItalic: false,
      isLink: false,
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
      if (name === "heading" && attrs?.level === 6) return editorState.isH6;
      if (name === "codeBlock") return editorState.isCodeBlock;
      if (name === "bold") return editorState.isBold;
      if (name === "italic") return editorState.isItalic;
      if (name === "link") return editorState.isLink;
      if (name === "strike") return editorState.isStrike;
      if (name === "underline") return editorState.isUnderline;
      if (name === "bulletList") return editorState.isBulletList;
      if (name === "orderedList") return editorState.isOrderedList;
      if (name === "taskList") return editorState.isTaskList;
      if (name === "blockquote") return editorState.isBlockquote;
      return false;
    });
  });

  it("renders a local rich text draft with a reference-style header and compact toolbar controls", () => {
    render(<ThoughtRichTextDraftPage />);

    expect(screen.getByRole("heading", { level: 1, name: "新建碎碎念" })).toHaveClass("text-xl", "sm:text-2xl");
    const backLink = screen.getByRole("link", { name: "返回碎碎念" });
    expect(backLink).toHaveAttribute("href", "/thoughts");
    expect(backLink).not.toHaveTextContent("←");
    expect(backLink.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "删除" })).toBeInTheDocument();
    expect(screen.queryByText("当前为富文本编辑体验预览，暂不保存。")).not.toBeInTheDocument();
    expect(screen.getByLabelText("富文本工具栏")).toBeInTheDocument();
    expect(screen.getByText("背景模板")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "横线纸" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "方格纸" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "暖色纸" })).toBeInTheDocument();
    expect(screen.getByLabelText("碎碎念编辑布局")).toHaveClass("grid", "xl:grid-cols-[max-content_minmax(18rem,1fr)]");
    const editorArea = screen.getAllByLabelText("富文本编辑区")[0];
    expect(editorArea).toHaveClass("w-fit", "max-w-full");
    expect(within(editorArea).getByLabelText("富文本工具栏")).toHaveClass("w-full", "max-w-full");
    expect(within(editorArea).getByLabelText("碎碎念富文本编辑纸张")).toHaveClass("w-full");
    expect(screen.getByLabelText("背景模板选择")).toHaveClass("h-full", "self-stretch", "xl:sticky", "xl:top-4", "min-w-0");
    expect(screen.getByLabelText("背景模板列表")).toHaveClass("grid", "grid-cols-2");
    expect(screen.getByLabelText("新建碎碎念编辑本")).toHaveClass("max-w-[1600px]");
    expect(screen.getByLabelText("新建碎碎念编辑本")).not.toHaveClass("album-page-scrollbar", "overflow-y-auto");
    expect(screen.getByLabelText("新建碎碎念内容滚动区")).not.toHaveClass("album-page-scrollbar", "overflow-y-auto");
    expect(screen.getByLabelText("碎碎念富文本编辑纸张")).toHaveClass("album-page-scrollbar", "h-[545px]", "overflow-y-auto");
    expect(screen.getByLabelText("碎碎念富文本编辑纸张")).not.toHaveClass("min-h-[545px]", "overflow-hidden");

    ["撤销", "H1", "H2", "H3", "无序列表", "有序列表", "任务列表", "加粗", "删除线", "斜体", "下划线", "代码块", "表格", "表情包", "文字颜色", "图片", "视频"].forEach((name) => {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    });
    expect(within(screen.getByLabelText("富文本工具栏")).queryByRole("button", { name: "背景" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "上传背景图片" })).toBeInTheDocument();
    ["H4", "H5", "H6"].forEach((name) => {
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
    });
    ["新增表格行", "删除表格行", "新增表格列", "删除表格列"].forEach((name) => {
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
      expect(screen.queryByRole("menuitem", { name })).not.toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: "链接" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("上传图片附件")).toHaveAttribute("accept", "image/*");
    expect(screen.getByLabelText("上传视频附件")).toHaveAttribute("accept", "video/*");
    const toolbarButtons = within(screen.getByLabelText("富文本工具栏")).getAllByRole("button");
    expect(toolbarButtons.map((button) => button.getAttribute("aria-label"))).toEqual(["H1", "H2", "H3", "无序列表", "有序列表", "任务列表", "加粗", "删除线", "斜体", "下划线", "代码块", "表格", "表情包", "文字颜色", "图片", "视频", "撤销"]);
    expect(screen.queryByRole("button", { name: "标题" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "列表" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "H1" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "无序列表" })).not.toBeInTheDocument();
    expect(screen.getAllByTestId("toolbar-divider")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "段落" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "重做" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "引用" })).not.toBeInTheDocument();

    expect(mockStarterKit.configure).toHaveBeenCalledWith({ underline: false });
    expect(capturedUseEditorOptions?.extensions).toEqual([{ name: "StarterKit", options: { underline: false } }, "Underline", "TextStyle", "Color", "TaskList", "TaskItem", "Image", "Link", "Table", "TableRow", "TableHeader", "TableCell", expect.objectContaining({ name: "video" })]);
    expect(screen.getByLabelText("碎碎念富文本编辑纸张")).toBeInTheDocument();
    expect(screen.queryByLabelText("碎碎念富文本预览纸张")).not.toBeInTheDocument();
    expect(screen.queryByTestId("thought-rich-text-preview-frame")).not.toBeInTheDocument();
    expect(screen.queryByText("本地预览")).not.toBeInTheDocument();
    expect(screen.queryByText("开始写一点今天的小事。")).not.toBeInTheDocument();
    expect(capturedUseEditorOptions).not.toHaveProperty("onUpdate");
  });

  it("styles rich text nodes so toolbar actions are visible in the editor", () => {
    render(<ThoughtRichTextDraftPage />);

    const editorFrame = screen.getByLabelText("碎碎念富文本编辑纸张");

    expect(editorFrame).toHaveClass("h-[545px]");
    expect(editorFrame).not.toHaveClass("min-h-[545px]");
    expect(editorFrame).not.toHaveClass("min-h-[585px]");
    expect(editorFrame).not.toHaveClass("min-h-[605px]");
    expect(editorFrame.className).not.toContain("border-dashed");
    expect(editorFrame.className).not.toContain("bg-white/45");
    expect(screen.queryByTestId("thought-rich-text-editor-frame")).not.toBeInTheDocument();
    expect(editorFrame.className).toContain("[&_h1]:text-[1.625rem]");
    expect(editorFrame.className).toContain("[&_h1]:leading-[32px]");
    expect(editorFrame.className).toContain("[&_h2]:text-[1.35rem]");
    expect(editorFrame.className).toContain("[&_h2]:leading-[32px]");
    expect(editorFrame.className).toContain("[&_h3]:text-[1.12rem]");
    expect(editorFrame.className).toContain("[&_h3]:leading-[32px]");
    expect(editorFrame.className).not.toContain("[&_h4]:text-");
    expect(editorFrame.className).not.toContain("[&_h5]:text-");
    expect(editorFrame.className).not.toContain("[&_h6]:text-");
    expect(editorFrame.className).not.toContain("[&_h2]:text-[#d97891]");
    expect(editorFrame.className).not.toContain("[&_h3]:text-[#d97891]");
    expect(editorFrame.className).toContain("[&_.ProseMirror-focused]:outline-none");
    expect(editorFrame.className).toContain("[&_.ProseMirror]:outline-none");
    expect(editorFrame.className).toContain("[&_.ProseMirror]:leading-[32px]");
    expect(editorFrame.className).toContain("[&_.ProseMirror]:pt-1");
    expect(editorFrame.className).toContain("[&_p]:my-0");
    expect(editorFrame.className).toContain("[&_p]:leading-[32px]");
    expect(editorFrame.className).toContain("[&_strong]:font-black");
    expect(editorFrame.className).toContain("[&_s]:line-through");
    expect(editorFrame.className).toContain("[&_u]:underline");
    expect(editorFrame.className).toContain("[&_ul]:list-disc");
    expect(editorFrame.className).toContain("[&_ol]:list-decimal");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']]:list-none");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]]:flex");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]]:leading-[32px]");
    expect(editorFrame.className).not.toContain("[&_ul[data-type='taskList']_li[data-checked]>label]:mt-1");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]>label]:flex");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]>label]:h-[32px]");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]>label]:items-center");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]>div]:flex-1");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]>div]:leading-[32px]");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]>div_p]:my-0");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]>div_p]:leading-[32px]");
    expect(editorFrame.className).not.toContain("[&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:accent-[#d97891]");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:appearance-none");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:rounded-[0.28rem]");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']]:border-[#d97891]");
    expect(editorFrame.className).toContain("[&_ul[data-type='taskList']_li[data-checked]>label_input[type='checkbox']:checked]:bg-[#d97891]");
    expect(editorFrame.className).not.toContain("bg-[url(");
    expect(editorFrame.className).toContain("thought-rich-text-editor");
    expect(editorFrame.className).toContain("[&_blockquote]:border-l-4");
    expect(editorFrame.className).toContain("[&_img]:max-w-full");
    expect(editorFrame.className).toContain("[&_pre]:my-3");
    expect(editorFrame.className).toContain("[&_pre]:rounded-[1rem]");
    expect(editorFrame.className).toContain("[&_pre]:border-[#ead7ce]");
    expect(editorFrame.className).toContain("[&_pre]:bg-[#fff6ec]");
    expect(editorFrame.className).not.toContain("[&_pre]:bg-[#3b2d31]");
    expect(editorFrame.className).toContain("[&_a]:text-[#d97891]");
    expect(editorFrame.className).toContain("[&_table]:w-full");
    expect(editorFrame.className).toContain("[&_table]:table-fixed");
    expect(editorFrame.className).toContain("[&_table]:rounded-[1rem]");
    expect(editorFrame.className).toContain("[&_table]:transition-[table-layout]");
    expect(editorFrame.className).toContain("[&_table]:duration-300");
    expect(editorFrame.className).toContain("[&_.ProseMirror-focused_table]:table-fixed");
    expect(editorFrame.className).toContain("[&_tr:first-child>*:first-child]:rounded-tl-[1rem]");
    expect(editorFrame.className).toContain("[&_tr:first-child>*:last-child]:rounded-tr-[1rem]");
    expect(editorFrame.className).toContain("[&_tr:last-child>*:first-child]:rounded-bl-[1rem]");
    expect(editorFrame.className).toContain("[&_tr:last-child>*:last-child]:rounded-br-[1rem]");
    expect(editorFrame.className).not.toContain("[&_th:first-child]:rounded-tl-[1rem]");
    expect(editorFrame.className).not.toContain("[&_th:last-child]:rounded-tr-[1rem]");
    expect(editorFrame.className).not.toContain("[&_tr:last-child_td:first-child]:rounded-bl-[1rem]");
    expect(editorFrame.className).not.toContain("[&_tr:last-child_td:last-child]:rounded-br-[1rem]");
    expect(editorFrame.className).toContain("[&_td]:border");
    expect(editorFrame.className).toContain("[&_td]:break-words");
    expect(editorFrame.className).toContain("[&_th]:border");
    expect(editorFrame.className).toContain("[&_th]:break-words");
    expect(editorFrame.className).toContain("[&_video]:max-w-full");
    expect(editorFrame.className).toContain("[&_video]:bg-[#2f2528]");

    expect(screen.queryByTestId("thought-rich-text-preview-frame")).not.toBeInTheDocument();
  });

  it("closes toolbar dropdowns when clicking outside the menu", () => {
    render(<ThoughtRichTextDraftPage />);

    const editorPaper = screen.getByLabelText("碎碎念富文本编辑纸张");

    expect(screen.queryByRole("button", { name: "标题" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "列表" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "文字颜色" }));
    expect(screen.getByRole("menuitem", { name: "默认" })).toBeInTheDocument();
    fireEvent.mouseDown(editorPaper);
    expect(screen.queryByRole("menuitem", { name: "默认" })).not.toBeInTheDocument();
  });

  it("customizes editor paper background image and opacity while keeping notebook lines", () => {
    const objectUrlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:thought-paper-bg");
    const revokeObjectUrlSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    render(<ThoughtRichTextDraftPage />);

    const editorPaper = screen.getByLabelText("碎碎念富文本编辑纸张");
    expect(editorPaper.className).toContain("bg-[repeating-linear-gradient(0deg,#fffdf7_0,#fffdf7_31px,#efe6d8_32px)]");
    expect(editorPaper).not.toHaveAttribute("style");

    const backgroundPanel = screen.getByLabelText("背景模板选择");
    const backgroundImageInput = screen.getByLabelText("上传背景图");

    expect(backgroundImageInput).toHaveAttribute("accept", "image/*");
    expect(within(backgroundPanel).queryByLabelText("背景透明度")).not.toBeInTheDocument();
    expect(within(backgroundPanel).queryByRole("button", { name: "恢复默认背景" })).not.toBeInTheDocument();

    fireEvent.change(backgroundImageInput, { target: { files: [new File(["paper"], "paper.png", { type: "image/png" })] } });
    const backgroundOpacityInput = within(backgroundPanel).getByLabelText("背景透明度");
    expect(backgroundOpacityInput).toHaveValue("100");
    expect(within(backgroundPanel).getByText("已选择背景图")).toBeInTheDocument();

    fireEvent.change(backgroundOpacityInput, { target: { value: "45" } });

    expect(objectUrlSpy).toHaveBeenCalledTimes(1);
    expect(editorPaper.getAttribute("style")).toContain("blob:thought-paper-bg");
    expect(editorPaper.getAttribute("style")).toContain("rgba(255, 253, 247, 0.55)");
    expect(editorPaper.getAttribute("style")).toContain("repeating-linear-gradient");
    expect(editorPaper.className).toContain("bg-[repeating-linear-gradient(0deg,#fffdf7_0,#fffdf7_31px,#efe6d8_32px)]");

    fireEvent.click(within(backgroundPanel).getByRole("button", { name: "恢复默认背景" }));

    expect(within(backgroundPanel).queryByLabelText("背景透明度")).not.toBeInTheDocument();
    expect(screen.getByLabelText("碎碎念富文本编辑纸张").getAttribute("style") ?? "").toBe("");
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith("blob:thought-paper-bg");
  });

  it("runs heading and color dropdown commands and subscribes to editor state so toolbar buttons rerender", () => {
    const h3Chain = chainResult();
    const colorChain = chainResult();
    const defaultColorChain = chainResult();
    mockEditor.chain.mockReturnValueOnce(h3Chain).mockReturnValueOnce(colorChain).mockReturnValueOnce(defaultColorChain).mockImplementation(chainResult);
    const { rerender } = render(<ThoughtRichTextDraftPage />);

    fireEvent.click(screen.getByRole("button", { name: "H3" }));
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
      isCodeBlock: true,
      isH3: true,
      isStrike: true,
      isUnderline: true,
    };
    rerender(<ThoughtRichTextDraftPage />);

    expect(screen.getByRole("button", { name: "撤销" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "加粗" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "代码块" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: "链接" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "H3" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "删除线" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "下划线" })).toHaveAttribute("aria-pressed", "true");
  });

  it("uploads image and video attachments then inserts media nodes into the editor", async () => {
    const imageChain = chainResult();
    const videoChain = chainResult();
    mockEditor.chain.mockReturnValueOnce(imageChain).mockReturnValueOnce(videoChain).mockImplementation(chainResult);
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({ ok: true, json: async () => ({ attachment: { type: "image", url: "/uploads/thoughts/cat.png", fileName: "cat.png" } }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ attachment: { type: "video", url: "/uploads/thoughts/clip.mp4", fileName: "clip.mp4" } }) } as Response);

    render(<ThoughtRichTextDraftPage />);

    const imageInput = screen.getByLabelText("上传图片附件");
    const videoInput = screen.getByLabelText("上传视频附件");
    fireEvent.change(imageInput, { target: { files: [new File(["image"], "cat.png", { type: "image/png" })] } });

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("附件上传完成"));
    const uploadToast = screen.getByRole("status");
    expect(uploadToast).toHaveClass("fixed", "right-6", "top-6");
    expect(fetchMock).toHaveBeenCalledWith("/api/thoughts/attachments", expect.objectContaining({ method: "POST", body: expect.any(FormData) }));
    expect(imageChain.setImage).toHaveBeenCalledWith({ src: "/uploads/thoughts/cat.png" });
    expect(imageChain.run).toHaveBeenCalledTimes(1);

    fireEvent.change(videoInput, { target: { files: [new File(["video"], "clip.mp4", { type: "video/mp4" })] } });

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("附件上传完成"));
    expect(videoChain.setVideo).toHaveBeenCalledWith({ src: "/uploads/thoughts/clip.mp4" });
    expect(videoChain.run).toHaveBeenCalledTimes(1);
  });

  it("shows attachment upload errors without saving the thought", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: false, json: async () => ({ error: "只支持上传图片或视频附件" }) } as Response);
    render(<ThoughtRichTextDraftPage />);

    fireEvent.change(screen.getByLabelText("上传图片附件"), { target: { files: [new File(["text"], "note.txt", { type: "text/plain" })] } });

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("只支持上传图片或视频附件"));
    const errorToast = screen.getByRole("alert");
    expect(errorToast).toHaveClass("fixed", "right-6", "top-6");
  });

  it("hides attachment toast automatically", async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: true, json: async () => ({ attachment: { type: "image", url: "/uploads/thoughts/cat.png", fileName: "cat.png" } }) } as Response);
    render(<ThoughtRichTextDraftPage />);

    fireEvent.change(screen.getByLabelText("上传图片附件"), { target: { files: [new File(["image"], "cat.png", { type: "image/png" })] } });

    await vi.waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("附件上传完成"));
    act(() => {
      vi.advanceTimersByTime(2600);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("runs inline style commands from compact toolbar buttons", () => {
    const boldChain = chainResult();
    const strikeChain = chainResult();
    const italicChain = chainResult();
    const underlineChain = chainResult();
    const codeBlockChain = chainResult();
    mockEditor.chain
      .mockReturnValueOnce(boldChain)
      .mockReturnValueOnce(strikeChain)
      .mockReturnValueOnce(italicChain)
      .mockReturnValueOnce(underlineChain)
      .mockReturnValueOnce(codeBlockChain)
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

    fireEvent.click(screen.getByRole("button", { name: "代码块" }));
    expect(codeBlockChain.toggleCodeBlock).toHaveBeenCalledTimes(1);
    expect(codeBlockChain.run).toHaveBeenCalledTimes(1);
  });

  it("runs table editing commands from toolbar buttons", () => {
    const tableChain = chainResult();
    const addRowChain = chainResult();
    const deleteRowChain = chainResult();
    const addColumnChain = chainResult();
    const deleteColumnChain = chainResult();
    mockEditor.chain
      .mockReturnValueOnce(tableChain)
      .mockReturnValueOnce(addRowChain)
      .mockReturnValueOnce(deleteRowChain)
      .mockReturnValueOnce(addColumnChain)
      .mockReturnValueOnce(deleteColumnChain)
      .mockImplementation(chainResult);
    render(<ThoughtRichTextDraftPage />);

    fireEvent.click(screen.getByRole("button", { name: "表格" }));
    expect(screen.getByRole("menuitem", { name: "插入表格" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "新增表格行" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "删除表格行" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "新增表格列" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "删除表格列" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("menuitem", { name: "插入表格" }));
    expect(tableChain.insertTable).toHaveBeenCalledWith({ cols: 3, rows: 3, withHeaderRow: true });
    expect(tableChain.run).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "表格" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "新增表格行" }));
    expect(addRowChain.addRowAfter).toHaveBeenCalledTimes(1);
    expect(addRowChain.run).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "表格" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "删除表格行" }));
    expect(deleteRowChain.deleteRow).toHaveBeenCalledTimes(1);
    expect(deleteRowChain.run).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "表格" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "新增表格列" }));
    expect(addColumnChain.addColumnAfter).toHaveBeenCalledTimes(1);
    expect(addColumnChain.run).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "表格" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "删除表格列" }));
    expect(deleteColumnChain.deleteColumn).toHaveBeenCalledTimes(1);
    expect(deleteColumnChain.run).toHaveBeenCalledTimes(1);
  });

  it("opens the emoji picker from the toolbar and inserts the selected emoji", () => {
    const emojiChain = chainResult();
    mockEditor.chain.mockImplementation(() => emojiChain);
    render(<ThoughtRichTextDraftPage />);

    fireEvent.click(screen.getByRole("button", { name: "表情包" }));

    expect(screen.getByRole("group", { name: "表情选择器" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "选择笑脸" }));

    expect(emojiChain.insertContent).toHaveBeenCalledWith(" 😊 ");
    expect(emojiChain.run).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("group", { name: "表情选择器" })).not.toBeInTheDocument();
  });

  it("closes the emoji picker when opening other toolbar menus or clicking outside", () => {
    render(<ThoughtRichTextDraftPage />);

    fireEvent.click(screen.getByRole("button", { name: "表情包" }));
    expect(screen.getByRole("group", { name: "表情选择器" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "表格" }));
    expect(screen.queryByRole("group", { name: "表情选择器" })).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "插入表格" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "表格" }));
    fireEvent.click(screen.getByRole("button", { name: "表情包" }));
    expect(screen.getByRole("group", { name: "表情选择器" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "文字颜色" }));
    expect(screen.queryByRole("group", { name: "表情选择器" })).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "默认" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "文字颜色" }));
    fireEvent.click(screen.getByRole("button", { name: "表情包" }));
    expect(screen.getByRole("group", { name: "表情选择器" })).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByLabelText("碎碎念富文本编辑纸张"));
    expect(screen.queryByRole("group", { name: "表情选择器" })).not.toBeInTheDocument();
  });

  it("uses an in-page dialog before deleting the table header row", () => {
    mockEditor.isActive.mockImplementation((name: string, attrs?: { level?: number }) => {
      if (name === "tableHeader") return true;
      if (name === "heading" && attrs?.level === 1) return editorState.isH1;
      if (name === "heading" && attrs?.level === 2) return editorState.isH2;
      if (name === "heading" && attrs?.level === 3) return editorState.isH3;
      if (name === "heading" && attrs?.level === 4) return editorState.isH4;
      if (name === "heading" && attrs?.level === 5) return editorState.isH5;
      if (name === "heading" && attrs?.level === 6) return editorState.isH6;
      if (name === "codeBlock") return editorState.isCodeBlock;
      if (name === "bold") return editorState.isBold;
      if (name === "italic") return editorState.isItalic;
      if (name === "link") return editorState.isLink;
      if (name === "strike") return editorState.isStrike;
      if (name === "underline") return editorState.isUnderline;
      if (name === "bulletList") return editorState.isBulletList;
      if (name === "orderedList") return editorState.isOrderedList;
      if (name === "taskList") return editorState.isTaskList;
      if (name === "blockquote") return editorState.isBlockquote;
      return false;
    });
    const confirmedDeleteRowChain = chainResult();
    mockEditor.chain.mockReturnValueOnce(confirmedDeleteRowChain).mockImplementation(chainResult);
    const confirmSpy = vi.spyOn(window, "confirm");
    render(<ThoughtRichTextDraftPage />);

    fireEvent.click(screen.getByRole("button", { name: "表格" }));
    mockEditor.chain.mockClear();
    fireEvent.click(screen.getByRole("menuitem", { name: "删除表格行" }));

    expect(confirmSpy).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", { name: "删除表头行" });
    expect(dialog).toHaveTextContent("确定要删除表头行吗？");
    expect(mockEditor.chain).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole("button", { name: "取消" }));
    expect(screen.queryByRole("dialog", { name: "删除表头行" })).not.toBeInTheDocument();
    expect(mockEditor.chain).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "表格" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "删除表格行" }));
    fireEvent.click(screen.getByRole("button", { name: "确认删除" }));

    expect(confirmedDeleteRowChain.deleteRow).toHaveBeenCalledTimes(1);
    expect(confirmedDeleteRowChain.run).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog", { name: "删除表头行" })).not.toBeInTheDocument();
  });

  it("runs bullet, ordered, and task list commands from flat toolbar buttons", () => {
    const bulletChain = chainResult();
    const orderedChain = chainResult();
    const taskChain = chainResult();
    mockEditor.chain.mockReturnValueOnce(bulletChain).mockReturnValueOnce(orderedChain).mockReturnValueOnce(taskChain).mockImplementation(chainResult);
    render(<ThoughtRichTextDraftPage />);

    fireEvent.click(screen.getByRole("button", { name: "无序列表" }));
    expect(bulletChain.toggleBulletList).toHaveBeenCalledTimes(1);
    expect(bulletChain.run).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "有序列表" }));
    expect(orderedChain.toggleOrderedList).toHaveBeenCalledTimes(1);
    expect(orderedChain.run).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "任务列表" }));
    expect(taskChain.toggleTaskList).toHaveBeenCalledTimes(1);
    expect(taskChain.run).toHaveBeenCalledTimes(1);
  });
});
