import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminDashboardPage } from "./AdminDashboardPage";

vi.mock("@/features/module-display-mode/components/ModuleDisplayModeAdminForm", () => ({
  ModuleDisplayModeAdminForm: () => <section aria-label="展示模式配置表单">展示模式配置表单</section>,
}));

function mockAdminFetch(authenticated = false) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const method = init?.method ?? "GET";

    if (String(input) === "/api/admin/session" && method === "GET") {
      return {
        ok: true,
        json: async () => ({ authenticated }),
      } as Response;
    }

    if (String(input) === "/api/admin/session" && method === "POST") {
      const body = JSON.parse(String(init?.body ?? "{}")) as { token?: string };

      if (body.token === "right-token") {
        return {
          ok: true,
          json: async () => ({ authenticated: true }),
        } as Response;
      }

      return {
        ok: false,
        json: async () => ({ error: "管理 Token 不正确" }),
      } as Response;
    }

    if (String(input) === "/api/admin/session" && method === "DELETE") {
      return {
        ok: true,
        json: async () => ({ authenticated: false }),
      } as Response;
    }

    return {
      ok: true,
      json: async () => ({}),
    } as Response;
  });
}

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a unified admin token form when locked", async () => {
    mockAdminFetch(false);
    render(<AdminDashboardPage />);

    expect(await screen.findByPlaceholderText("管理 Token")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "解锁后台管理" })).toBeInTheDocument();
    expect(screen.queryByLabelText("展示模式配置表单")).not.toBeInTheDocument();
  });

  it("shows errors for wrong tokens and unlocks with the right token", async () => {
    mockAdminFetch(false);
    render(<AdminDashboardPage />);

    fireEvent.change(await screen.findByPlaceholderText("管理 Token"), { target: { value: "wrong-token" } });
    fireEvent.click(screen.getByRole("button", { name: "解锁后台管理" }));

    expect(await screen.findByText("管理 Token 不正确")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("管理 Token"), { target: { value: "right-token" } });
    fireEvent.click(screen.getByRole("button", { name: "解锁后台管理" }));

    expect(await screen.findByRole("button", { name: "退出后台管理" })).toBeInTheDocument();
    expect(screen.getByLabelText("展示模式配置表单")).toBeInTheDocument();
  });

  it("logs out from the dashboard", async () => {
    mockAdminFetch(true);
    render(<AdminDashboardPage />);

    fireEvent.click(await screen.findByRole("button", { name: "退出后台管理" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "解锁后台管理" })).toBeInTheDocument());
  });
});
