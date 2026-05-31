import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEditorState } from "@tiptap/react";
import { ThoughtRichTextDraftPage } from "./ThoughtRichTextDraftPage";

const mockEditor = {
  chain: vi.fn(),
  can: vi.fn(),
  getHTML: vi.fn(),
  isActive: vi.fn(),
};

let capturedOnUpdate: ((props: { editor: { getHTML: () => string } }) => void) | undefined;
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
};

vi.mock("@tiptap/starter-kit", () => ({
  default: "StarterKit",
}));

vi.mock("@tiptap/react", () => ({
  EditorContent: ({ editor }: { editor: unknown }) => <div data-testid="editor-content">Editor ready: {String(Boolean(editor))}</div>,
  useEditor: vi.fn((options: { onUpdate?: (props: { editor: { getHTML: () => string } }) => void }) => {
    capturedOnUpdate = options.onUpdate;
    return mockEditor;
  }),
  useEditorState: vi.fn(() => editorState),
}));

function chainResult() {
  return {
    focus: vi.fn().mockReturnThis(),
    setParagraph: vi.fn().mockReturnThis(),
    toggleHeading: vi.fn().mockReturnThis(),
    toggleBold: vi.fn().mockReturnThis(),
    toggleItalic: vi.fn().mockReturnThis(),
    toggleBulletList: vi.fn().mockReturnThis(),
    toggleBlockquote: vi.fn().mockReturnThis(),
    undo: vi.fn().mockReturnThis(),
    redo: vi.fn().mockReturnThis(),
    run: vi.fn(),
  };
}

describe("ThoughtRichTextDraftPage", () => {
  beforeEach(() => {
    capturedOnUpdate = undefined;
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
    };
    mockEditor.chain.mockImplementation(chainResult);
    mockEditor.can.mockReturnValue({ undo: () => editorState.canUndo, redo: () => editorState.canRedo });
    mockEditor.getHTML.mockReturnValue("");
    mockEditor.isActive.mockImplementation((name: string, attrs?: { level?: number }) => {
      if (name === "heading" && attrs?.level === 1) return editorState.isH1;
      if (name === "heading" && attrs?.level === 2) return editorState.isH2;
      if (name === "heading" && attrs?.level === 3) return editorState.isH3;
      if (name === "heading" && attrs?.level === 4) return editorState.isH4;
      if (name === "heading" && attrs?.level === 5) return editorState.isH5;
      if (name === "bold") return editorState.isBold;
      if (name === "italic") return editorState.isItalic;
      if (name === "bulletList") return editorState.isBulletList;
      if (name === "blockquote") return editorState.isBlockquote;
      return false;
    });
  });

  it("renders a local rich text draft preview without save actions", () => {
    render(<ThoughtRichTextDraftPage />);

    expect(screen.getByRole("heading", { level: 1, name: "新建碎碎念" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回碎碎念" })).toHaveAttribute("href", "/thoughts");
    expect(screen.getByText("当前为富文本编辑体验预览，暂不保存。")).toBeInTheDocument();
    expect(screen.getByLabelText("富文本工具栏")).toBeInTheDocument();

    ["H1", "H2", "H3", "H4", "H5", "加粗", "斜体", "无序列表", "引用", "撤销"].forEach((name) => {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: "段落" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "重做" })).not.toBeInTheDocument();

    expect(screen.getByLabelText("碎碎念富文本编辑纸张")).toBeInTheDocument();
    expect(screen.getByLabelText("碎碎念富文本预览纸张")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "保存" })).not.toBeInTheDocument();
    expect(screen.getByText("开始写一点今天的小事。")).toBeInTheDocument();
  });

  it("updates the local preview with the editor HTML when the editor content changes", () => {
    const { container } = render(<ThoughtRichTextDraftPage />);

    act(() => {
      capturedOnUpdate?.({ editor: { getHTML: () => "<p>今天写一点<strong>新的</strong>小事。</p>" } });
    });

    expect(screen.getByText("新的")).toBeInTheDocument();
    expect(container.querySelector("article strong")?.textContent).toBe("新的");
  });

  it("styles rich text nodes so toolbar actions are visible in the editor and preview", () => {
    const { container } = render(<ThoughtRichTextDraftPage />);

    const editorFrame = screen.getByTestId("thought-rich-text-editor-frame");
    const previewFrame = screen.getByTestId("thought-rich-text-preview-frame");

    expect(editorFrame.className).toContain("[&_h1]:text-[1.65rem]");
    expect(editorFrame.className).toContain("[&_h2]:text-[1.35rem]");
    expect(editorFrame.className).toContain("[&_h3]:text-[1.15rem]");
    expect(editorFrame.className).toContain("[&_h4]:text-[1.05rem]");
    expect(editorFrame.className).toContain("[&_h5]:text-[0.95rem]");
    expect(editorFrame.className).not.toContain("[&_h2]:text-[#d97891]");
    expect(editorFrame.className).not.toContain("[&_h3]:text-[#d97891]");
    expect(editorFrame.className).toContain("[&_strong]:font-black");
    expect(editorFrame.className).toContain("[&_ul]:list-disc");
    expect(editorFrame.className).toContain("[&_blockquote]:border-l-4");
    expect(previewFrame.className).toContain("[&_h1]:text-[1.65rem]");
    expect(previewFrame.className).toContain("[&_h2]:text-[1.35rem]");
    expect(previewFrame.className).not.toContain("[&_h2]:text-[#d97891]");
    expect(previewFrame.className).toContain("[&_strong]:font-black");
    expect(previewFrame.className).toContain("[&_ul]:list-disc");

    act(() => {
      capturedOnUpdate?.({ editor: { getHTML: () => "<h2>标题</h2><ul><li><p>列表</p></li></ul><blockquote><p>引用</p></blockquote>" } });
    });

    expect(container.querySelector("article h2")?.textContent).toBe("标题");
    expect(container.querySelector("article ul li")?.textContent).toBe("列表");
    expect(container.querySelector("article blockquote")?.textContent).toBe("引用");
  });

  it("runs heading and bold commands and subscribes to editor state so toolbar buttons rerender", () => {
    const h1Chain = chainResult();
    const h5Chain = chainResult();
    const boldChain = chainResult();
    mockEditor.chain.mockReturnValueOnce(h1Chain).mockReturnValueOnce(h5Chain).mockReturnValueOnce(boldChain).mockImplementation(chainResult);
    const { rerender } = render(<ThoughtRichTextDraftPage />);

    fireEvent.click(screen.getByRole("button", { name: "H1" }));
    expect(h1Chain.toggleHeading).toHaveBeenCalledWith({ level: 1 });
    expect(h1Chain.run).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "H5" }));
    expect(h5Chain.toggleHeading).toHaveBeenCalledWith({ level: 5 });
    expect(h5Chain.run).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "加粗" }));
    expect(boldChain.toggleBold).toHaveBeenCalledTimes(1);
    expect(boldChain.run).toHaveBeenCalledTimes(1);

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
      isH2: true,
    };
    rerender(<ThoughtRichTextDraftPage />);

    expect(screen.getByRole("button", { name: "撤销" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "加粗" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "H2" })).toHaveAttribute("aria-pressed", "true");
  });
});
