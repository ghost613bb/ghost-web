import type { BaseContent } from "@/features/content-modules/types";

export type PlaylistSong = BaseContent & {
  artist: string;
  audioSrc?: string;
  coverImageSrc?: string;
  feeling: string;
  lyrics?: string[];
  link?: string;
};

export type PlaylistCollection = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  songIds: string[];
  accentClass: string;
};

export type PlaylistNote = {
  id: string;
  author: string;
  time: string;
  content: string;
  songId: string;
  avatar: string;
};

export type PlaylistPlayerSnapshot = {
  currentTime: string;
  duration: string;
  progressPercent: number;
  volumePercent: number;
  statusLabel: string;
};

export const playlistSongs: PlaylistSong[] = [
  {
    id: "song-001",
    title: "doll",
    artist: "小雪",
    audioSrc: "/audio/playlists/xiaoxue-doll.mp3",
    coverImageSrc: "/audio/playlists/xiaoxue-doll-cover.jpg",
    description: "来自本地导入的试听曲。",
    feeling: "先把这首歌放进今日循环，测试真实 MP3 播放。",
    lyrics: [
      "凛冽的风捶打在肩",
      "乌鸦在低空下盘旋",
      "梦中的草长莺飞消失不见",
      "表情和言语成锁链",
      "对方的指指和点点",
      "困住我在无边牢笼里面",
      "Idon't wanna be a doll",
      "I just want to get my soul",
      "Get out of your hands",
      "Have my own feelings",
      "Idon't wanna be a doll",
      "I just want to get my soul",
      "Get out of your hands",
      "Leave my life",
      "婆娑的树影在湖边摇曳",
      "盼过冬天又等一个春夜",
      "微弱的光落在我心的旷野",
      "痛痒和不安就在昨天",
      "枯蝶起舞像落叶在告别",
      "光阴流转一叶落在我手边",
      "Idon't wanna be a doll",
      "I just wanna feel my soul",
      "Get out of your hands",
      "Have my own feelings",
      "Idon't wanna be a doll",
      "I just wanna own my soul",
      "Get out of your hands",
      "Leave my life, let me go",
      "用力挣破枷锁",
      "逆风撑船也不退缩",
      "坠入深深漩涡",
      "冲破迷雾的我",
      "如藏波罗花朵",
      "永恒绽放的传说",
      "化作燎原烈火",
      "不会屈服的我"
    ],
    tags: ["试听", "本地导入"],
    visibility: "public",
    status: "published",
    sortOrder: 1,
  },
  {
    id: "song-002",
    title: "电子充电器",
    artist: "像素汽水",
    audioSrc: "/audio/playlists/song-002.wav",
    description: "需要把状态拉起来时播放。",
    feeling: "像给自己插上电源，适合写代码前听。",
    tags: ["电子", "提神"],
    visibility: "public",
    status: "published",
    sortOrder: 2,
  },
  {
    id: "song-003",
    title: "云朵软糖拍",
    artist: "棉花兔",
    audioSrc: "/audio/playlists/song-003.wav",
    description: "把焦虑揉成很小一颗，再慢慢含化。",
    feeling: "像被一朵毛茸茸的云接住，适合下午发呆。",
    tags: ["软糖", "下午"],
    visibility: "public",
    status: "published",
    sortOrder: 3,
  },
  {
    id: "song-004",
    title: "雨点小鼓手",
    artist: "窗边乐队",
    audioSrc: "/audio/playlists/song-004.wav",
    description: "窗外下雨时用来给房间加一点节奏。",
    feeling: "雨声和鼓点一起落下来，心里会安静很多。",
    tags: ["雨天", "房间"],
    visibility: "public",
    status: "published",
    sortOrder: 4,
  },
  {
    id: "song-005",
    title: "热可可尾奏",
    artist: "睡前便利店",
    audioSrc: "/audio/playlists/song-005.wav",
    description: "收尾一天时播放，像给夜晚盖上小毯子。",
    feeling: "最后一个音符落下时，今天就被好好收起来了。",
    tags: ["睡前", "温暖"],
    visibility: "public",
    status: "published",
    sortOrder: 5,
  },
  {
    id: "song-006",
    title: "星星晾衣绳",
    artist: "月台合唱团",
    audioSrc: "/audio/playlists/song-006.wav",
    description: "低能量晚上也能听的轻轻摇摆。",
    feeling: "像把小烦恼挂到夜空晾一晾，明早再说。",
    tags: ["夜晚", "轻摇"],
    visibility: "public",
    status: "published",
    sortOrder: 6,
  },
  {
    id: "song-007",
    title: "予星",
    artist: "Kui Kui, 周一",
    audioSrc: "/audio/playlists/kui-kui-zhouyi-yuxing.mp3",
    coverImageSrc: "/audio/playlists/kui-kui-zhouyi-yuxing-cover.jpg",
    description: "来自本地导入的试听曲。",
    feeling: "把夜空里的一颗星留给耳机，适合慢慢循环。",
    lyrics: [
      "孤寂的星在夜幕里朦胧",
      "会不会存在 另一颗晚星",
      "生来是为了相逢",
      "清冷的月在云层间失控",
      "呼吸频率和风 都乱了节奏",
      "心跳在交融",
      "简单点 别让坏情绪的更替 困在季节变迁",
      "明亮点 在昏暗堆叠的房间 扶过时序纷乱",
      "当灵魂 包裹我不停下坠 就快要分不清",
      "是心情还是这引力使然",
      "思绪也在慢慢的往下沉着 心脏跌落深渊",
      "我固执了这么久的孤独感 当你出现眼前",
      "那些糟糕的情绪 像 无根浮萍被涟漪冲散",
      "当孤星 摇啊摇  坠啊坠",
      "遇见了另一颗星",
      "才合并成一道星轨",
      "这夜色 没有你 没有我",
      "怎么能称得上是绝美",
      "当晚风 吹啊吹 追啊追",
      "碰到了月云相依",
      "眷恋才能深入骨髓",
      "这相片 没有你 没有我",
      "怎么能算得上是绝配",
      "日暮弥漫过地平线",
      "晨曦吻上你侧脸",
      "黎明炽盛过的天边",
      "等待心动出现",
      "流星坠入青色云烟   藏好我的眷恋",
      "那一弯白净的月帘   倒影出你的双眼",
      "听列车汽笛 偷偷 表白我的暗恋",
      "看 远方 澄净的海 掺杂着爱 她比天还浅",
      "我的喜欢 不会有断点",
      "等待 永恒星穹 慢慢地",
      "将爱带到你身边",
      "当孤星 摇啊摇  坠啊坠",
      "遇见了另一颗星",
      "才合并成一道星轨",
      "这夜色 没有你 没有我",
      "怎么能称得上是绝美",
      "当晚风 吹啊吹 追啊追",
      "碰到了月云相依",
      "眷恋才能深入骨髓",
      "这相片 没有你 没有我",
      "怎么能算得上是绝配",
      "当孤星 摇啊摇  坠啊坠",
      "遇见了另一颗星",
      "才合并成一道星轨",
      "这夜色 没有你 没有我",
      "怎么能称得上是绝美",
      "当晚风 吹啊吹 追啊追",
      "碰到了月云相依",
      "眷恋才能深入骨髓",
      "这相片 没有你 没有我",
      "怎么能算得上是绝配"
    ],
    tags: ["试听", "星光"],
    visibility: "public",
    status: "published",
    sortOrder: 7,
  },
];

export const featuredPlaylistSongId = "song-001";

export const playlistCollections: PlaylistCollection[] = [
  {
    id: "daily-moods",
    title: "Daily Moods",
    description: "今天的心情放进一个奶油色收藏夹。",
    emoji: "🌸",
    songIds: ["song-001", "song-003", "song-005", "song-007"],
    accentClass: "bg-[#fde2e7]",
  },
  {
    id: "sunset-walk",
    title: "Sunset Walk",
    description: "适合傍晚散步、把思绪吹松。",
    emoji: "🌅",
    songIds: ["song-001", "song-004", "song-006"],
    accentClass: "bg-[#fff2c7]",
  },
  {
    id: "sweet-rock",
    title: "Sweet Rock",
    description: "甜一点的鼓点，给灵感加糖。",
    emoji: "🎀",
    songIds: ["song-002", "song-003", "song-006"],
    accentClass: "bg-[#f8cfd5]",
  },
  {
    id: "coding-spark",
    title: "Coding Spark",
    description: "写代码前的充电仪式。",
    emoji: "⚡️",
    songIds: ["song-002", "song-004", "song-005"],
    accentClass: "bg-[#e5f0ff]",
  },
];

export const playlistNotes: PlaylistNote[] = [
  {
    id: "note-001",
    author: "Name",
    time: "10:05 AM",
    content: "这首歌一响起来，今天的边角都变软了。",
    songId: "song-001",
    avatar: "☁️",
  },
  {
    id: "note-002",
    author: "Ranima",
    time: "10:08 AM",
    content: "适合打开待办列表前偷偷听一遍。",
    songId: "song-002",
    avatar: "🐰",
  },
  {
    id: "note-003",
    author: "Morunn",
    time: "10:12 AM",
    content: "像把小云朵放进耳机里，超级安心。",
    songId: "song-003",
    avatar: "🍬",
  },
  {
    id: "note-004",
    author: "Mammy",
    time: "10:18 AM",
    content: "收进睡前歌单，今晚要早点下线。",
    songId: "song-005",
    avatar: "🌙",
  },
];

export const playlistPlayerSnapshot: PlaylistPlayerSnapshot = {
  currentTime: "0:42",
  duration: "3:43",
  progressPercent: 18,
  volumePercent: 58,
  statusLabel: "正在循环 Daily Moods",
};
