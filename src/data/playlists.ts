import type { BaseContent } from "@/features/content-modules/types";

export type PlaylistLyricLine = {
  time: number;
  text: string;
};

export type PlaylistSong = BaseContent & {
  artist: string;
  audioSrc?: string;
  coverImageSrc?: string;
  feeling: string;
  lyrics?: PlaylistLyricLine[];
  link?: string;
  shortReview?: string;
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
      { time: 15.66, text: "凛冽的风捶打在肩" },
      { time: 19.44, text: "乌鸦在低空下盘旋" },
      { time: 23.25, text: "梦中的草长莺飞消失不见" },
      { time: 30.93, text: "表情和言语成锁链" },
      { time: 34.65, text: "对方的指指和点点" },
      { time: 38.46, text: "困住我在无边牢笼里面" },
      { time: 46.26, text: "Idon't wanna be a doll" },
      { time: 48.18, text: "I just want to get my soul" },
      { time: 49.92, text: "Get out of your hands" },
      { time: 51.81, text: "Have my own feelings" },
      { time: 53.82, text: "Idon't wanna be a doll" },
      { time: 55.8, text: "I just want to get my soul" },
      { time: 57.54, text: "Get out of your hands" },
      { time: 58.86, text: "Leave my life" },
      { time: 76.59, text: "婆娑的树影在湖边摇曳" },
      { time: 80.37, text: "盼过冬天又等一个春夜" },
      { time: 84.06, text: "微弱的光落在我心的旷野" },
      { time: 91.8, text: "痛痒和不安就在昨天" },
      { time: 95.52, text: "枯蝶起舞像落叶在告别" },
      { time: 99.36, text: "光阴流转一叶落在我手边" },
      { time: 107.07, text: "Idon't wanna be a doll" },
      { time: 108.78, text: "I just wanna feel my soul" },
      { time: 110.79, text: "Get out of your hands" },
      { time: 112.62, text: "Have my own feelings" },
      { time: 114.45, text: "Idon't wanna be a doll" },
      { time: 116.34, text: "I just wanna own my soul" },
      { time: 118.38, text: "Get out of your hands" },
      { time: 120.72, text: "Leave my life, let me go" },
      { time: 137.13, text: "用力挣破枷锁" },
      { time: 139.05, text: "逆风撑船也不退缩" },
      { time: 140.88, text: "坠入深深漩涡" },
      { time: 142.77, text: "冲破迷雾的我" },
      { time: 144.66, text: "如藏波罗花朵" },
      { time: 146.58, text: "永恒绽放的传说" },
      { time: 148.44, text: "化作燎原烈火" },
      { time: 150.39, text: "不会屈服的我" },
    ],
    tags: ["试听", "本地导入"],
    visibility: "public",
    status: "published",
    sortOrder: 1,
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
      { time: 17.493, text: "孤寂的星在夜幕里朦胧" },
      { time: 21.711, text: "会不会存在 另一颗晚星" },
      { time: 25.412, text: "生来是为了相逢" },
      { time: 31.502, text: "清冷的月在云层间失控" },
      { time: 35.932, text: "呼吸频率和风 都乱了节奏" },
      { time: 39.925, text: "心跳在交融" },
      { time: 43.772, text: "简单点 别让坏情绪的更替 困在季节变迁" },
      { time: 47.15, text: "明亮点 在昏暗堆叠的房间 扶过时序纷乱" },
      { time: 50.938, text: "当灵魂 包裹我不停下坠 就快要分不清" },
      { time: 54.165, text: "是心情还是这引力使然" },
      { time: 58.868, text: "思绪也在慢慢的往下沉着 心脏跌落深渊" },
      { time: 61.34, text: "我固执了这么久的孤独感 当你出现眼前" },
      { time: 64.735, text: "那些糟糕的情绪 像 无根浮萍被涟漪冲散" },
      { time: 74.256, text: "当孤星 摇啊摇  坠啊坠" },
      { time: 75.529, text: "遇见了另一颗星" },
      { time: 78.887, text: "才合并成一道星轨" },
      { time: 80.143, text: "这夜色 没有你 没有我" },
      { time: 81.391, text: "怎么能称得上是绝美" },
      { time: 85.359, text: "当晚风 吹啊吹 追啊追" },
      { time: 88.326, text: "碰到了月云相依" },
      { time: 90.311, text: "眷恋才能深入骨髓" },
      { time: 92.382, text: "这相片 没有你 没有我" },
      { time: 95.065, text: "怎么能算得上是绝配" },
      { time: 114.858, text: "日暮弥漫过地平线" },
      { time: 116.563, text: "晨曦吻上你侧脸" },
      { time: 118.095, text: "黎明炽盛过的天边" },
      { time: 120.126, text: "等待心动出现" },
      { time: 121.758, text: "流星坠入青色云烟   藏好我的眷恋" },
      { time: 125.154, text: "那一弯白净的月帘   倒影出你的双眼" },
      { time: 128.687, text: "听列车汽笛 偷偷 表白我的暗恋" },
      { time: 132.128, text: "看 远方 澄净的海 掺杂着爱 她比天还浅" },
      { time: 136.35, text: "我的喜欢 不会有断点" },
      { time: 138.704, text: "等待 永恒星穹 慢慢地" },
      { time: 140.389, text: "将爱带到你身边" },
      { time: 142.485, text: "当孤星 摇啊摇  坠啊坠" },
      { time: 144.726, text: "遇见了另一颗星" },
      { time: 146.278, text: "才合并成一道星轨" },
      { time: 148.902, text: "这夜色 没有你 没有我" },
      { time: 151.565, text: "怎么能称得上是绝美" },
      { time: 155.988, text: "当晚风 吹啊吹 追啊追" },
      { time: 158.742, text: "碰到了月云相依" },
      { time: 160.485, text: "眷恋才能深入骨髓" },
      { time: 163.052, text: "这相片 没有你 没有我" },
      { time: 165.685, text: "怎么能算得上是绝配" },
      { time: 170.22, text: "当孤星 摇啊摇  坠啊坠" },
      { time: 172.871, text: "遇见了另一颗星" },
      { time: 174.461, text: "才合并成一道星轨" },
      { time: 177.013, text: "这夜色 没有你 没有我" },
      { time: 179.781, text: "怎么能称得上是绝美" },
      { time: 184.076, text: "当晚风 吹啊吹 追啊追" },
      { time: 186.869, text: "碰到了月云相依" },
      { time: 188.862, text: "眷恋才能深入骨髓" },
      { time: 191.276, text: "这相片 没有你 没有我" },
      { time: 193.939, text: "怎么能算得上是绝配" },
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
    songIds: ["song-001", "song-007"],
    accentClass: "bg-[#fde2e7]",
  },
  {
    id: "sunset-walk",
    title: "Sunset Walk",
    description: "适合傍晚散步、把思绪吹松。",
    emoji: "🌅",
    songIds: ["song-007"],
    accentClass: "bg-[#fff2c7]",
  },
  {
    id: "sweet-rock",
    title: "Sweet Rock",
    description: "甜一点的鼓点，给灵感加糖。",
    emoji: "🎀",
    songIds: ["song-001"],
    accentClass: "bg-[#f8cfd5]",
  },
  {
    id: "coding-spark",
    title: "Coding Spark",
    description: "写代码前的充电仪式。",
    emoji: "⚡️",
    songIds: ["song-007"],
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
];

export const playlistPlayerSnapshot: PlaylistPlayerSnapshot = {
  currentTime: "0:42",
  duration: "3:43",
  progressPercent: 18,
  volumePercent: 58,
  statusLabel: "正在循环 Daily Moods",
};
