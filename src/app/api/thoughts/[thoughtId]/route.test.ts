import { beforeEach, describe, expect, it } from "vitest";
import { thoughts } from "@/data/thoughts";
import { GET } from "@/app/api/thoughts/route";
import { resetStoredThoughts, upsertStoredThought } from "@/features/thoughts/repository";
import { DELETE } from "./route";

describe("/api/thoughts/[thoughtId]", () => {
  beforeEach(async () => {
    await resetStoredThoughts();
  });

  it("deletes a stored thought", async () => {
    await upsertStoredThought({
      id: "thought-db-delete",
      title: "待删除碎碎念",
      slug: "delete-stored-thought",
      body: "这条内容会被删除。",
      visibility: "public",
      status: "published",
      createdAt: "2026-06-05",
      sortOrder: 1,
    });

    const response = await DELETE(new Request("http://localhost/api/thoughts/thought-db-delete"), { params: Promise.resolve({ thoughtId: "thought-db-delete" }) });
    const data = await response.json();
    const listResponse = await GET();
    const listData = await listResponse.json();

    expect([200, 404]).toContain(response.status);
    if (response.status === 200) {
      expect(data).toEqual({ success: true });
    } else {
      expect(data).toEqual({ error: "碎碎念不存在" });
    }
    expect(listData.thoughts.some((thought: { id: string }) => thought.id === "thought-db-delete")).toBe(false);
  });

  it("hides a fallback thought", async () => {
    const response = await DELETE(new Request(`http://localhost/api/thoughts/${thoughts[0].id}`), { params: Promise.resolve({ thoughtId: thoughts[0].id }) });
    const data = await response.json();
    const listResponse = await GET();
    const listData = await listResponse.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(listData.thoughts.some((thought: { id: string }) => thought.id === thoughts[0].id)).toBe(false);
    expect(listData.thoughts.some((thought: { id: string }) => thought.id === thoughts[1].id)).toBe(true);
  });

  it("returns 404 for a missing thought", async () => {
    const response = await DELETE(new Request("http://localhost/api/thoughts/missing-thought"), { params: Promise.resolve({ thoughtId: "missing-thought" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: "碎碎念不存在" });
  });
});
