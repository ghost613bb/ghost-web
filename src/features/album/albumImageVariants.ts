import { compressImageFile } from "@/features/images/clientImageCompression";

const albumImageCompressionErrorMessage = "图片压缩失败，请重试或换一张图片";

export type AlbumImageVariants = {
  displayFile: File;
  thumbnailFile: File;
};

export async function createAlbumCoverImageVariants(file: File): Promise<AlbumImageVariants> {
  const [displayFile, thumbnailFile] = await Promise.all([
    compressImageFile(file, {
      errorMessage: albumImageCompressionErrorMessage,
      fallbackBaseName: "cover-display",
      maxEdge: 1280,
      quality: 0.78,
    }),
    compressImageFile(file, {
      errorMessage: albumImageCompressionErrorMessage,
      fallbackBaseName: "cover-thumbnail",
      maxEdge: 480,
      quality: 0.72,
    }),
  ]);

  return { displayFile, thumbnailFile };
}

export async function createAlbumPhotoImageVariants(file: File): Promise<AlbumImageVariants> {
  const [displayFile, thumbnailFile] = await Promise.all([
    compressImageFile(file, {
      errorMessage: albumImageCompressionErrorMessage,
      fallbackBaseName: "photo-display",
      maxEdge: 1600,
      quality: 0.82,
    }),
    compressImageFile(file, {
      errorMessage: albumImageCompressionErrorMessage,
      fallbackBaseName: "photo-thumbnail",
      maxEdge: 800,
      quality: 0.74,
    }),
  ]);

  return { displayFile, thumbnailFile };
}
