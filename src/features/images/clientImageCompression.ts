export type CompressImageFileOptions = {
  errorMessage?: string;
  fallbackBaseName?: string;
  maxEdge: number;
  quality: number;
};

const defaultCompressionErrorMessage = "图片压缩失败，请重试或换一张图片";

type SupportedCompressedImageType = "image/jpeg" | "image/webp";

function buildCompressedImageFileName(fileName: string, contentType: SupportedCompressedImageType, fallbackBaseName: string) {
  const extension = contentType === "image/webp" ? "webp" : "jpg";
  const baseName = fileName.replace(/\.[^.]+$/, "") || fallbackBaseName;

  return `${baseName}.${extension}`;
}

function loadImageFromFile(file: File, errorMessage: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(errorMessage));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, contentType: SupportedCompressedImageType, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), contentType, quality);
  });
}

async function renderCompressedBlob(canvas: HTMLCanvasElement, quality: number, errorMessage: string) {
  const webpBlob = await canvasToBlob(canvas, "image/webp", quality);

  if (webpBlob?.type === "image/webp") {
    return webpBlob;
  }

  const jpegBlob = await canvasToBlob(canvas, "image/jpeg", quality);

  if (jpegBlob?.type === "image/jpeg") {
    return jpegBlob;
  }

  throw new Error(errorMessage);
}

export async function compressImageFile(file: File, options: CompressImageFileOptions) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const errorMessage = options.errorMessage ?? defaultCompressionErrorMessage;
  const fallbackBaseName = options.fallbackBaseName ?? "image";

  try {
    const image = await loadImageFromFile(file, errorMessage);
    const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = longestSide > 0 ? Math.min(1, options.maxEdge / longestSide) : 1;
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error(errorMessage);
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    const blob = await renderCompressedBlob(canvas, options.quality, errorMessage);

    return new File([blob], buildCompressedImageFileName(file.name, blob.type as SupportedCompressedImageType, fallbackBaseName), {
      lastModified: file.lastModified,
      type: blob.type,
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error(errorMessage);
  }
}
