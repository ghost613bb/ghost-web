import { describe, expect, it } from "vitest";
import { parseDisplayModeUpdate } from "./validation";

describe("module display mode validation", () => {
  it("parses a valid update payload", () => {
    expect(
      parseDisplayModeUpdate({
        moduleId: "thoughts",
        displayMode: "demo",
      }),
    ).toEqual({
      moduleId: "thoughts",
      displayMode: "demo",
    });
  });

  it("rejects unknown module ids", () => {
    expect(() =>
      parseDisplayModeUpdate({
        moduleId: "museum",
        displayMode: "demo",
      }),
    ).toThrowError("moduleId 不合法");
  });

  it("rejects invalid display modes", () => {
    expect(() =>
      parseDisplayModeUpdate({
        moduleId: "thoughts",
        displayMode: "hidden",
      }),
    ).toThrowError("displayMode 只能是 real 或 demo");
  });
});
