import { beforeEach, describe, expect, it, vi } from "vitest";

const serviceState = vi.hoisted(() => ({
  deleteThought: vi.fn(),
}));

vi.mock("@/features/thoughts/service", () => serviceState);

import { DELETE } from "./route";

describe("/api/thoughts/[thoughtId]", () => {
  beforeEach(() => {
    serviceState.deleteThought.mockReset();
  });

  it("deletes a thought", async () => {
    serviceState.deleteThought.mockResolvedValue(true);

    const response = await DELETE(new Request("http://localhost/api/thoughts/thought-db-delete"), { params: Promise.resolve({ thoughtId: "thought-db-delete" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(serviceState.deleteThought).toHaveBeenCalledWith("thought-db-delete");
  });

  it("returns 404 for a missing thought", async () => {
    serviceState.deleteThought.mockResolvedValue(false);

    const response = await DELETE(new Request("http://localhost/api/thoughts/missing-thought"), { params: Promise.resolve({ thoughtId: "missing-thought" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: "碎碎念不存在" });
  });

  it("returns 503 when the thought data source is not configured", async () => {
    serviceState.deleteThought.mockRejectedValue(new Error("碎碎念数据源未配置"));

    const response = await DELETE(new Request("http://localhost/api/thoughts/thought-db-delete"), { params: Promise.resolve({ thoughtId: "thought-db-delete" }) });
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({ error: "碎碎念数据源未配置" });
  });
});
