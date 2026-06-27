export type SupabaseImageTransformOptions = {
  quality: number;
  width: number;
};

const publicObjectPathMarker = "/storage/v1/object/public/";
const publicRenderPathMarker = "/storage/v1/render/image/public/";

export function buildSupabaseImageTransformUrl(imageUrl: string | undefined | null, options: SupabaseImageTransformOptions) {
  if (!imageUrl || !imageUrl.includes(publicObjectPathMarker)) {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    url.pathname = url.pathname.replace(publicObjectPathMarker, publicRenderPathMarker);
    url.searchParams.set("width", String(options.width));
    url.searchParams.set("quality", String(options.quality));
    return url.toString();
  } catch {
    return null;
  }
}
