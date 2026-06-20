import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { homeModules } from "@/features/home-world/config/homeModules";
import { HomeWorldHud } from "./HomeWorldHud";

describe("HomeWorldHud", () => {
  it("renders the first-person start prompt", () => {
    const onStart = vi.fn();

    render(
      <HomeWorldHud
        activeModuleId={null}
        isExploring={false}
        isPointerLocked={false}
        modules={homeModules}
        onExit={vi.fn()}
        onStart={onStart}
      />,
    );

    expect(screen.getByRole("heading", { name: "第一视角逛小镇" })).toBeInTheDocument();
    expect(screen.getByText("点击开始后进入鼠标视角，靠近并看向建筑就能打开对应页面。")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "开始探索" }));

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("renders exploration controls and active module prompt", () => {
    const activeModule = homeModules[2];

    render(
      <HomeWorldHud
        activeModuleId={activeModule.id}
        isExploring
        isPointerLocked
        modules={homeModules}
        onExit={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "正在第一视角逛小镇" })).toBeInTheDocument();
    expect(screen.getByText("WASD / 方向键移动，鼠标转向，E 或 Enter 进入房间，Esc 释放鼠标。")).toBeInTheDocument();
    expect(screen.getByText(`靠近：${activeModule.title}，按 E / Enter 进入`)).toBeInTheDocument();
    expect(screen.getByText("鼠标已锁定")).toBeInTheDocument();
  });
});
