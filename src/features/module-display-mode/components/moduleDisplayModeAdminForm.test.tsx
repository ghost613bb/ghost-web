import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModuleDisplayModeAdminForm } from "./ModuleDisplayModeAdminForm";

describe("ModuleDisplayModeAdminForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads display modes from the API on mount", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        modes: {
          about: "real",
          album: "real",
          coffee: "real",
          message: "real",
          playlists: "real",
          thoughts: "demo",
          todo: "real",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<ModuleDisplayModeAdminForm />);

    expect(screen.getByText("加载中...")).toBeInTheDocument();

    const thoughtsFieldset = await screen.findByRole("group", { name: "碎碎念 展示模式" });

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/display-modes", { method: "GET" });
    expect(within(thoughtsFieldset).getByText("当前：试玩模式")).toBeInTheDocument();
    expect(within(thoughtsFieldset).getByRole("radio", { name: "试玩模式" })).toBeChecked();
  });

  it("updates a display mode through the API", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          modes: {
            about: "real",
            album: "real",
            coffee: "real",
            message: "real",
            playlists: "real",
            thoughts: "real",
            todo: "real",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          modes: {
            about: "real",
            album: "real",
            coffee: "real",
            message: "real",
            playlists: "real",
            thoughts: "demo",
            todo: "real",
          },
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    render(<ModuleDisplayModeAdminForm />);

    const thoughtsFieldset = await screen.findByRole("group", { name: "碎碎念 展示模式" });
    fireEvent.click(within(thoughtsFieldset).getByRole("radio", { name: "试玩模式" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/admin/display-modes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moduleId: "thoughts",
          displayMode: "demo",
        }),
      });
    });

    await waitFor(() => {
      expect(within(thoughtsFieldset).getByText("当前：试玩模式")).toBeInTheDocument();
    });
  });

  it("shows the API error when saving fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          modes: {
            about: "real",
            album: "real",
            coffee: "real",
            message: "real",
            playlists: "real",
            thoughts: "real",
            todo: "real",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: "当前模块暂时不能切到试玩模式",
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    render(<ModuleDisplayModeAdminForm />);

    const thoughtsFieldset = await screen.findByRole("group", { name: "碎碎念 展示模式" });
    fireEvent.click(within(thoughtsFieldset).getByRole("radio", { name: "试玩模式" }));

    expect(await screen.findByText("当前模块暂时不能切到试玩模式")).toBeInTheDocument();
    expect(within(thoughtsFieldset).getByText("当前：真实内容")).toBeInTheDocument();
  });

  it("shows the API error when initial load fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: "暂时无法读取展示模式",
        }),
      }),
    );

    render(<ModuleDisplayModeAdminForm />);

    expect(await screen.findByText("暂时无法读取展示模式")).toBeInTheDocument();
  });

  it("disables only the saving module and shows saving text", async () => {
    let resolvePatch: ((value: { ok: boolean; json: () => Promise<{ modes: { about: string; album: string; coffee: string; message: string; playlists: string; thoughts: string; todo: string; }; }> }) => void) | undefined;

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          modes: {
            about: "real",
            album: "real",
            coffee: "real",
            message: "real",
            playlists: "real",
            thoughts: "real",
            todo: "real",
          },
        }),
      })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePatch = resolve;
          }),
      );

    vi.stubGlobal("fetch", fetchMock);

    render(<ModuleDisplayModeAdminForm />);

    const thoughtsFieldset = await screen.findByRole("group", { name: "碎碎念 展示模式" });
    const aboutFieldset = screen.getByRole("group", { name: "心情日记 展示模式" });

    fireEvent.click(within(thoughtsFieldset).getByRole("radio", { name: "试玩模式" }));

    expect(within(thoughtsFieldset).getByText("保存中...")).toBeInTheDocument();
    expect(within(thoughtsFieldset).getByRole("radio", { name: "真实内容" })).toBeDisabled();
    expect(within(thoughtsFieldset).getByRole("radio", { name: "试玩模式" })).toBeDisabled();
    expect(within(aboutFieldset).getByRole("radio", { name: "真实内容" })).not.toBeDisabled();
    expect(within(aboutFieldset).getByRole("radio", { name: "试玩模式" })).not.toBeDisabled();

    resolvePatch?.({
      ok: true,
      json: async () => ({
        modes: {
          about: "real",
          album: "real",
          coffee: "real",
          message: "real",
          playlists: "real",
          thoughts: "demo",
          todo: "real",
        },
      }),
    });

    await waitFor(() => {
      expect(within(thoughtsFieldset).queryByText("保存中...")).not.toBeInTheDocument();
      expect(within(thoughtsFieldset).getByText("当前：试玩模式")).toBeInTheDocument();
    });
  });
});
