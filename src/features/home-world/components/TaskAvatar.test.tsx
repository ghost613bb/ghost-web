import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { TaskAvatar } from "./TaskAvatar";

const { cloneMock, preloadMock, useGLTFMock, scene } = vi.hoisted(() => {
  const mockedScene = {};

  return {
    cloneMock: vi.fn(() => <div data-testid="clone" />),
    preloadMock: vi.fn(),
    scene: mockedScene,
    useGLTFMock: Object.assign(vi.fn(() => ({ scene: mockedScene })), { preload: vi.fn() }),
  };
});

vi.mock("@react-three/drei", () => ({
  Clone: cloneMock,
  useGLTF: useGLTFMock,
}));

describe("TaskAvatar", () => {
  it("loads the replacement task model from public assets", () => {
    render(<TaskAvatar />);

    expect(useGLTFMock).toHaveBeenCalledWith("/models/task_avatar/scene.gltf");
    expect(cloneMock).toHaveBeenCalledWith(expect.objectContaining({ object: scene }), undefined);
  });

  it("scales the large replacement model down for the center scene", () => {
    const { container } = render(<TaskAvatar />);

    expect(container.querySelector("group")?.getAttribute("scale")).toBe("0.003");
  });

  it("keeps all replacement model files available from public assets", () => {
    const modelDir = path.join(process.cwd(), "public/models/task_avatar");

    expect(() => readFileSync(path.join(modelDir, "scene.gltf"), "utf8")).not.toThrow();
    expect(() => readFileSync(path.join(modelDir, "scene.bin"))).not.toThrow();
    expect(() => readFileSync(path.join(modelDir, "textures/lambert2_baseColor.jpeg"))).not.toThrow();
  });
});
