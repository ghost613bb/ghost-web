export type AlbumPhoto = {
  id: string;
  albumId: string;
  title: string;
  uploadedAt: string;
  note: string;
  imageUrl: string;
  imagePosition: string;
};

export const albumPhotos: AlbumPhoto[] = [
  {
    id: "photo-001",
    albumId: "album-001",
    title: "Sleepy head...",
    uploadedAt: "Oct 24, 2023 / 4:30",
    note: "和猫咪的下午茶时光 ☕🐾\n\n真的好乖好可爱！超级治愈的一天~\n下次还来！",
    imageUrl: "/album-cover-placeholder.jpeg",
    imagePosition: "center 18%",
  },
  {
    id: "photo-002",
    albumId: "album-001",
    title: "Sleepy head...",
    uploadedAt: "Oct 25, 2023 / 10:18",
    note: "阳光照进来的时候，整张桌子都变软了。",
    imageUrl: "/album-cover-placeholder.jpeg",
    imagePosition: "36% center",
  },
  {
    id: "photo-003",
    albumId: "album-001",
    title: "Sleepy head...",
    uploadedAt: "Oct 25, 2023 / 11:42",
    note: "把最安静的那一刻留给自己。",
    imageUrl: "/album-cover-placeholder.jpeg",
    imagePosition: "60% center",
  },
  {
    id: "photo-004",
    albumId: "album-001",
    title: "Sleepy head...",
    uploadedAt: "Oct 26, 2023 / 9:05",
    note: "杯子冒热气的时候，猫咪也刚好看过来。",
    imageUrl: "/album-cover-placeholder.jpeg",
    imagePosition: "80% center",
  },
  {
    id: "photo-005",
    albumId: "album-001",
    title: "Sleepy head...",
    uploadedAt: "Oct 26, 2023 / 12:30",
    note: "今天这张很像一页被折起来的日记。",
    imageUrl: "/album-cover-placeholder.jpeg",
    imagePosition: "22% 70%",
  },
  {
    id: "photo-006",
    albumId: "album-001",
    title: "Sleepy head...",
    uploadedAt: "Oct 26, 2023 / 15:06",
    note: "小小的点心和一点点偷来的午后。",
    imageUrl: "/album-cover-placeholder.jpeg",
    imagePosition: "50% 76%",
  },
  {
    id: "photo-007",
    albumId: "album-001",
    title: "Sleepy head...",
    uploadedAt: "Oct 26, 2023 / 18:20",
    note: "收尾的时候再看一眼，还是很喜欢。",
    imageUrl: "/album-cover-placeholder.jpeg",
    imagePosition: "74% 26%",
  },
];

export function getAlbumPhotosByAlbumId(albumId: string) {
  return albumPhotos.filter((photo) => photo.albumId === albumId);
}

export function getAlbumPhotoById(albumId: string, photoId: string) {
  return albumPhotos.find((photo) => photo.albumId === albumId && photo.id === photoId) ?? null;
}

export function getAdjacentAlbumPhotoIds(albumId: string, photoId: string) {
  const photos = getAlbumPhotosByAlbumId(albumId);
  const index = photos.findIndex((photo) => photo.id === photoId);

  if (index === -1) {
    return { previousPhotoId: null, nextPhotoId: null };
  }

  return {
    previousPhotoId: photos[index - 1]?.id ?? null,
    nextPhotoId: photos[index + 1]?.id ?? null,
  };
}
