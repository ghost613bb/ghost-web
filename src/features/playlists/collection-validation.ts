export const playlistCollectionAccentOptions = [
  { className: "bg-[#fde2e7]", label: "樱花粉" },
  { className: "bg-[#fff2c7]", label: "日落黄" },
  { className: "bg-[#f8cfd5]", label: "甜莓粉" },
  { className: "bg-[#e5f0ff]", label: "晴空蓝" },
  { className: "bg-[#fff4d8]", label: "奶油米" },
  { className: "bg-[#e6dcff]", label: "月光紫" },
];

export const playlistCollectionAccentClasses = playlistCollectionAccentOptions.map((option) => option.className);

const maxCoverSize = 5 * 1024 * 1024;
const supportedCoverTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

type PlaylistCollectionFieldInput = {
  accentClass?: unknown;
  description?: unknown;
  emoji?: unknown;
  title?: unknown;
};

function parseString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return value !== null && typeof value !== "string" && typeof value.arrayBuffer === "function" && typeof value.name === "string" && typeof value.size === "number";
}

export function slugifyCollectionTitle(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 36) || "collection";
}

export function parsePlaylistCollectionFields(input: PlaylistCollectionFieldInput) {
  const title = parseString(input.title);
  const description = parseString(input.description);
  const emoji = parseString(input.emoji) || "🎵";
  const accentClass = parseString(input.accentClass) || playlistCollectionAccentClasses[0];

  if (!title) {
    throw new Error("请输入歌单名称");
  }

  if (title.length > 60) {
    throw new Error("歌单名称不能超过 60 个字符");
  }

  if (description.length > 160) {
    throw new Error("歌单描述不能超过 160 个字符");
  }

  if (emoji.length > 16) {
    throw new Error("歌单图标不能超过 16 个字符");
  }

  if (!playlistCollectionAccentClasses.includes(accentClass)) {
    throw new Error("请选择有效的歌单主题色");
  }

  return {
    accentClass,
    description,
    emoji,
    title,
  };
}

export function validatePlaylistCollectionCoverFile(value: FormDataEntryValue | null, { required = false }: { required?: boolean } = {}) {
  if (!isUploadedFile(value)) {
    if (required) {
      throw new Error("请先选择歌单封面图片");
    }

    return null;
  }

  if (value.size === 0) {
    throw new Error("歌单封面文件为空");
  }

  if (value.size > maxCoverSize) {
    throw new Error("歌单封面不能超过 5MB");
  }

  const extension = supportedCoverTypes.get(value.type);

  if (!extension) {
    throw new Error("歌单封面仅支持 JPG、PNG 或 WebP");
  }

  return {
    extension,
    file: value,
  };
}
