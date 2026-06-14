export const contentTabs = [
  { id: "album", label: "个人相册", href: "/album" },
  { id: "thoughts", label: "碎碎念", href: "/thoughts" },
  { id: "playlists", label: "歌单", href: "/playlists" },
  { id: "about", label: "心情日记", href: "/about" },
  { id: "coffee", label: "咖啡推荐", href: "/coffee" },
  { id: "todo", label: "人生todolist", href: "/todo" },
  { id: "message", label: "学习笔记", href: "/message" },
] as const;

export type ContentTabId = (typeof contentTabs)[number]["id"];
