import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CenterAvatar } from "./CenterAvatar";

const { floatMock, replacementAvatarMock, rosemiAvatarMock } = vi.hoisted(() => ({
  floatMock: vi.fn(({ children }) => <div data-testid="float">{children}</div>),
  replacementAvatarMock: vi.fn(() => <div data-testid="replacement-avatar" />),
  rosemiAvatarMock: vi.fn(() => <div data-testid="rosemi-avatar" />),
}));

vi.mock("@react-three/drei", () => ({
  Float: floatMock,
}));

vi.mock("./TaskAvatar", () => ({
  TaskAvatar: replacementAvatarMock,
}));

vi.mock("./RosemiAvatar", () => ({
  RosemiAvatar: rosemiAvatarMock,
}));

describe("CenterAvatar", () => {
  it("renders the task avatar model in the center", () => {
    render(<CenterAvatar />);

    expect(replacementAvatarMock).toHaveBeenCalledOnce();
    expect(rosemiAvatarMock).not.toHaveBeenCalled();
  });
});
