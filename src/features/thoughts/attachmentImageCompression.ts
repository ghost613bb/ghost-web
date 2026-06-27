import { compressImageFile } from "@/features/images/clientImageCompression";

const compressionErrorMessage = "图片压缩失败，请重试或换一张图片";

export async function compressThoughtAttachmentImage(file: File) {
  return compressImageFile(file, {
    errorMessage: compressionErrorMessage,
    fallbackBaseName: "attachment",
    maxEdge: 1600,
    quality: 0.82,
  });
}
