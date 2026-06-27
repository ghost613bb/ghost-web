import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CenterAvatar } from "./CenterAvatar";

const { floatMock, replacementAvatarMock } = vi.hoisted(() => ({
  floatMock: vi.fn(({ children }) => <div data-testid="float">{children}</div>),
  replacementAvatarMock: vi.fn(() => <div data-testid="replacement-avatar" />),
}));

vi.mock("@react-three/drei", () => ({
  Float: floatMock,
}));

vi.mock("./TaskAvatar", () => ({
  TaskAvatar: replacementAvatarMock,
}));

describe("CenterAvatar", () => {
  it("renders the task avatar model in the center", () => {
    render(<CenterAvatar />);

    expect(replacementAvatarMock).toHaveBeenCalledOnce();
  });
});
