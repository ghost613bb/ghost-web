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

    expect(within(thoughtsFieldset).getByText("当前：试玩模式")).toBeInTheDocument();
  });

  it("shows an error when the initial load fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    render(<ModuleDisplayModeAdminForm />);

    expect(await screen.findByText("加载展示模式失败")).toBeInTheDocument();
  });
});
