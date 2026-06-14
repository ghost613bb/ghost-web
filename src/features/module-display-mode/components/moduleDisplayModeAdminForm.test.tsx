import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModuleDisplayModeAdminForm } from "./ModuleDisplayModeAdminForm";

const realModes = {
  about: "real",
  album: "real",
  coffee: "real",
  message: "real",
  playlists: "real",
  thoughts: "real",
  todo: "real",
};

const albumDemoModes = {
  ...realModes,
  album: "demo",
};

describe("ModuleDisplayModeAdminForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads display modes from the API on mount", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ modes: albumDemoModes }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<ModuleDisplayModeAdminForm />);

    expect(screen.getByText("加载中...")).toBeInTheDocument();

    const albumFieldset = await screen.findByRole("group", { name: "个人相册 展示模式" });

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/display-modes", { method: "GET" });
    expect(within(albumFieldset).getByText("当前：试玩模式")).toBeInTheDocument();
    expect(within(albumFieldset).getByRole("radio", { name: "试玩模式" })).toBeChecked();
  });

  it("updates a display mode through the API", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ modes: realModes }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ modes: albumDemoModes }),
      });

    vi.stubGlobal("fetch", fetchMock);

    render(<ModuleDisplayModeAdminForm />);

    const albumFieldset = await screen.findByRole("group", { name: "个人相册 展示模式" });
    fireEvent.click(within(albumFieldset).getByRole("radio", { name: "试玩模式" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/admin/display-modes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moduleId: "album",
          displayMode: "demo",
        }),
      });
    });

    await waitFor(() => {
      expect(within(albumFieldset).getByText("当前：试玩模式")).toBeInTheDocument();
    });
  });

  it("shows the API error when saving fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ modes: realModes }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: "当前模块暂时不能切到试玩模式",
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    render(<ModuleDisplayModeAdminForm />);

    const albumFieldset = await screen.findByRole("group", { name: "个人相册 展示模式" });
    fireEvent.click(within(albumFieldset).getByRole("radio", { name: "试玩模式" }));

    expect(await screen.findByText("当前模块暂时不能切到试玩模式")).toBeInTheDocument();
    expect(within(albumFieldset).getByText("当前：真实内容")).toBeInTheDocument();
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

  it("keeps the active tab text readable on hover", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ modes: realModes }),
      }),
    );

    render(<ModuleDisplayModeAdminForm />);

    const aboutFieldset = await screen.findByRole("group", { name: "心情日记 展示模式" });
    const activeTab = within(aboutFieldset).getByRole("radio", { name: "真实内容" }).closest("label");

    expect(activeTab).toHaveClass("bg-stone-900");
    expect(activeTab).toHaveClass("text-white");
    expect(activeTab).not.toHaveClass("hover:text-stone-900");
  });

  it("uses smaller heading sizing for the admin form", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ modes: realModes }),
      }),
    );

    render(<ModuleDisplayModeAdminForm />);

    expect(await screen.findByRole("heading", { level: 2, name: "模块展示模式" })).toHaveClass("text-xl", "sm:text-2xl");
  });

  it("disables only the saving module and shows saving text", async () => {
    let resolvePatch: ((value: { ok: boolean; json: () => Promise<{ modes: typeof realModes }> }) => void) | undefined;

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ modes: realModes }),
      })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePatch = resolve;
          }),
      );

    vi.stubGlobal("fetch", fetchMock);

    render(<ModuleDisplayModeAdminForm />);

    const albumFieldset = await screen.findByRole("group", { name: "个人相册 展示模式" });
    const aboutFieldset = screen.getByRole("group", { name: "心情日记 展示模式" });

    fireEvent.click(within(albumFieldset).getByRole("radio", { name: "试玩模式" }));

    expect(within(albumFieldset).getByText("保存中...")).toBeInTheDocument();
    expect(within(albumFieldset).getByRole("radio", { name: "真实内容" })).toBeDisabled();
    expect(within(albumFieldset).getByRole("radio", { name: "试玩模式" })).toBeDisabled();
    expect(within(aboutFieldset).getByRole("radio", { name: "真实内容" })).not.toBeDisabled();
    expect(within(aboutFieldset).getByRole("radio", { name: "试玩模式" })).not.toBeDisabled();

    resolvePatch?.({
      ok: true,
      json: async () => ({ modes: albumDemoModes }),
    });

    await waitFor(() => {
      expect(within(albumFieldset).queryByText("保存中...")).not.toBeInTheDocument();
      expect(within(albumFieldset).getByText("当前：试玩模式")).toBeInTheDocument();
    });
  });
});
