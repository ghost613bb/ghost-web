export const contentTabs = [
  { id: "album", label: "个人相册", headerTitle: "Photo Book", href: "/album" },
  { id: "thoughts", label: "碎碎念", headerTitle: "Pocket Diary", href: "/thoughts" },
  { id: "playlists", label: "歌单", headerTitle: "Soundtrack", href: "/playlists" },
  { id: "about", label: "心情日记", headerTitle: "Mood Journal", href: "/about" },
  { id: "coffee", label: "咖啡推荐", headerTitle: "Coffee Notes", href: "/coffee" },
  { id: "todo", label: "人生todolist", headerTitle: "Life List", href: "/todo" },
  { id: "message", label: "学习笔记", headerTitle: "Study Notes", href: "/message" },
] as const;

export type ContentTabId = (typeof contentTabs)[number]["id"];
