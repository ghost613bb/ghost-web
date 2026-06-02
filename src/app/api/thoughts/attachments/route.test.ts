import { access, rm, stat } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const thoughtUploadDir = path.join(process.cwd(), ".tmp/vitest/thought-attachment-uploads");

function requestWithFormData(formData: FormData) {
  return {
    formData: async () => formData,
  } as Request;
}

describe("/api/thoughts/attachments", () => {
  beforeEach(async () => {
    process.env.THOUGHT_UPLOAD_DIR = thoughtUploadDir;
    await rm(thoughtUploadDir, { force: true, recursive: true });
  });

  afterEach(async () => {
    delete process.env.THOUGHT_UPLOAD_DIR;
    await rm(thoughtUploadDir, { force: true, recursive: true });
  });

  it("uploads an image attachment and returns a public URL", async () => {
    const formData = new FormData();
    formData.set("attachmentFileName", "小猫 photo.png");
    formData.append("attachmentFile", new Blob(["image-binary"], { type: "image/png" }));

    const response = await POST(requestWithFormData(formData));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.attachment).toMatchObject({
      type: "image",
      fileName: expect.stringMatching(/^thought-attachment-\d+-小猫-photo\.png$/),
      url: expect.stringMatching(/^\/uploads\/thoughts\/thought-attachment-\d+-小猫-photo\.png$/),
    });
    await expect(access(path.join(thoughtUploadDir, data.attachment.fileName))).resolves.toBeUndefined();
    await expect(stat(path.join(thoughtUploadDir, data.attachment.fileName))).resolves.toMatchObject({ size: 12 });
  });

  it("uploads a video attachment and returns a public URL", async () => {
    const formData = new FormData();
    formData.set("attachmentFileName", "clip.mp4");
    formData.append("attachmentFile", new Blob(["video-binary"], { type: "video/mp4" }));

    const response = await POST(requestWithFormData(formData));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.attachment).toMatchObject({
      type: "video",
      fileName: expect.stringMatching(/^thought-attachment-\d+-clip\.mp4$/),
      url: expect.stringMatching(/^\/uploads\/thoughts\/thought-attachment-\d+-clip\.mp4$/),
    });
    await expect(access(path.join(thoughtUploadDir, data.attachment.fileName))).resolves.toBeUndefined();
  });

  it("rejects non image or video files", async () => {
    const formData = new FormData();
    formData.set("attachmentFileName", "note.txt");
    formData.append("attachmentFile", new Blob(["text"], { type: "text/plain" }));

    const response = await POST(requestWithFormData(formData));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "只支持上传图片或视频附件" });
  });

  it("rejects empty files", async () => {
    const formData = new FormData();
    formData.set("attachmentFileName", "empty.png");
    formData.append("attachmentFile", new Blob([], { type: "image/png" }));

    const response = await POST(requestWithFormData(formData));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "请先选择附件" });
  });

  it("rejects files larger than the image or video size limit", async () => {
    const oversizedImage = new Blob([new Uint8Array(10 * 1024 * 1024 + 1)], { type: "image/png" });
    const imageFormData = new FormData();
    imageFormData.set("attachmentFileName", "large.png");
    imageFormData.append("attachmentFile", oversizedImage);

    const imageResponse = await POST(requestWithFormData(imageFormData));
    expect(imageResponse.status).toBe(400);
    await expect(imageResponse.json()).resolves.toEqual({ error: "图片附件不能超过 10MB" });

    const oversizedVideo = new Blob([new Uint8Array(100 * 1024 * 1024 + 1)], { type: "video/mp4" });
    const videoFormData = new FormData();
    videoFormData.set("attachmentFileName", "large.mp4");
    videoFormData.append("attachmentFile", oversizedVideo);

    const videoResponse = await POST(requestWithFormData(videoFormData));
    expect(videoResponse.status).toBe(400);
    await expect(videoResponse.json()).resolves.toEqual({ error: "视频附件不能超过 100MB" });
  });
});
