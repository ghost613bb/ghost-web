import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEditorState } from "@tiptap/react";
import type { Thought } from "@/data/thoughts";
import { ThoughtRichTextDraftPage } from "./ThoughtRichTextDraftPage";

const mockStarterKit = vi.hoisted(() => ({
  configure: vi.fn((options: unknown) => ({ name: "StarterKit", options })),
}));

const mockRouter = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
}));

const mockEditor = {
  chain: vi.fn(),
  can: vi.fn(),
  getHTML: vi.fn(),
  getText: vi.fn(),
  isActive: vi.fn(),
  setEditable: vi.fn(),
};

let capturedUseEditorOptions: { content?: unknown; editable?: boolean; extensions?: unknown[]; immediatelyRender?: boolean; onUpdate?: unknown } | undefined;
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

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

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
  useEditor: vi.fn((options: { content?: unknown; editable?: boolean; extensions?: unknown[]; immediatelyRender?: boolean; onUpdate?: unknown }) => {
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
    class MockFileReader extends EventTarget {
      result: string | null = null;

      readAsDataURL() {
        this.result = "data:image/png;base64,custom-paper-bg";
        this.dispatchEvent(new Event("load"));
      }
    }

    vi.restoreAllMocks();
    vi.stubGlobal("FileReader", MockFileReader);
    capturedUseEditorOptions = undefined;
    window.localStorage.clear();
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
    mockRouter.push.mockClear();
    mockRouter.refresh.mockClear();
    mockRouter.replace.mockClear();
    mockEditor.chain.mockImplementation(chainResult);
    mockEditor.getHTML.mockReturnValue("<p>今天写了一点碎碎念</p>");
    mockEditor.getText.mockReturnValue("今天写了一点碎碎念");
    mockEditor.setEditable.mockClear();
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
    expect(screen.getByRole("button", { name: "保存" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "删除" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "编辑" })).not.toBeInTheDocument();
    expect(screen.queryByText("当前为富文本编辑体验预览，暂不保存。")).not.toBeInTheDocument();
    expect(screen.getByLabelText("富文本工具栏")).toBeInTheDocument();
    expect(screen.getByText("背景模板")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "收起" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "全部" })).not.toBeInTheDocument();
    ["简约", "可爱", "手账", "自然"].forEach((name) => {
      expect(screen.queryByText(name)).not.toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "糖果波纹" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "粉心回响" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "海盐边框" })).toBeInTheDocument();
    expect(screen.getByLabelText("碎碎念编辑布局")).toHaveClass("grid", "xl:grid-cols-[minmax(0,70rem)_minmax(18rem,1fr)]");
    const editorArea = screen.getAllByLabelText("富文本编辑区")[0];
    expect(editorArea).toHaveClass("w-full", "max-w-full", "min-w-0");
    expect(within(editorArea).getByLabelText("富文本工具栏")).toHaveClass("w-full", "max-w-full", "min-w-0");
    expect(within(editorArea).getByLabelText("碎碎念富文本编辑纸张")).toHaveClass("w-full", "min-w-0");
    expect(screen.getByLabelText("背景模板选择")).toHaveClass("h-full", "self-stretch", "xl:sticky", "xl:top-4", "min-w-0");
    expect(screen.getByLabelText("背景模板列表")).toHaveClass("album-page-scrollbar", "grid", "max-h-[23.875rem]", "grid-cols-2", "overflow-y-auto");
    expect(screen.getByLabelText("新建碎碎念编辑本")).toHaveClass("max-w-[1600px]");
    expect(screen.getByLabelText("新建碎碎念编辑本")).not.toHaveClass("album-page-scrollbar", "overflow-y-auto");
    expect(screen.getByLabelText("新建碎碎念内容滚动区")).not.toHaveClass("album-page-scrollbar", "overflow-y-auto");
    expect(screen.getByLabelText("碎碎念富文本编辑纸张")).toHaveClass("album-page-scrollbar", "h-[545px]", "overflow-y-auto");
    expect(screen.getByLabelText("碎碎念富文本编辑纸张")).not.toHaveClass("min-h-[545px]", "overflow-hidden");

    ["撤销", "H1", "H2", "H3", "无序列表", "有序列表", "任务列表", "加粗", "删除线", "斜体", "下划线", "代码块", "表格", "表情包", "文字颜色", "图片", "视频"].forEach((name) => {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    });
    expect(within(screen.getByLabelText("富文本工具栏")).queryByRole("button", { name: "背景" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "自定义背景" })).toBeInTheDocument();
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
    expect(capturedUseEditorOptions?.content).toBe("");
    expect(capturedUseEditorOptions?.editable).toBe(true);
    expect(capturedUseEditorOptions?.immediatelyRender).toBe(false);
    expect(capturedUseEditorOptions?.extensions).toEqual([{ name: "StarterKit", options: { underline: false } }, "Underline", "TextStyle", "Color", "TaskList", "TaskItem", "Image", "Link", "Table", "TableRow", "TableHeader", "TableCell", expect.objectContaining({ name: "video" })]);
    expect(screen.getByLabelText("碎碎念富文本编辑纸张")).toBeInTheDocument();
    expect(screen.queryByLabelText("碎碎念富文本预览纸张")).not.toBeInTheDocument();
    expect(screen.queryByTestId("thought-rich-text-preview-frame")).not.toBeInTheDocument();
    expect(screen.queryByText("本地预览")).not.toBeInTheDocument();
    expect(screen.queryByText("开始写一点今天的小事。")).not.toBeInTheDocument();
    expect(capturedUseEditorOptions).not.toHaveProperty("onUpdate");
  });

  it("renders an existing thought in read-only mode with its title and escaped initial editor content", () => {
    const thought: Thought = {
      body: "第一行 <script>\n\n第二行 & more",
      createdAt: "2026-06-05T08:30:00.000Z",
      id: "thought-editing",
      slug: "thought-editing",
      status: "published",
      tags: ["日常"],
      title: "已有碎碎念",
      visibility: "public",
    };

    render(<ThoughtRichTextDraftPage thought={thought} />);

    expect(screen.getByRole("heading", { level: 1, name: "已有碎碎念" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1, name: "编辑碎碎念" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "编辑" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "H1" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "加粗" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "图片" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "糖果波纹" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "自定义背景" })).toBeDisabled();
    expect(screen.getByText(/写入时间/)).toBeInTheDocument();
    expect(screen.getByText(/2026\.06\.05 16:30/)).toBeInTheDocument();
    expect(screen.queryByText(/上次编辑时间/)).not.toBeInTheDocument();
    expect(capturedUseEditorOptions?.editable).toBe(false);
    expect(capturedUseEditorOptions?.content).toBe("<p>第一行 &lt;script&gt;</p><p></p><p>第二行 &amp; more</p>");
  });

  it("keeps stored HTML content as editor content", () => {
    render(<ThoughtRichTextDraftPage thought={{ body: "<p>已经保存的<strong>富文本</strong></p>", id: "html-thought", slug: "html-thought", status: "published", title: "富文本", visibility: "public" }} />);

    expect(capturedUseEditorOptions?.content).toBe("<p>已经保存的<strong>富文本</strong></p>");
  });

  it("enters edit mode from an existing thought", () => {
    render(<ThoughtRichTextDraftPage thought={{ body: "正文", id: "thought-edit", slug: "thought-edit", status: "published", title: "可编辑碎碎念", visibility: "public" }} />);

    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "H1" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "编辑" }));

    expect(screen.getByRole("button", { name: "保存" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "H1" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "加粗" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "图片" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "糖果波纹" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "自定义背景" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "编辑" })).toBeDisabled();
    expect(mockEditor.setEditable).toHaveBeenCalledWith(true);
  });

  it("saves an existing thought with editor HTML and keeps created time while refreshing updated time", async () => {
    const thought: Thought = {
      body: "旧内容",
      createdAt: "2026-06-05T08:30:00.000Z",
      id: "thought-editing",
      slug: "thought-editing",
      sortOrder: 3,
      status: "published",
      tags: ["日常"],
      title: "已有碎碎念",
      updatedAt: "2026-06-05T08:30:00.000Z",
      visibility: "public",
    };
    mockEditor.getHTML.mockReturnValue("<p>更新后的富文本</p>");
    mockEditor.getText.mockReturnValue("更新后的富文本");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: true, json: async () => ({ thought: { ...thought, body: "<p>更新后的富文本</p>", updatedAt: "2026-06-06T09:45:00.000Z" } }) } as Response);

    render(<ThoughtRichTextDraftPage thought={thought} />);
    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "编辑" }));
    fireEvent.click(screen.getByRole("button", { name: "糖果波纹" }));
    fireEvent.change(screen.getByLabelText("背景透明度"), { target: { value: "45" } });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/thoughts", expect.objectContaining({ method: "POST" })));
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const payload = JSON.parse(String(request.body));
    expect(payload).toEqual(expect.objectContaining({
      body: "<p>更新后的富文本</p>",
      createdAt: "2026-06-05T08:30:00.000Z",
      id: "thought-editing",
      paperBackgroundImageUrl: "/thought-backgrounds/candy-waves.jpg",
      paperBackgroundOpacity: 45,
      slug: "thought-editing",
      sortOrder: 3,
      status: "published",
      tags: ["日常"],
      title: "已有碎碎念",
      visibility: "public",
    }));
    expect(payload.createdAt).toBe("2026-06-05T08:30:00.000Z");
    expect(payload.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(payload.updatedAt).not.toBe(payload.createdAt);
    const successToast = await screen.findByText("保存成功");
    expect(successToast).toHaveClass("fixed", "left-1/2", "top-24", "-translate-x-1/2");
    expect(successToast).not.toHaveClass("right-6");
    expect(screen.getByText("写入时间 2026.06.05 16:30", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("上次编辑时间 2026.06.06 17:45", { selector: "span" })).toBeInTheDocument();
    expect(mockRouter.replace).toHaveBeenCalledWith("/thoughts/thought-editing");
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1);
  });

  it("serializes video nodes without requiring child content", () => {
    render(<ThoughtRichTextDraftPage />);
    const videoExtension = capturedUseEditorOptions?.extensions?.find((extension) => typeof extension === "object" && extension !== null && "name" in extension && extension.name === "video") as { config?: { renderHTML: (props: { HTMLAttributes: Record<string, string> }) => unknown } } | undefined;

    expect(videoExtension?.config?.renderHTML({ HTMLAttributes: { src: "/thought-attachments/demo.mp4" } })).toEqual(["video", expect.objectContaining({ controls: "true", src: "/thought-attachments/demo.mp4" })]);
  });

  it("saves a new thought with generated metadata", async () => {
    mockEditor.getHTML.mockReturnValue("<p>新的碎碎念内容</p>");
    mockEditor.getText.mockReturnValue("新的碎碎念内容");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementationOnce(async (_input, init) => ({ ok: true, json: async () => ({ thought: { ...JSON.parse(String(init?.body)), slug: "new-thought-slug" } }) }) as Response);

    render(<ThoughtRichTextDraftPage />);
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/thoughts", expect.objectContaining({ method: "POST" })));
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const payload = JSON.parse(String(request.body));
    expect(payload).toEqual(expect.objectContaining({ body: "<p>新的碎碎念内容</p>", tags: ["日常"], title: "新的碎碎念内容", visibility: "public", status: "published" }));
    expect(payload.id).toMatch(/^thought-created-/);
    expect(payload.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(payload.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(payload.updatedAt).toBe(payload.createdAt);
    expect(payload.sortOrder).toBeLessThan(2147483647);
    expect(mockRouter.replace).toHaveBeenCalledWith("/thoughts/new-thought-slug");
  });

  it("saves a pending custom background as a data url instead of a blob url", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:thought-paper-bg");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    mockEditor.getHTML.mockReturnValue("<p>带自定义背景</p>");
    mockEditor.getText.mockReturnValue("带自定义背景");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementationOnce(async (_input, init) => ({ ok: true, json: async () => ({ thought: { ...JSON.parse(String(init?.body)), slug: "custom-bg" } }) }) as Response);

    render(<ThoughtRichTextDraftPage />);
    fireEvent.change(screen.getByLabelText("上传背景图"), { target: { files: [new File(["paper"], "paper.png", { type: "image/png" })] } });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const payload = JSON.parse(String(request.body));
    expect(payload.paperBackgroundImageUrl).toBe("data:image/png;base64,custom-paper-bg");
    expect(payload.paperBackgroundImageUrl).not.toContain("blob:");
  });

  it("restores a saved paper background and can clear it when editing", async () => {
    const thought: Thought = { body: "旧内容", id: "thought-bg", slug: "thought-bg", status: "published", title: "背景碎碎念", visibility: "public", paperBackgroundImageUrl: "/thought-backgrounds/pink-heart.jpg", paperBackgroundOpacity: 40 };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: true, json: async () => ({ thought: { ...thought, body: "<p>今天写了一点碎碎念</p>", paperBackgroundImageUrl: undefined, paperBackgroundOpacity: undefined } }) } as Response);

    render(<ThoughtRichTextDraftPage thought={thought} />);

    expect(screen.getByLabelText("碎碎念富文本编辑纸张").getAttribute("style")).toContain("/thought-backgrounds/pink-heart.jpg");
    expect(screen.getByLabelText("碎碎念富文本编辑纸张").getAttribute("style")).toContain("rgba(255, 253, 247, 0.6)");
    expect(screen.getByLabelText("背景透明度")).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "编辑" }));
    expect(screen.getByLabelText("背景透明度")).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "恢复默认背景" }));
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const payload = JSON.parse(String(request.body));
    expect(payload).not.toHaveProperty("paperBackgroundImageUrl");
    expect(payload).not.toHaveProperty("paperBackgroundOpacity");
  });

  it("blocks saving while a blob background is still being processed", () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:thought-paper-bg");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.stubGlobal(
      "FileReader",
      class MockSlowFileReader extends EventTarget {
        result: string | null = null;
        readAsDataURL() {}
      },
    );
    const fetchMock = vi.spyOn(globalThis, "fetch");

    render(<ThoughtRichTextDraftPage />);
    fireEvent.change(screen.getByLabelText("上传背景图"), { target: { files: [new File(["paper"], "paper.png", { type: "image/png" })] } });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("背景图处理中，请稍后保存");
  });

  it("blocks saving empty content", async () => {
    mockEditor.getHTML.mockReturnValue("<p></p>");
    mockEditor.getText.mockReturnValue("");
    const fetchMock = vi.spyOn(globalThis, "fetch");

    render(<ThoughtRichTextDraftPage />);
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("先写一点内容再保存");
  });

  it("shows save API errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: false, json: async () => ({ error: "保存被拒绝" }) } as Response);

    render(<ThoughtRichTextDraftPage />);
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("保存被拒绝"));
  });

  it("confirms deleting an existing thought before calling the delete API", async () => {
    const thought: Thought = { body: "要删除", id: "thought-delete", slug: "thought-delete", status: "published", title: "要删除的碎碎念", visibility: "public" };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) } as Response);

    render(<ThoughtRichTextDraftPage thought={thought} />);
    fireEvent.click(screen.getByRole("button", { name: "删除" }));

    const dialog = screen.getByRole("dialog", { name: "删除碎碎念确认弹窗" });
    expect(dialog).toHaveTextContent("确认删除「要删除的碎碎念」吗？");
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole("button", { name: "确认删除" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/thoughts/thought-delete", { method: "DELETE" }));
    expect(mockRouter.push).toHaveBeenCalledWith("/thoughts");
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1);
  });

  it("keeps the delete dialog open when delete fails", async () => {
    const thought: Thought = { body: "要删除", id: "thought-delete", slug: "thought-delete", status: "published", title: "要删除的碎碎念", visibility: "public" };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: false, json: async () => ({ error: "删除失败了" }) } as Response);

    render(<ThoughtRichTextDraftPage thought={thought} />);
    fireEvent.click(screen.getByRole("button", { name: "删除" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "删除碎碎念确认弹窗" })).getByRole("button", { name: "确认删除" }));

    await waitFor(() => expect(within(screen.getByRole("dialog", { name: "删除碎碎念确认弹窗" })).getByRole("alert")).toHaveTextContent("删除失败了"));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("confirms discarding a new draft without calling delete API", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    render(<ThoughtRichTextDraftPage />);
    fireEvent.click(screen.getByRole("button", { name: "删除" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "删除碎碎念确认弹窗" })).getByRole("button", { name: "确认放弃" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith("/thoughts");
  });

  it("collapses the background template panel and lets the editor fill the remaining space", () => {
    render(<ThoughtRichTextDraftPage />);

    fireEvent.click(screen.getByRole("button", { name: "收起" }));

    expect(screen.queryByLabelText("背景模板列表")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "自定义背景" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("碎碎念编辑布局")).toHaveClass("xl:grid-cols-[minmax(0,1fr)_auto]");
    expect(screen.getAllByLabelText("富文本编辑区")[0]).toHaveClass("w-full", "max-w-full");
    expect(screen.getByLabelText("碎碎念富文本编辑纸张")).toHaveClass("w-full", "h-[545px]");
    expect(screen.getByLabelText("碎碎念富文本编辑纸张")).not.toHaveClass("h-[calc(100dvh-13rem)]");
    expect(screen.getByLabelText("背景模板选择")).toHaveClass("h-[604px]", "w-11", "overflow-hidden", "rounded-full", "p-1.5");
    expect(screen.getByLabelText("背景模板选择")).not.toHaveClass("h-full", "self-stretch", "xl:sticky", "xl:top-4");
    expect(screen.getByRole("button", { name: "展开背景模板" })).toBeInTheDocument();
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
    expect(editorFrame.className).not.toContain("[&_img]:max-w-full");
    expect(editorFrame.className).toContain("[&_img]:float-left");
    expect(editorFrame.className).toContain("[&_img]:max-w-[45%]");
    expect(editorFrame.className).toContain("[&_img]:mr-4");
    expect(editorFrame.className).not.toContain("[&_img]:align-middle");
    expect(editorFrame.className).not.toContain("[&_img]:my-0");
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

    fireEvent.click(within(backgroundPanel).getByRole("button", { name: "糖果波纹" }));
    expect(within(backgroundPanel).getByLabelText("背景透明度")).toHaveValue("52");
    expect(editorPaper.getAttribute("style")).toContain("/thought-backgrounds/candy-waves.jpg");

    fireEvent.click(within(backgroundPanel).getByRole("button", { name: "恢复默认背景" }));

    fireEvent.change(backgroundImageInput, { target: { files: [new File(["paper"], "paper.png", { type: "image/png" })] } });
    const backgroundOpacityInput = within(backgroundPanel).getByLabelText("背景透明度");
    expect(backgroundOpacityInput).toHaveValue("52");
    expect(within(backgroundPanel).getByText("已选择背景图")).toBeInTheDocument();
    expect(screen.getByText("把这张自定义背景保存到模板，下次可直接选择。")).toHaveClass("text-xs");
    expect(screen.getByText("把这张自定义背景保存到模板，下次可直接选择。").parentElement).toHaveClass("fixed", "bottom-5", "right-5");

    fireEvent.change(backgroundOpacityInput, { target: { value: "45" } });

    expect(objectUrlSpy).toHaveBeenCalledTimes(1);
    expect(editorPaper.getAttribute("style")).toContain("blob:thought-paper-bg");
    expect(editorPaper.getAttribute("style")).toContain("rgba(255, 253, 247, 0.55)");
    expect(editorPaper.getAttribute("style")).toContain("repeating-linear-gradient");
    expect(editorPaper.className).toContain("bg-[repeating-linear-gradient(0deg,#fffdf7_0,#fffdf7_31px,#efe6d8_32px)]");

    fireEvent.click(within(backgroundPanel).getByRole("button", { name: "保存为背景模板" }));
    expect(within(backgroundPanel).getByRole("button", { name: "自定义背景 1" })).toBeInTheDocument();
    expect(window.localStorage.getItem("ghost.thoughts.customPaperTemplates")).toContain("data:image/png;base64,custom-paper-bg");
    expect(within(backgroundPanel).queryByRole("button", { name: "保存为背景模板" })).not.toBeInTheDocument();

    fireEvent.click(within(backgroundPanel).getByRole("button", { name: "自定义背景 1" }));
    expect(editorPaper.getAttribute("style")).toContain("data:image/png;base64,custom-paper-bg");

    fireEvent.contextMenu(within(backgroundPanel).getByRole("button", { name: "糖果波纹" }));
    expect(screen.queryByRole("menuitem", { name: "重命名" })).not.toBeInTheDocument();

    const promptSpy = vi.spyOn(window, "prompt");
    fireEvent.contextMenu(within(backgroundPanel).getByRole("button", { name: "自定义背景 1" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "重命名" }));

    expect(promptSpy).not.toHaveBeenCalled();
    const renameDialog = screen.getByRole("dialog", { name: "重命名背景模板" });
    const renameInput = within(renameDialog).getByLabelText("模板名称");
    expect(renameInput).toHaveValue("自定义背景 1");

    fireEvent.change(renameInput, { target: { value: "我的背景" } });
    fireEvent.click(within(renameDialog).getByRole("button", { name: "确认重命名" }));

    expect(screen.queryByRole("dialog", { name: "重命名背景模板" })).not.toBeInTheDocument();
    expect(within(backgroundPanel).getByRole("button", { name: "我的背景" })).toBeInTheDocument();
    expect(window.localStorage.getItem("ghost.thoughts.customPaperTemplates")).toContain("我的背景");

    fireEvent.contextMenu(within(backgroundPanel).getByRole("button", { name: "我的背景" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "删除" }));

    expect(within(backgroundPanel).queryByRole("button", { name: "我的背景" })).not.toBeInTheDocument();
    expect(window.localStorage.getItem("ghost.thoughts.customPaperTemplates")).not.toContain("我的背景");
    expect(screen.getByLabelText("碎碎念富文本编辑纸张").getAttribute("style") ?? "").toBe("");

    fireEvent.change(backgroundImageInput, { target: { files: [new File(["paper"], "paper.png", { type: "image/png" })] } });

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
