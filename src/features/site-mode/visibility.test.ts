import { describe, expect, it } from "vitest";
import type { BaseContent } from "@/features/content-modules/types";
import { canDisplayContent, getRestrictedReason, isBodyVisible } from "./visibility";

const content = (visibility: BaseContent["visibility"], status: BaseContent["status"] = "published"): BaseContent => ({
  id: `${visibility}-${status}`,
  title: "Entry",
  visibility,
  status,
});

describe("visibility rules", () => {
  it("shows published public content in every site mode", () => {
    expect(canDisplayContent(content("public"), "normal")).toBe(true);
    expect(canDisplayContent(content("public"), "interview")).toBe(true);
  });

  it("hides drafts and private content from public pages", () => {
    expect(canDisplayContent(content("public", "draft"), "normal")).toBe(false);
    expect(canDisplayContent(content("private"), "normal")).toBe(false);
  });

  it("hides interview-hidden content in interview mode only", () => {
    expect(canDisplayContent(content("interview_hidden"), "normal")).toBe(true);
    expect(canDisplayContent(content("interview_hidden"), "interview")).toBe(false);
  });

  it("allows masked cards but hides masked body text", () => {
    const masked = content("masked");
    expect(canDisplayContent(masked, "normal")).toBe(true);
    expect(isBodyVisible(masked, "normal")).toBe(false);
  });

  it("returns a clear reason for restricted interview content", () => {
    expect(getRestrictedReason(content("interview_hidden"), "interview")).toBe("interview_hidden");
  });
});
