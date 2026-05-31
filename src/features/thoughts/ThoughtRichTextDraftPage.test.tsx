import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThoughtRichTextDraftPage } from "./ThoughtRichTextDraftPage";

const mockEditor = {
  chain: vi.fn(),
  can: vi.fn(),
  getHTML: vi.fn(),
};

let capturedOnUpdate: ((props: { editor: { getHTML: () => string } }) => void) | undefined;

vi.mock("@tiptap/starter-kit", () => ({
  default: "StarterKit",
}));

vi.mock("@tiptap/react", () => ({
  EditorContent: ({ editor }: { editor: unknown }) => <div data-testid="editor-content">Editor ready: {String(Boolean(editor))}</div>,
  useEditor: vi.fn((options: { onUpdate?: (props: { editor: { getHTML: () => string } }) => void }) => {
    capturedOnUpdate = options.onUpdate;
    return mockEditor;
  }),
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
    mockEditor.chain.mockImplementation(chainResult);
    mockEditor.can.mockReturnValue({ undo: () => true, redo: () => true });
    mockEditor.getHTML.mockReturnValue("");
  });

  it("renders a local rich text draft preview without save actions", () => {
    render(<ThoughtRichTextDraftPage />);

    expect(screen.getByRole("heading", { level: 1, name: "新建碎碎念" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回碎碎念" })).toHaveAttribute("href", "/thoughts");
    expect(screen.getByText("当前为富文本编辑体验预览，暂不保存。")).toBeInTheDocument();
    expect(screen.getByLabelText("富文本工具栏")).toBeInTheDocument();

    ["段落", "H2", "H3", "加粗", "斜体", "无序列表", "引用", "撤销", "重做"].forEach((name) => {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    });

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
});
