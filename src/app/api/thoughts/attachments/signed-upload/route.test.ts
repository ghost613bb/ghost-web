import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const createSignedUploadUrl = vi.hoisted(() => vi.fn());
const getPublicUrl = vi.hoisted(() => vi.fn());
const storageFrom = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServiceRoleClient: vi.fn(() => ({
    storage: {
      from: storageFrom,
    },
  })),
}));

function buildRequest(payload: unknown) {
  return new Request("http://localhost/api/thoughts/attachments/signed-upload", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

describe("/api/thoughts/attachments/signed-upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createSignedUploadUrl.mockResolvedValue({
      data: {
        path: "attachments/thought-attachment-1719206400000-attachment.webp",
        signedUrl: "https://storage.example.com/upload/sign/token",
        token: "signed-token",
      },
      error: null,
    });
    getPublicUrl.mockReturnValue({
      data: {
        publicUrl: "https://cdn.example.com/attachments/thought-attachment-1719206400000-attachment.webp",
      },
    });
    storageFrom.mockReturnValue({
      createSignedUploadUrl,
      getPublicUrl,
    });
  });

  it("creates a signed upload for image attachments", async () => {
    const response = await POST(buildRequest({ contentType: "image/webp", fileName: "cat.webp", size: 1024 }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(storageFrom).toHaveBeenCalledWith("thought-assets");
    expect(createSignedUploadUrl).toHaveBeenCalledWith(expect.stringMatching(/^attachments\/thought-attachment-\d+-attachment\.webp$/), { upsert: true });
    expect(data.attachment).toMatchObject({
      fileName: expect.stringMatching(/^attachments\/thought-attachment-\d+-attachment\.webp$/),
      type: "image",
      upload: {
        path: "attachments/thought-attachment-1719206400000-attachment.webp",
        signedUrl: "https://storage.example.com/upload/sign/token",
        token: "signed-token",
      },
      url: "https://cdn.example.com/attachments/thought-attachment-1719206400000-attachment.webp",
    });
  });

  it("creates a signed upload for video attachments", async () => {
    const response = await POST(buildRequest({ contentType: "video/mp4", fileName: "clip.mp4", size: 2048 }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.attachment.type).toBe("video");
    expect(createSignedUploadUrl).toHaveBeenCalledWith(expect.stringMatching(/^attachments\/thought-attachment-\d+-attachment\.mp4$/), { upsert: true });
  });

  it("creates a signed upload for file attachments", async () => {
    const response = await POST(buildRequest({ contentType: "text/markdown", fileName: "note.md", size: 512 }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.attachment.type).toBe("file");
    expect(createSignedUploadUrl).toHaveBeenCalledWith(expect.stringMatching(/^attachments\/thought-attachment-\d+-attachment\.md$/), { upsert: true });
  });

  it("rejects empty files", async () => {
    const response = await POST(buildRequest({ contentType: "image/webp", fileName: "cat.webp", size: 0 }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "请先选择附件" });
    expect(createSignedUploadUrl).not.toHaveBeenCalled();
  });

  it("rejects unsupported files", async () => {
    const response = await POST(buildRequest({ contentType: "application/javascript", fileName: "script.js", size: 1024 }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "只支持上传图片、视频或文件附件" });
    expect(createSignedUploadUrl).not.toHaveBeenCalled();
  });

  it("rejects files larger than the image, video or file size limit", async () => {
    const imageResponse = await POST(buildRequest({ contentType: "image/png", fileName: "large.png", size: 10 * 1024 * 1024 + 1 }));
    expect(imageResponse.status).toBe(400);
    await expect(imageResponse.json()).resolves.toEqual({ error: "图片附件不能超过 10MB" });

    const videoResponse = await POST(buildRequest({ contentType: "video/mp4", fileName: "large.mp4", size: 100 * 1024 * 1024 + 1 }));
    expect(videoResponse.status).toBe(400);
    await expect(videoResponse.json()).resolves.toEqual({ error: "视频附件不能超过 100MB" });

    const fileResponse = await POST(buildRequest({ contentType: "application/pdf", fileName: "large.pdf", size: 20 * 1024 * 1024 + 1 }));
    expect(fileResponse.status).toBe(400);
    await expect(fileResponse.json()).resolves.toEqual({ error: "文件附件不能超过 20MB" });
    expect(createSignedUploadUrl).not.toHaveBeenCalled();
  });

  it("returns Supabase signing errors", async () => {
    createSignedUploadUrl.mockResolvedValueOnce({ data: null, error: { message: "bucket missing" } });

    const response = await POST(buildRequest({ contentType: "image/webp", fileName: "cat.webp", size: 1024 }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "bucket missing" });
  });
});
