const thoughtAttachmentImageMaxEdge = 1600;
const thoughtAttachmentImageQuality = 0.82;
const compressionErrorMessage = "图片压缩失败，请重试或换一张图片";

function buildCompressedImageFileName(fileName: string, contentType: "image/jpeg" | "image/webp") {
  const extension = contentType === "image/webp" ? "webp" : "jpg";
  const baseName = fileName.replace(/\.[^.]+$/, "") || "attachment";

  return `${baseName}.${extension}`;
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(compressionErrorMessage));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, contentType: "image/jpeg" | "image/webp") {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), contentType, thoughtAttachmentImageQuality);
  });
}

async function renderCompressedBlob(canvas: HTMLCanvasElement) {
  const webpBlob = await canvasToBlob(canvas, "image/webp");

  if (webpBlob?.type === "image/webp") {
    return webpBlob;
  }

  const jpegBlob = await canvasToBlob(canvas, "image/jpeg");

  if (jpegBlob?.type === "image/jpeg") {
    return jpegBlob;
  }

  throw new Error(compressionErrorMessage);
}

export async function compressThoughtAttachmentImage(file: File) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  try {
    const image = await loadImageFromFile(file);
    const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = longestSide > 0 ? Math.min(1, thoughtAttachmentImageMaxEdge / longestSide) : 1;
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error(compressionErrorMessage);
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    const blob = await renderCompressedBlob(canvas);

    return new File([blob], buildCompressedImageFileName(file.name, blob.type as "image/jpeg" | "image/webp"), {
      lastModified: file.lastModified,
      type: blob.type,
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error(compressionErrorMessage);
  }
}
