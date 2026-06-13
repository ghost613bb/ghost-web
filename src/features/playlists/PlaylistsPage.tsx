"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Disc3,
  Grid2X2,
  Heart,
  ListMusic,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Repeat,
  Repeat1,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import type { PlaylistCollection, PlaylistNote, PlaylistPlayerSnapshot, PlaylistSong } from "@/data/playlists";
import type { PlaylistDataSource } from "./service";

type PlaylistsPageViewProps = {
  collections: PlaylistCollection[];
  dataSource?: PlaylistDataSource;
  featuredSongId: string;
  notes: PlaylistNote[];
  playerSnapshot: PlaylistPlayerSnapshot;
  songs: PlaylistSong[];
};

type PlaylistCollectionCreateResult = {
  collection?: PlaylistCollection;
  error?: string;
};

type PlaylistCollectionManageResult = {
  collection?: PlaylistCollection;
  error?: string;
  ok?: boolean;
};

type PlaylistImportResult = {
  songs?: Array<{ title: string }>;
  warnings?: Array<{ fileName?: string; message: string }>;
};

type AdminSessionResult = {
  authenticated: boolean;
  error?: string;
};

type PlaylistMode = "order" | "shuffle" | "repeat-one";

type SongDurationLabels = Record<string, string>;

type PlaylistPlayerControls = {
  audioRef: RefObject<HTMLAudioElement | null>;
  currentSong: PlaylistSong;
  currentSongId: string;
  currentTimeLabel: string;
  currentTimeSeconds: number;
  durationLabel: string;
  handleEnded: () => void;
  handleLoadedMetadata: () => void;
  handlePause: () => void;
  handlePlay: () => void;
  handleSongDurationLoaded: (song: PlaylistSong, durationLabel: string) => void;
  handleTimeUpdate: () => void;
  isPlaying: boolean;
  playbackMode: PlaylistMode;
  playNext: () => void;
  playPrevious: () => void;
  playSong: (songId: string) => void;
  progressPercent: number;
  selectSong: (songId: string) => void;
  seekToPercent: (percent: number) => void;
  songDurationLabels: SongDurationLabels;
  setVolumePercent: (percent: number) => void;
  statusLabel: string;
  togglePlay: () => void;
  togglePlaybackMode: () => void;
  volumePercent: number;
};

const playlistDurationCacheKey = "ghost-web:playlist-duration-labels:v1";
const playbackModes: PlaylistMode[] = ["order", "shuffle", "repeat-one"];
const collectionAccentOptions = [
  { className: "bg-[#fde2e7]", label: "樱花粉" },
  { className: "bg-[#fff2c7]", label: "日落黄" },
  { className: "bg-[#f8cfd5]", label: "甜莓粉" },
  { className: "bg-[#e5f0ff]", label: "晴空蓝" },
  { className: "bg-[#fff4d8]", label: "奶油米" },
  { className: "bg-[#e6dcff]", label: "月光紫" },
];
const lyricSyncOffsetSeconds = 0.35;
const tableHeaderClass = "px-3 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-[#5a332f]";
const topActionClass =
  "inline-flex items-center rounded-[1rem] border-2 border-stone-700/80 bg-[#f8cfd5] px-3.5 py-1 text-sm font-black text-stone-900 transition hover:-translate-y-0.5 hover:bg-[#fbe0e4] sm:px-4 sm:py-1.5";

function getDurationCacheKey(song: PlaylistSong) {
  return song.audioSrc ?? song.id;
}

function getSongDuration(song: PlaylistSong, durationLabels: SongDurationLabels = {}) {
  return durationLabels[getDurationCacheKey(song)] ?? song.duration ?? "—";
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function readCachedDurationLabels(): SongDurationLabels {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const cachedValue = window.localStorage.getItem(playlistDurationCacheKey);
    const parsedValue = cachedValue ? (JSON.parse(cachedValue) as unknown) : null;

    if (!parsedValue || typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
      return {};
    }

    return Object.fromEntries(Object.entries(parsedValue).filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0));
  } catch {
    return {};
  }
}

function writeCachedDurationLabels(durationLabels: SongDurationLabels) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(playlistDurationCacheKey, JSON.stringify(durationLabels));
  } catch {
    // localStorage 可能被浏览器禁用，失败时只影响缓存。
  }
}

function getFeaturedSong(songs: PlaylistSong[], featuredSongId: string) {
  return songs.find((song) => song.id === featuredSongId) ?? songs[0];
}

function SongArtwork({ song }: { song: PlaylistSong }) {
  return (
    <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[0.9rem] border-2 border-stone-700/70 bg-[#fffaf3]">
      {song.coverImageSrc ? (
        <img alt={`${song.title}封面`} className="h-full w-full object-cover" src={song.coverImageSrc} />
      ) : (
        <Grid2X2 aria-hidden="true" className="h-7 w-7 text-[#7b7de0]" />
      )}
    </div>
  );
}

function SongDurationPreloader({ durationLabels, onDurationLoaded, songs }: Pick<PlaylistsPageViewProps, "songs"> & { durationLabels: SongDurationLabels; onDurationLoaded: (song: PlaylistSong, durationLabel: string) => void }) {
  return (
    <div aria-hidden="true" className="hidden">
      {songs.map((song) =>
        song.audioSrc && !durationLabels[getDurationCacheKey(song)] && !song.duration ? (
          <audio
            key={song.id}
            onLoadedMetadata={(event) => {
              const duration = event.currentTarget.duration;

              if (Number.isFinite(duration) && duration > 0) {
                onDurationLoaded(song, formatTime(duration));
              }
            }}
            preload="metadata"
            src={song.audioSrc}
          />
        ) : null,
      )}
    </div>
  );
}

function usePlaylistPlayer(songs: PlaylistSong[], featuredSongId: string, playerSnapshot: PlaylistPlayerSnapshot): PlaylistPlayerControls {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSongId, setCurrentSongId] = useState(() => getFeaturedSong(songs, featuredSongId).id);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [songDurationLabels, setSongDurationLabels] = useState<SongDurationLabels>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [playbackMode, setPlaybackMode] = useState<PlaylistMode>("order");
  const [volumePercent, setVolumePercentState] = useState(playerSnapshot.volumePercent);

  const currentSongIndex = useMemo(() => {
    const index = songs.findIndex((song) => song.id === currentSongId);

    return index >= 0 ? index : 0;
  }, [currentSongId, songs]);
  const currentSong = songs[currentSongIndex] ?? songs[0];

  const applyAudioSource = useCallback(
    (song: PlaylistSong) => {
      const audio = audioRef.current;

      if (!audio) {
        return null;
      }

      if (!song.audioSrc) {
        audio.removeAttribute("src");
        audio.load();
        return null;
      }

      const audioUrl = new URL(song.audioSrc, window.location.href).href;

      if (audio.src !== audioUrl) {
        audio.src = song.audioSrc;
        audio.load();
      }

      audio.volume = volumePercent / 100;
      return audio;
    },
    [volumePercent],
  );

  const playAudio = useCallback(
    async (song: PlaylistSong) => {
      const audio = applyAudioSource(song);

      setPlaybackError(null);
      setCurrentSongId(song.id);
      setCurrentTimeSeconds(0);
      setDurationSeconds(0);

      if (!audio) {
        setIsPlaying(false);
        setPlaybackError("这首歌还没有配置音频源");
        return;
      }

      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
        setPlaybackError("浏览器暂时没能开始播放");
      }
    },
    [applyAudioSource],
  );

  const getSiblingSong = useCallback(
    (direction: 1 | -1) => {
      if (playbackMode === "repeat-one") {
        return currentSong;
      }

      if (playbackMode === "shuffle" && direction === 1 && songs.length > 1) {
        const candidates = songs.filter((song) => song.id !== currentSong.id);
        return candidates[Math.floor(Math.random() * candidates.length)] ?? currentSong;
      }

      const nextIndex = (currentSongIndex + direction + songs.length) % songs.length;

      return songs[nextIndex] ?? currentSong;
    },
    [currentSong, currentSongIndex, playbackMode, songs],
  );

  const playSong = useCallback(
    (songId: string) => {
      const nextSong = songs.find((song) => song.id === songId);

      if (!nextSong) {
        return;
      }

      void playAudio(nextSong);
    },
    [playAudio, songs],
  );

  const selectSong = useCallback((songId: string) => {
    const audio = audioRef.current;

    audio?.pause();
    setCurrentSongId(songId);
    setCurrentTimeSeconds(0);
    setDurationSeconds(0);
    setIsPlaying(false);
    setPlaybackError(null);

    if (audio) {
      audio.removeAttribute("src");
      audio.load();
    }
  }, []);

  const playNext = useCallback(() => {
    void playAudio(getSiblingSong(1));
  }, [getSiblingSong, playAudio]);

  const playPrevious = useCallback(() => {
    void playAudio(getSiblingSong(-1));
  }, [getSiblingSong, playAudio]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;

    if (isPlaying) {
      audio?.pause();
      setIsPlaying(false);
      return;
    }

    void playAudio(currentSong);
  }, [currentSong, isPlaying, playAudio]);

  const seekToPercent = useCallback((percent: number) => {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      return;
    }

    const nextTime = audio.duration * (Math.min(100, Math.max(0, percent)) / 100);
    audio.currentTime = nextTime;
    setCurrentTimeSeconds(nextTime);
  }, []);

  const setVolumePercent = useCallback((percent: number) => {
    const nextVolumePercent = Math.min(100, Math.max(0, percent));
    const audio = audioRef.current;

    if (audio) {
      audio.volume = nextVolumePercent / 100;
    }

    setVolumePercentState(nextVolumePercent);
  }, []);

  const handleSongDurationLoaded = useCallback((song: PlaylistSong, durationLabel: string) => {
    const cacheKey = getDurationCacheKey(song);

    setSongDurationLabels((currentLabels) => {
      if (currentLabels[cacheKey] === durationLabel) {
        return currentLabels;
      }

      const nextLabels = { ...currentLabels, [cacheKey]: durationLabel };
      writeCachedDurationLabels(nextLabels);
      return nextLabels;
    });
  }, []);

  useEffect(() => {
    setSongDurationLabels(readCachedDurationLabels());
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const nextDurationSeconds = Number.isFinite(audio.duration) ? audio.duration : 0;

    setDurationSeconds(nextDurationSeconds);
    if (nextDurationSeconds > 0) {
      handleSongDurationLoaded(currentSong, formatTime(nextDurationSeconds));
    }
    audio.volume = volumePercent / 100;
  }, [currentSong, handleSongDurationLoaded, volumePercent]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    setCurrentTimeSeconds(audio.currentTime);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    playNext();
  }, [playNext]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setPlaybackError(null);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const progressPercent = durationSeconds > 0 ? Math.min(100, Math.max(0, (currentTimeSeconds / durationSeconds) * 100)) : 0;
  const durationLabel = durationSeconds > 0 ? formatTime(durationSeconds) : getSongDuration(currentSong, songDurationLabels);
  const statusLabel = playbackError ?? (isPlaying ? `正在播放 ${currentSong.title}` : playerSnapshot.statusLabel);

  return {
    audioRef,
    currentSong,
    currentSongId: currentSong.id,
    currentTimeLabel: formatTime(currentTimeSeconds),
    currentTimeSeconds,
    durationLabel,
    handleEnded,
    handleLoadedMetadata,
    handlePause,
    handlePlay,
    handleSongDurationLoaded,
    handleTimeUpdate,
    isPlaying,
    playbackMode,
    playNext,
    playPrevious,
    playSong,
    progressPercent,
    selectSong,
    seekToPercent,
    setVolumePercent,
    songDurationLabels,
    statusLabel,
    togglePlay,
    togglePlaybackMode: () => setPlaybackMode((mode) => playbackModes[(playbackModes.indexOf(mode) + 1) % playbackModes.length]),
    volumePercent,
  };
}

function PlaylistCover({ collection }: { collection: PlaylistCollection }) {
  if (collection.coverImageSrc) {
    return (
      <div className="relative h-full min-h-[13.5rem] overflow-hidden rounded-[1.35rem] border-[2.5px] border-stone-700/80 bg-[#ffd8dc] shadow-[0_14px_28px_rgba(112,84,84,0.12)]">
        <img alt={`${collection.title}歌单封面`} className="h-full w-full object-cover" src={collection.coverImageSrc} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#4f2525]/65 via-[#4f2525]/20 to-transparent px-4 pb-4 pt-12 text-[#fffaf3]">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.16em]">Playlist</p>
          <p className="mt-1 text-lg font-black tracking-tight">{collection.title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[13.5rem] overflow-hidden rounded-[1.35rem] border-[2.5px] border-stone-700/80 bg-[#ffd8dc] shadow-[inset_0_-34px_0_rgba(255,233,189,0.72)]">
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 rounded-t-[50%] bg-[#ffe8ad]" />
      <div aria-hidden="true" className="absolute left-7 top-11 h-2 w-2 rounded-full bg-[#f4a4ad] shadow-[72px_34px_0_#f4a4ad,112px_7px_0_#ffe7a5,18px_82px_0_#ffe7a5]" />
      <div className="absolute left-1/2 top-5 -translate-x-1/2 text-center text-[0.72rem] font-black uppercase tracking-[0.12em] text-[#6d3b39]">
        Playlist
      </div>
      <div className="absolute left-1/2 top-[4.9rem] flex h-20 w-32 -translate-x-1/2 items-end justify-center rounded-[48%] border-[2.5px] border-[#8a5a55] bg-[#fffaf3] shadow-[0_8px_0_rgba(138,90,85,0.12)]">
        <div className="absolute -top-9 left-7 h-16 w-16 rounded-full border-[2.5px] border-[#8a5a55] bg-[#fffaf3]" />
        <div className="absolute -top-6 right-8 h-14 w-14 rounded-full border-[2.5px] border-[#8a5a55] bg-[#fffaf3]" />
        <div className="absolute left-10 top-8 h-2 w-2 rounded-full bg-[#e58f98]" />
        <div className="absolute right-10 top-8 h-2 w-2 rounded-full bg-[#e58f98]" />
        <div className="relative z-10 pb-4 text-xl font-black text-[#6d3b39]">⌣</div>
      </div>
    </div>
  );
}

function PlaylistHeader() {
  return (
    <header className="border-b-2 border-stone-700/60 bg-[#f6b8c2]">
      <div className="relative mx-auto flex max-w-[1480px] items-center justify-between gap-3 px-4 py-4.5 sm:px-6">
        <Link className={topActionClass} href="/">
          返回首页小镇
        </Link>
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-black tracking-tight sm:text-[1.75rem]">
          歌单
        </h1>
        <span className="hidden rounded-[1rem] border-2 border-stone-700/80 bg-[#fff4c9] px-4 py-1.5 text-sm font-black text-stone-900 sm:inline-flex">
          今日循环中
        </span>
      </div>
    </header>
  );
}

function PlaylistAdminPanel({ adminError, adminToken, dataSource, isAdminSubmitting, isAdminUnlocked, onAdminTokenChange, onLock, onUnlock }: { adminError: string | null; adminToken: string; dataSource?: PlaylistDataSource; isAdminSubmitting: boolean; isAdminUnlocked: boolean; onAdminTokenChange: (token: string) => void; onLock: () => void; onUnlock: (event: FormEvent<HTMLFormElement>) => void }) {
  const isStaticSource = dataSource !== "supabase";

  return (
    <form className="mb-4 rounded-[1.15rem] border-2 border-stone-700/70 bg-white/55 p-3" onSubmit={onUnlock}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-black text-[#4f2525]">Admin 管理</p>
        <span className={`rounded-full px-2 py-0.5 text-[0.68rem] font-black ${isAdminUnlocked ? "bg-[#dff3cf] text-[#42672d]" : "bg-[#ffeef1] text-[#7a3d3f]"}`}>
          {isAdminUnlocked ? "已解锁" : "未解锁"}
        </span>
      </div>
      <p className="mb-2 text-xs font-semibold leading-5 text-stone-600">{isStaticSource ? "当前为本地 fallback，管理功能需要 Supabase 数据源。" : isAdminUnlocked ? "管理会话已保存，后续操作无需重复输入 Token。" : "输入一次管理 Token，解锁歌单和评论管理。"}</p>
      {isAdminUnlocked ? (
        <button className="w-full rounded-[0.9rem] border-2 border-stone-700/60 bg-white px-3 py-1.5 text-xs font-black text-stone-900 transition hover:bg-[#fff5f6]" disabled={isAdminSubmitting} onClick={onLock} type="button">
          退出管理模式
        </button>
      ) : (
        <div className="space-y-2">
          <label className="sr-only" htmlFor="playlist-admin-token">
            管理 Token
          </label>
          <input className="w-full rounded-[0.9rem] border-2 border-stone-700/50 bg-white/80 px-3 py-2 text-sm font-semibold text-stone-800" disabled={isStaticSource || isAdminSubmitting} id="playlist-admin-token" onChange={(event) => onAdminTokenChange(event.currentTarget.value)} placeholder="管理 Token" type="password" value={adminToken} />
          <button className="w-full rounded-[0.9rem] border-2 border-stone-700/70 bg-[#ffe6ad] px-3 py-1.5 text-xs font-black text-stone-900 shadow-[0_3px_0_rgba(112,84,84,0.12)] disabled:cursor-not-allowed disabled:opacity-60" disabled={isStaticSource || isAdminSubmitting} type="submit">
            {isAdminSubmitting ? "解锁中..." : "解锁管理"}
          </button>
        </div>
      )}
      {adminError ? <p className="mt-2 rounded-[0.85rem] border border-[#b75d66] bg-[#ffeef1] px-2 py-1.5 text-xs font-black text-[#7a3d3f]">{adminError}</p> : null}
    </form>
  );
}

function PlaylistSidebar({ activeCollectionId, adminPanel, collections, createDisabled, importDisabled, isAdminUnlocked, onDeleteCollection, onEditCollection, onOpenCreate, onOpenImport, onSelectCollection }: Pick<PlaylistsPageViewProps, "collections"> & { activeCollectionId: string; adminPanel: ReactNode; createDisabled: boolean; importDisabled: boolean; isAdminUnlocked: boolean; onDeleteCollection: (collection: PlaylistCollection) => void; onEditCollection: (collection: PlaylistCollection) => void; onOpenCreate: () => void; onOpenImport: () => void; onSelectCollection: (collectionId: string) => void }) {
  return (
    <aside aria-label="歌单列表" className="rounded-[1.7rem] border-[2.5px] border-stone-700/80 bg-[#fff7df] p-4 shadow-[0_14px_28px_rgba(112,84,84,0.09)] xl:sticky xl:top-5 xl:self-start">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[1.35rem] font-black uppercase tracking-tight text-[#4f2525]">My Collections</h2>
        <Sparkles aria-hidden="true" className="h-5 w-5 text-[#a54454]" />
      </div>
      {adminPanel}
      <div className="mb-4 space-y-2">
        <button className="flex w-full items-center justify-center gap-2 rounded-[1.15rem] border-[2.5px] border-stone-700/80 bg-[#ffe6ad] px-4 py-2 text-sm font-black text-stone-900 shadow-[0_5px_0_rgba(112,84,84,0.16)] transition enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" disabled={createDisabled} onClick={onOpenCreate} type="button">
          <Plus aria-hidden="true" className="h-4 w-4" />
          New Collection
        </button>
        <button className="flex w-full items-center justify-center gap-2 rounded-[1.15rem] border-[2.5px] border-stone-700/80 bg-[#f8cfd5] px-4 py-2 text-sm font-black text-stone-900 shadow-[0_5px_0_rgba(112,84,84,0.16)] transition enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" disabled={importDisabled} onClick={onOpenImport} type="button">
          <ListMusic aria-hidden="true" className="h-4 w-4" />
          批量导入歌曲
        </button>
      </div>
      <div className="flex snap-x gap-3 overflow-x-auto pb-1 xl:block xl:space-y-3 xl:overflow-visible xl:pb-0">
        {collections.map((collection) => {
          const isActive = collection.id === activeCollectionId;

          return (
            <article className={`min-w-[14rem] snap-start rounded-[1.2rem] border-[2.5px] border-stone-700/75 p-3 shadow-[0_6px_0_rgba(112,84,84,0.11)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(112,84,84,0.13)] xl:w-full xl:min-w-0 ${collection.accentClass} ${isActive ? "outline outline-2 outline-offset-2 outline-[#c65f70]" : ""}`} key={collection.id}>
              <button aria-pressed={isActive} className="flex min-h-[6rem] w-full flex-col justify-between text-left" onClick={() => onSelectCollection(collection.id)} type="button">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-base font-black text-stone-900">
                      <span aria-hidden="true">{collection.emoji}</span>
                      <h3>{collection.title}</h3>
                    </div>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-stone-700">{collection.description}</p>
                  </div>
                  {isActive ? <X aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /> : <ChevronDown aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />}
                </div>
                <p className="mt-3 inline-flex w-fit rounded-full border border-stone-700/30 bg-white/55 px-2.5 py-1 text-[0.68rem] font-black text-[#6d3b39]">
                  {collection.songIds.length} songs
                </p>
              </button>
              {isAdminUnlocked ? (
                <div className="mt-2 flex justify-end gap-1">
                  <button className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-black text-[#7a3d3f]" onClick={() => onEditCollection(collection)} type="button">
                    编辑
                  </button>
                  <button className="rounded-full bg-[#ffeef1] px-2 py-0.5 text-xs font-black text-[#9b4d57]" onClick={() => onDeleteCollection(collection)} type="button">
                    删除
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </aside>
  );
}

function HeroPanel({ collection, featuredSong, isPlaying, onPlayAll, songs }: { collection: PlaylistCollection; featuredSong: PlaylistSong; isPlaying: boolean; onPlayAll: () => void; songs: PlaylistSong[] }) {
  const hasSongs = songs.length > 0;

  return (
    <section className="grid gap-4 rounded-[1.8rem] border-[2.5px] border-stone-700/80 bg-[#fffaf3] p-4 shadow-[0_14px_28px_rgba(112,84,84,0.08)] md:grid-cols-[13rem_minmax(0,1fr)] md:p-5" aria-label="歌单概览">
      <PlaylistCover collection={collection} />
      <div className="flex min-w-0 flex-col justify-center">
        <p className="mb-2 inline-flex w-fit rounded-full border border-[#e4b7b9] bg-[#fff0c4] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#7a3d3f]">
          Playlist detail · {hasSongs ? songs.length * 2 + 2 : 0} minutes
        </p>
        <h2 className="text-[2.45rem] font-black leading-none tracking-tight text-[#4f2525] sm:text-[3.35rem]">{collection.title}</h2>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-stone-700 sm:text-base">{hasSongs ? featuredSong.feeling : collection.description || "这个歌单还没有歌曲，可以用批量导入歌曲添加。"}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button aria-label={`${isPlaying ? "暂停" : "播放"}${featuredSong.title}`} className="inline-flex items-center gap-2 rounded-[1.2rem] border-[2.5px] border-stone-700/80 bg-[#ffe6a7] px-5 py-2 text-base font-black text-stone-900 shadow-[0_5px_0_rgba(112,84,84,0.15)] transition enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" disabled={!hasSongs} onClick={onPlayAll} type="button">
            {isPlaying ? <Pause aria-hidden="true" className="h-5 w-5 fill-[#f5a0aa] text-stone-900" /> : <Play aria-hidden="true" className="h-5 w-5 fill-[#f5a0aa] text-stone-900" />}
            Play All
          </button>
          <button className="inline-flex items-center gap-2 rounded-[1.2rem] border-[2.5px] border-stone-700/70 bg-white px-5 py-2 text-base font-black text-stone-900 transition hover:-translate-y-0.5 hover:bg-[#fff5f6]" type="button">
            <Share2 aria-hidden="true" className="h-5 w-5" />
            Share
          </button>
        </div>
      </div>
    </section>
  );
}

function SongTable({ currentSongId, durationLabels, isPlaying, onPlaySong, onTogglePlay, songs }: Pick<PlaylistsPageViewProps, "songs"> & { currentSongId: string; durationLabels: SongDurationLabels; isPlaying: boolean; onPlaySong: (songId: string) => void; onTogglePlay: () => void }) {
  const handleSongButtonClick = (songId: string) => {
    if (songId === currentSongId) {
      onTogglePlay();
      return;
    }

    onPlaySong(songId);
  };

  return (
    <section aria-label="今日循环歌曲" className="rounded-[1.8rem] border-[2.5px] border-stone-700/80 bg-[#fffaf3] p-3 shadow-[0_14px_28px_rgba(112,84,84,0.08)] sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a54454]">Now spinning</p>
          <h2 className="text-2xl font-black text-[#4f2525]">今日循环</h2>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#edc2c6] bg-[#ffeef1] px-3 py-1 text-xs font-black text-[#7a3d3f]">
          <ListMusic aria-hidden="true" className="h-4 w-4" />
          {songs.length} 首
        </span>
      </div>

      {songs.length === 0 ? (
        <div className="rounded-[1.2rem] border border-[#eed8c6] bg-white/65 p-6 text-center text-sm font-black text-[#7a3d3f]">
          这个歌单还没有歌曲。点击左侧“批量导入歌曲”添加 MP3 和 LRC。
        </div>
      ) : null}

      <div className={`${songs.length === 0 ? "hidden" : "hidden md:block"} overflow-hidden rounded-[1.2rem] border border-[#eed8c6] bg-[repeating-linear-gradient(180deg,#fffaf3_0,#fffaf3_42px,#fff3e8_43px,#fff3e8_44px)]`}>
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[#f8edd1]/90">
            <tr>
              <th className={`${tableHeaderClass} w-14`}>#</th>
              <th className={tableHeaderClass}>Song Title</th>
              <th className={tableHeaderClass}>Artist</th>
              <th className={tableHeaderClass}>Mood</th>
              <th className={`${tableHeaderClass} text-right`}>Length</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song, index) => {
              const isCurrent = song.id === currentSongId;
              const songButtonLabel = `${isCurrent && isPlaying ? "暂停" : "播放"}${song.title}`;

              return (
                <tr className={isCurrent ? "bg-[#f9d7db]" : "transition hover:bg-[#fff1f3]"} key={song.id}>
                  <td className="px-3 py-3 align-top text-sm font-black text-[#5a332f]">
                    <button aria-label={songButtonLabel} className="inline-flex items-center gap-1 rounded-full p-1 transition hover:bg-white/60" onClick={() => handleSongButtonClick(song.id)} type="button">
                      {isCurrent && isPlaying ? <Pause aria-hidden="true" className="h-4 w-4 fill-[#4f2525] text-[#4f2525]" /> : <Play aria-hidden="true" className="h-4 w-4 fill-[#4f2525] text-[#4f2525]" />}
                      {index + 1}.
                    </button>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="font-black text-stone-900">{song.title}</div>
                  </td>
                  <td className="px-3 py-3 align-top font-semibold text-stone-700">{song.artist}</td>
                  <td className="max-w-[17rem] px-3 py-3 align-top text-xs font-semibold leading-5 text-stone-700">{song.shortReview}</td>
                  <td className="px-3 py-3 text-right align-top font-black text-[#5a332f]">{getSongDuration(song, durationLabels)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={`${songs.length === 0 ? "hidden" : "space-y-3 md:hidden"}`}>
        {songs.map((song, index) => {
          const isCurrent = song.id === currentSongId;
          const songButtonLabel = `${isCurrent && isPlaying ? "暂停" : "播放"}${song.title}`;

          return (
            <article className={`rounded-[1.2rem] border-2 border-stone-700/50 p-3 ${isCurrent ? "bg-[#f9d7db]" : "bg-white/70"}`} key={song.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-[#8d4b55]">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="text-lg font-black text-stone-900">{song.title}</h3>
                  <p className="text-sm font-semibold text-stone-700">{song.artist}</p>
                </div>
                <button aria-label={songButtonLabel} className="inline-flex items-center gap-1 rounded-full bg-[#fff3c7] px-2.5 py-1 text-xs font-black text-[#6d3b39]" onClick={() => handleSongButtonClick(song.id)} type="button">
                  {isCurrent && isPlaying ? <Pause aria-hidden="true" className="h-3.5 w-3.5 fill-[#4f2525] text-[#4f2525]" /> : <Play aria-hidden="true" className="h-3.5 w-3.5 fill-[#4f2525] text-[#4f2525]" />}
                  {getSongDuration(song, durationLabels)}
                </button>
              </div>
              <p className="mt-2 text-sm font-semibold leading-6 text-stone-700">{song.shortReview}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function LyricsPanel({ currentTimeSeconds, song }: { currentTimeSeconds: number; song: PlaylistSong }) {
  const activeLineRef = useRef<HTMLParagraphElement | null>(null);
  const lyricsListRef = useRef<HTMLDivElement | null>(null);
  const lyrics = song.lyrics?.length ? song.lyrics : [{ time: 0, text: song.feeling }];
  const lyricTimeSeconds = currentTimeSeconds + lyricSyncOffsetSeconds;
  const activeLyricIndex = lyrics.reduce((activeIndex, line, index) => (lyricTimeSeconds >= line.time ? index : activeIndex), -1);

  useEffect(() => {
    const activeLine = activeLineRef.current;
    const lyricsList = lyricsListRef.current;

    if (!activeLine || !lyricsList) {
      return;
    }

    const listRect = lyricsList.getBoundingClientRect();
    const lineRect = activeLine.getBoundingClientRect();

    lyricsList.scrollTo({
      behavior: "smooth",
      top: lyricsList.scrollTop + lineRect.top - listRect.top - lyricsList.clientHeight / 2 + lineRect.height / 2,
    });
  }, [activeLyricIndex, song.id]);

  return (
    <aside aria-label="歌词播放器" className="xl:sticky xl:top-5 xl:self-start">
      <section className="lyrics-panel-enter h-[40rem] overflow-hidden rounded-[1.7rem] border-[2.5px] border-stone-700/80 bg-[#fff4d8] p-4 shadow-[0_14px_28px_rgba(112,84,84,0.09)]">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#aa6a70] bg-[#fbd4d9] text-lg font-black text-[#7a3d3f]">
            词
          </span>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#4f2525]">Lyrics Room</h2>
            <p className="text-xs font-bold text-stone-600">{song.title}</p>
          </div>
        </div>

        <div className="flex h-[32rem] flex-col items-center rounded-[1.45rem] border-2 border-stone-700/70 bg-[#fffaf3] px-4 py-8 shadow-[inset_0_-18px_0_rgba(255,230,173,0.38)]">
          <div className="lyrics-disc relative grid h-36 w-36 place-items-center rounded-full border-[3px] border-[#5f514b] bg-[repeating-radial-gradient(circle,#4f4744_0_2px,#3d3735_3px_7px,#5a5150_8px_10px)] shadow-[0_12px_0_rgba(112,84,84,0.13)]">
            <div className="absolute inset-4 rounded-full border border-white/10 bg-[radial-gradient(circle,#f8cfd5_0_18%,#fff4d8_19%_30%,transparent_31%)]" />
            <div className="relative grid h-20 w-20 place-items-center overflow-hidden rounded-full border-2 border-[#fff4d8] bg-[#f8cfd5]">
              {song.coverImageSrc ? (
                <img alt={`${song.title}歌词光盘封面`} className="h-full w-full object-cover" src={song.coverImageSrc} />
              ) : (
                <Grid2X2 aria-hidden="true" className="h-8 w-8 text-[#7b7de0]" />
              )}
            </div>
            <span aria-hidden="true" className="absolute h-4 w-4 rounded-full border-2 border-[#5f514b] bg-[#fffaf3]" />
          </div>

          <div className="album-page-scrollbar mt-5 w-full flex-1 space-y-3 overflow-y-auto pr-1 text-center" ref={lyricsListRef}>
            {lyrics.map((line, index) => {
              const isActive = index === activeLyricIndex;

              return (
                <p
                  aria-current={isActive ? "true" : undefined}
                  className={`lyrics-line rounded-full px-3 py-1.5 font-black transition-all duration-300 ${isActive ? "bg-[#f9d7db] text-base text-[#4f2525] shadow-[0_4px_0_rgba(112,84,84,0.08)]" : "text-sm text-stone-500"}`}
                  key={`${song.id}-${line.time}-${line.text}`}
                  ref={isActive ? activeLineRef : null}
                  style={{ animationDelay: `${index * 35 + 80}ms` }}
                >
                  {line.text}
                </p>
              );
            })}
          </div>
        </div>
      </section>
    </aside>
  );
}

function CommentPlayerPanel({ dataSource, featuredSong, isAdminUnlocked, notes, onCreatedNote, onDeletedNote, onUpdatedNote }: { dataSource?: PlaylistDataSource; featuredSong: PlaylistSong; isAdminUnlocked: boolean; notes: PlaylistNote[]; onCreatedNote: (note: PlaylistNote) => void; onDeletedNote: (noteId: string) => void; onUpdatedNote: (note: PlaylistNote) => void }) {
  const [author, setAuthor] = useState("Name");
  const [avatar, setAvatar] = useState("🎧");
  const [content, setContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingAuthor, setEditingAuthor] = useState("Name");
  const [editingAvatar, setEditingAvatar] = useState("🎧");
  const [editingContent, setEditingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingNoteId, setUpdatingNoteId] = useState<string | null>(null);
  const isCommentDisabled = dataSource !== "supabase" || !isAdminUnlocked;
  const visibleNotes = notes.filter((note) => note.songId === featuredSong.id);
  const disabledMessage = dataSource !== "supabase" ? "当前为本地 fallback，歌曲评论需要 Supabase 数据源。" : "请先解锁 Admin 管理模式，再提交评论。";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isCommentDisabled) {
      setError(disabledMessage);
      return;
    }

    if (!content.trim()) {
      setError("请输入评论内容");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/playlists/songs/${encodeURIComponent(featuredSong.id)}/notes`, {
        body: JSON.stringify({
          author,
          avatar,
          content,
        }),
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = (await response.json()) as { error?: string; note?: PlaylistNote };

      if (!response.ok || !data.note) {
        throw new Error(data.error ?? "新增歌曲评论失败");
      }

      onCreatedNote(data.note);
      setContent("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "新增歌曲评论失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingNote = (note: PlaylistNote) => {
    setEditingNoteId(note.id);
    setEditingAuthor(note.author);
    setEditingAvatar(note.avatar);
    setEditingContent(note.content);
    setError(null);
  };

  const handleUpdateNote = async (noteId: string) => {
    setError(null);

    if (!editingContent.trim()) {
      setError("请输入评论内容");
      return;
    }

    setUpdatingNoteId(noteId);

    try {
      const response = await fetch(`/api/playlists/songs/${encodeURIComponent(featuredSong.id)}/notes/${encodeURIComponent(noteId)}`, {
        body: JSON.stringify({
          author: editingAuthor,
          avatar: editingAvatar,
          content: editingContent,
        }),
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });
      const data = (await response.json()) as { error?: string; note?: PlaylistNote };

      if (!response.ok || !data.note) {
        throw new Error(data.error ?? "编辑歌曲评论失败");
      }

      onUpdatedNote(data.note);
      setEditingNoteId(null);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "编辑歌曲评论失败");
    } finally {
      setUpdatingNoteId(null);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm("确定删除这条评论吗？")) {
      return;
    }

    setError(null);
    setUpdatingNoteId(noteId);

    try {
      const response = await fetch(`/api/playlists/songs/${encodeURIComponent(featuredSong.id)}/notes/${encodeURIComponent(noteId)}`, {
        credentials: "same-origin",
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "删除歌曲评论失败");
      }

      onDeletedNote(noteId);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "删除歌曲评论失败");
    } finally {
      setUpdatingNoteId(null);
    }
  };

  return (
    <aside aria-label="耳机留言播放器" className="space-y-4 xl:sticky xl:top-5 xl:self-start">
      <section className="rounded-[1.7rem] border-[2.5px] border-stone-700/80 bg-[#fff4d8] p-4 shadow-[0_14px_28px_rgba(112,84,84,0.09)]">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#aa6a70] bg-[#fbd4d9] text-lg">
            <Disc3 aria-hidden="true" className="h-5 w-5 text-[#7a3d3f]" />
          </span>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#4f2525]">Discussion & Player</h2>
            <p className="text-xs font-bold text-stone-600">{featuredSong.title}</p>
          </div>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_4.5rem]">
            <label className="sr-only" htmlFor="playlist-comment-author">
              评论昵称
            </label>
            <input className="rounded-[1rem] border-2 border-stone-700/50 bg-white/70 px-3 py-2 text-sm font-semibold text-stone-800" disabled={isCommentDisabled || isSubmitting} id="playlist-comment-author" maxLength={40} onChange={(event) => setAuthor(event.currentTarget.value)} placeholder="Name" value={author} />
            <label className="sr-only" htmlFor="playlist-comment-avatar">
              评论头像
            </label>
            <input className="rounded-[1rem] border-2 border-stone-700/50 bg-white/70 px-3 py-2 text-center text-sm font-semibold text-stone-800" disabled={isCommentDisabled || isSubmitting} id="playlist-comment-avatar" maxLength={16} onChange={(event) => setAvatar(event.currentTarget.value)} value={avatar} />
          </div>
          <label className="sr-only" htmlFor="playlist-comment">
            添加可爱评论
          </label>
          <textarea className="h-20 w-full resize-none rounded-[1.2rem] border-2 border-stone-700/60 bg-white/70 p-3 text-sm font-semibold text-stone-800 placeholder:text-stone-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={isCommentDisabled || isSubmitting} id="playlist-comment" maxLength={280} onChange={(event) => setContent(event.currentTarget.value)} placeholder={isCommentDisabled ? disabledMessage : "Add a cute comment..."} value={content} />
          {isCommentDisabled ? <p className="text-xs font-black text-[#7a3d3f]">{disabledMessage}</p> : null}
          {error ? <p className="rounded-[1rem] border-2 border-[#b75d66] bg-[#ffeef1] px-3 py-2 text-xs font-black text-[#7a3d3f]">{error}</p> : null}
          <div className="flex justify-end">
            <button className="rounded-[1rem] border-2 border-stone-700/70 bg-[#ffe0a8] px-4 py-1.5 text-sm font-black shadow-[0_4px_0_rgba(112,84,84,0.12)] disabled:cursor-not-allowed disabled:opacity-60" disabled={isCommentDisabled || isSubmitting} type="submit">
              {isSubmitting ? "Commenting..." : "Comment"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[1.7rem] border-[2.5px] border-stone-700/80 bg-[#fffaf3] p-4 shadow-[0_14px_28px_rgba(112,84,84,0.09)]">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle aria-hidden="true" className="h-5 w-5 text-[#9b4d57]" />
          <h2 className="text-lg font-black text-[#4f2525]">耳机留言</h2>
        </div>
        {visibleNotes.length === 0 ? (
          <div className="rounded-[1rem] border border-[#efd7d3] bg-[#fff7f0] px-4 py-5 text-center">
            <p className="text-sm font-black text-[#4f2525]">这片声波还没有回信。</p>
            <p className="mt-1 text-xs font-semibold text-stone-500">写一句，让它有第一个回声。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleNotes.map((note) => {
              const isEditing = editingNoteId === note.id;
              const isUpdating = updatingNoteId === note.id;

              return (
                <article className="relative rounded-[1rem] border border-[#efd7d3] bg-[#fff7f0] p-3 pl-11" key={note.id}>
                  <span aria-hidden="true" className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-full border-2 border-[#c4878c] bg-[#fde2e7] text-sm">
                    {isEditing ? editingAvatar : note.avatar}
                  </span>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_4rem]">
                        <input aria-label="编辑评论昵称" className="rounded-[0.85rem] border border-[#efd7d3] bg-white/80 px-2 py-1 text-sm font-semibold text-stone-800" maxLength={40} onChange={(event) => setEditingAuthor(event.currentTarget.value)} value={editingAuthor} />
                        <input aria-label="编辑评论头像" className="rounded-[0.85rem] border border-[#efd7d3] bg-white/80 px-2 py-1 text-center text-sm font-semibold text-stone-800" maxLength={16} onChange={(event) => setEditingAvatar(event.currentTarget.value)} value={editingAvatar} />
                      </div>
                      <textarea aria-label="编辑评论内容" className="h-20 w-full resize-none rounded-[0.95rem] border border-[#efd7d3] bg-white/80 px-2 py-1 text-sm font-semibold text-stone-800" maxLength={280} onChange={(event) => setEditingContent(event.currentTarget.value)} value={editingContent} />
                      <div className="flex justify-end gap-2">
                        <button className="rounded-full border border-[#efd7d3] bg-white px-2.5 py-1 text-xs font-black text-[#4f2525]" disabled={isUpdating} onClick={() => setEditingNoteId(null)} type="button">
                          取消
                        </button>
                        <button className="rounded-full border border-[#c4878c] bg-[#ffe0a8] px-2.5 py-1 text-xs font-black text-[#4f2525] disabled:opacity-60" disabled={isUpdating} onClick={() => void handleUpdateNote(note.id)} type="button">
                          {isUpdating ? "保存中..." : "保存"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-black text-[#4f2525]">
                          {note.author} <span className="text-xs font-bold text-stone-500">{note.time}</span>
                        </p>
                        {isAdminUnlocked ? (
                          <div className="flex shrink-0 gap-1">
                            <button className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-black text-[#7a3d3f]" disabled={isUpdating} onClick={() => startEditingNote(note)} type="button">
                              编辑
                            </button>
                            <button className="rounded-full bg-[#ffeef1] px-2 py-0.5 text-xs font-black text-[#9b4d57]" disabled={isUpdating} onClick={() => void handleDeleteNote(note.id)} type="button">
                              删除
                            </button>
                          </div>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm font-semibold leading-5 text-stone-700">{note.content}</p>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </aside>
  );
}

function getImportFileBaseName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").trim().toLowerCase();
}

function PlaylistCreateCollectionDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (collection: PlaylistCollection) => void }) {
  const [accentClass, setAccentClass] = useState(collectionAccentOptions[0].className);
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🎵");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("请输入歌单名称");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/playlists/collections", {
        body: JSON.stringify({
          accentClass,
          description,
          emoji,
          title,
        }),
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = (await response.json()) as PlaylistCollectionCreateResult;

      if (!response.ok || !data.collection) {
        throw new Error(data.error ?? "新增歌单失败");
      }

      onCreated(data.collection);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "新增歌单失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#4f2525]/35 px-4 backdrop-blur-sm" role="presentation">
      <section aria-label="新增歌单" className="w-full max-w-2xl rounded-[1.7rem] border-[2.5px] border-stone-700/80 bg-[#fffaf3] p-4 shadow-[0_18px_42px_rgba(79,37,37,0.25)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a54454]">Playlist Collection</p>
            <h2 className="text-2xl font-black text-[#4f2525]">新增歌单</h2>
            <p className="mt-1 text-sm font-semibold text-stone-600">创建一个空歌单，之后可以继续批量导入歌曲。</p>
          </div>
          <button aria-label="关闭新增歌单" className="rounded-full p-1 text-[#4f2525] transition hover:bg-[#f8cfd5]" onClick={onClose} type="button">
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-black text-[#4f2525]">
            歌单名称
            <input className="mt-2 w-full rounded-[1rem] border-2 border-stone-700/60 bg-white/80 px-3 py-2 font-semibold text-stone-800" maxLength={60} onChange={(event) => setTitle(event.currentTarget.value)} placeholder="例如：Late Night Loop" value={title} />
          </label>

          <label className="block text-sm font-black text-[#4f2525]">
            描述
            <textarea className="mt-2 h-20 w-full resize-none rounded-[1rem] border-2 border-stone-700/60 bg-white/80 px-3 py-2 font-semibold text-stone-800" maxLength={160} onChange={(event) => setDescription(event.currentTarget.value)} placeholder="写一句这个歌单的用途或氛围" value={description} />
          </label>

          <div className="grid gap-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
            <label className="block text-sm font-black text-[#4f2525]">
              图标
              <input className="mt-2 w-full rounded-[1rem] border-2 border-stone-700/60 bg-white/80 px-3 py-2 text-center text-lg font-semibold text-stone-800" maxLength={16} onChange={(event) => setEmoji(event.currentTarget.value)} value={emoji} />
            </label>

            <label className="block text-sm font-black text-[#4f2525]">
              主题色
              <select className="mt-2 w-full rounded-[1rem] border-2 border-stone-700/60 bg-white/80 px-3 py-2 font-semibold text-stone-800" onChange={(event) => setAccentClass(event.currentTarget.value)} value={accentClass}>
                {collectionAccentOptions.map((option) => (
                  <option key={option.className} value={option.className}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? <p className="rounded-[1rem] border-2 border-[#b75d66] bg-[#ffeef1] px-3 py-2 text-sm font-black text-[#7a3d3f]">{error}</p> : null}

          <div className="flex justify-end gap-3">
            <button className="rounded-[1rem] border-2 border-stone-700/60 bg-white px-4 py-2 text-sm font-black text-stone-900" onClick={onClose} type="button">
              取消
            </button>
            <button className="rounded-[1rem] border-2 border-stone-700/70 bg-[#f8cfd5] px-4 py-2 text-sm font-black text-stone-900 shadow-[0_4px_0_rgba(112,84,84,0.12)] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? "创建中..." : "创建歌单"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function PlaylistEditCollectionDialog({ collection, onClose, onUpdated }: { collection: PlaylistCollection; onClose: () => void; onUpdated: (collection: PlaylistCollection) => void }) {
  const [accentClass, setAccentClass] = useState(collection.accentClass);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [description, setDescription] = useState(collection.description);
  const [emoji, setEmoji] = useState(collection.emoji);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(collection.title);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("请输入歌单名称");
      return;
    }

    setIsSubmitting(true);

    try {
      let response: Response;

      if (coverFile) {
        const formData = new FormData();
        formData.set("accentClass", accentClass);
        formData.set("coverFile", coverFile);
        formData.set("description", description);
        formData.set("emoji", emoji);
        formData.set("title", title);
        response = await fetch(`/api/playlists/collections/${encodeURIComponent(collection.id)}/cover`, {
          body: formData,
          credentials: "same-origin",
          method: "POST",
        });
      } else {
        response = await fetch(`/api/playlists/collections/${encodeURIComponent(collection.id)}`, {
          body: JSON.stringify({
            accentClass,
            description,
            emoji,
            title,
          }),
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          method: "PATCH",
        });
      }

      const data = (await response.json()) as PlaylistCollectionManageResult;

      if (!response.ok || !data.collection) {
        throw new Error(data.error ?? "编辑歌单失败");
      }

      onUpdated({ ...data.collection, songIds: collection.songIds });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "编辑歌单失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#4f2525]/35 px-4 backdrop-blur-sm" role="presentation">
      <section aria-label="编辑歌单" className="w-full max-w-2xl rounded-[1.7rem] border-[2.5px] border-stone-700/80 bg-[#fffaf3] p-4 shadow-[0_18px_42px_rgba(79,37,37,0.25)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a54454]">Playlist Collection</p>
            <h2 className="text-2xl font-black text-[#4f2525]">编辑歌单</h2>
            <p className="mt-1 text-sm font-semibold text-stone-600">修改歌单名称、描述、图标、主题色和封面。</p>
          </div>
          <button aria-label="关闭编辑歌单" className="rounded-full p-1 text-[#4f2525] transition hover:bg-[#f8cfd5]" onClick={onClose} type="button">
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-black text-[#4f2525]">
            歌单名称
            <input className="mt-2 w-full rounded-[1rem] border-2 border-stone-700/60 bg-white/80 px-3 py-2 font-semibold text-stone-800" maxLength={60} onChange={(event) => setTitle(event.currentTarget.value)} placeholder="例如：Late Night Loop" value={title} />
          </label>

          <label className="block text-sm font-black text-[#4f2525]">
            描述
            <textarea className="mt-2 h-20 w-full resize-none rounded-[1rem] border-2 border-stone-700/60 bg-white/80 px-3 py-2 font-semibold text-stone-800" maxLength={160} onChange={(event) => setDescription(event.currentTarget.value)} placeholder="写一句这个歌单的用途或氛围" value={description} />
          </label>

          <div className="grid gap-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
            <label className="block text-sm font-black text-[#4f2525]">
              图标
              <input className="mt-2 w-full rounded-[1rem] border-2 border-stone-700/60 bg-white/80 px-3 py-2 text-center text-lg font-semibold text-stone-800" maxLength={16} onChange={(event) => setEmoji(event.currentTarget.value)} value={emoji} />
            </label>

            <label className="block text-sm font-black text-[#4f2525]">
              主题色
              <select className="mt-2 w-full rounded-[1rem] border-2 border-stone-700/60 bg-white/80 px-3 py-2 font-semibold text-stone-800" onChange={(event) => setAccentClass(event.currentTarget.value)} value={accentClass}>
                {collectionAccentOptions.map((option) => (
                  <option key={option.className} value={option.className}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm font-black text-[#4f2525]">
            歌单封面
            <input accept="image/jpeg,image/png,image/webp" aria-label="歌单封面" className="mt-2 block w-full text-sm font-semibold text-stone-700 file:mr-3 file:rounded-full file:border-2 file:border-stone-700/70 file:bg-[#ffe6ad] file:px-3 file:py-1 file:font-black" onChange={(event) => setCoverFile(event.currentTarget.files?.[0] ?? null)} type="file" />
            <span className="mt-1 block text-xs font-semibold text-stone-500">可选，支持 JPG / PNG / WebP，最大 5MB。</span>
          </label>

          {collection.coverImageSrc ? <img alt={`${collection.title}当前歌单封面`} className="h-28 w-full rounded-[1rem] border border-[#ead7ce] object-cover" src={collection.coverImageSrc} /> : null}
          {error ? <p className="rounded-[1rem] border-2 border-[#b75d66] bg-[#ffeef1] px-3 py-2 text-sm font-black text-[#7a3d3f]">{error}</p> : null}

          <div className="flex justify-end gap-3">
            <button className="rounded-[1rem] border-2 border-stone-700/60 bg-white px-4 py-2 text-sm font-black text-stone-900" onClick={onClose} type="button">
              取消
            </button>
            <button className="rounded-[1rem] border-2 border-stone-700/70 bg-[#f8cfd5] px-4 py-2 text-sm font-black text-stone-900 shadow-[0_4px_0_rgba(112,84,84,0.12)] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? "保存中..." : "保存歌单"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function PlaylistBatchImportDialog({ activeCollectionId, collections, onClose }: { activeCollectionId: string; collections: PlaylistCollection[]; onClose: () => void }) {
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [lyricFiles, setLyricFiles] = useState<File[]>([]);
  const [collectionId, setCollectionId] = useState(activeCollectionId);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PlaylistImportResult | null>(null);
  const lyricBaseNames = new Set(lyricFiles.map((file) => getImportFileBaseName(file.name)));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (audioFiles.length === 0) {
      setError("请先选择 MP3 文件");
      return;
    }

    const formData = new FormData();

    formData.set("collectionId", collectionId);
    audioFiles.forEach((file) => formData.append("audioFiles", file));
    lyricFiles.forEach((file) => formData.append("lyricFiles", file));

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/playlists/import", {
        body: formData,
        credentials: "same-origin",
        method: "POST",
      });
      const data = (await response.json()) as PlaylistImportResult & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "导入失败");
      }

      setResult(data);
      window.setTimeout(() => window.location.reload(), 900);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "导入失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#4f2525]/35 px-4 backdrop-blur-sm" role="presentation">
      <section aria-label="批量导入歌曲" className="album-page-scrollbar max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[1.7rem] border-[2.5px] border-stone-700/80 bg-[#fffaf3] p-4 shadow-[0_18px_42px_rgba(79,37,37,0.25)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a54454]">Playlist Import</p>
            <h2 className="text-2xl font-black text-[#4f2525]">批量导入歌曲</h2>
            <p className="mt-1 text-sm font-semibold text-stone-600">上传 MP3 和同名 LRC，自动解析封面、歌词和短音评。</p>
          </div>
          <button aria-label="关闭批量导入" className="rounded-full p-1 text-[#4f2525] transition hover:bg-[#f8cfd5]" onClick={onClose} type="button">
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block rounded-[1.2rem] border-2 border-dashed border-stone-700/60 bg-[#fff4d8] p-3 text-sm font-black text-[#4f2525]">
            MP3 文件
            <input accept=".mp3,audio/mpeg" className="mt-2 block w-full text-sm font-semibold text-stone-700 file:mr-3 file:rounded-full file:border-2 file:border-stone-700/70 file:bg-[#f8cfd5] file:px-3 file:py-1 file:font-black" multiple onChange={(event) => setAudioFiles(Array.from(event.currentTarget.files ?? []))} type="file" />
          </label>

          <label className="block rounded-[1.2rem] border-2 border-dashed border-stone-700/60 bg-[#fff4d8] p-3 text-sm font-black text-[#4f2525]">
            LRC 歌词文件
            <input accept=".lrc" className="mt-2 block w-full text-sm font-semibold text-stone-700 file:mr-3 file:rounded-full file:border-2 file:border-stone-700/70 file:bg-[#ffe6ad] file:px-3 file:py-1 file:font-black" multiple onChange={(event) => setLyricFiles(Array.from(event.currentTarget.files ?? []))} type="file" />
          </label>

          <label className="block text-sm font-black text-[#4f2525]">
            导入到歌单
            <select className="mt-2 w-full rounded-[1rem] border-2 border-stone-700/60 bg-white/80 px-3 py-2 font-semibold text-stone-800" onChange={(event) => setCollectionId(event.currentTarget.value)} value={collectionId}>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.title}
                </option>
              ))}
            </select>
          </label>

          {audioFiles.length > 0 ? (
            <div className="rounded-[1.1rem] border border-[#eed8c6] bg-white/60 p-3">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#a54454]">匹配预览</p>
              <div className="album-page-scrollbar max-h-64 space-y-2 overflow-y-auto pr-1 text-sm font-semibold text-stone-700">
                {audioFiles.map((file) => {
                  const hasLyric = lyricBaseNames.has(getImportFileBaseName(file.name));

                  return (
                    <p className="flex items-center justify-between gap-3" key={file.name}>
                      <span className="truncate">{file.name}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-black ${hasLyric ? "bg-[#dff3cf] text-[#42672d]" : "bg-[#ffe6ad] text-[#7a3d3f]"}`}>{hasLyric ? "已匹配 LRC" : "无同名 LRC"}</span>
                    </p>
                  );
                })}
              </div>
            </div>
          ) : null}

          {error ? <p className="rounded-[1rem] border-2 border-[#b75d66] bg-[#ffeef1] px-3 py-2 text-sm font-black text-[#7a3d3f]">{error}</p> : null}
          {result ? (
            <div className="rounded-[1rem] border-2 border-[#8fa875] bg-[#f1f8dd] px-3 py-2 text-sm font-black text-[#42672d]">
              已导入 {result.songs?.length ?? 0} 首歌，页面即将刷新。
              {result.warnings?.map((warning) => (
                <p className="mt-1 text-xs" key={`${warning.fileName ?? "warning"}-${warning.message}`}>
                  {warning.fileName ? `${warning.fileName}：` : ""}{warning.message}
                </p>
              ))}
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <button className="rounded-[1rem] border-2 border-stone-700/60 bg-white px-4 py-2 text-sm font-black text-stone-900" onClick={onClose} type="button">
              取消
            </button>
            <button className="rounded-[1rem] border-2 border-stone-700/70 bg-[#f8cfd5] px-4 py-2 text-sm font-black text-stone-900 shadow-[0_4px_0_rgba(112,84,84,0.12)] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? "导入中..." : "开始导入"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DataSourceBadge({ source }: { source?: PlaylistDataSource }) {
  if (process.env.NODE_ENV === "production" || !source) {
    return null;
  }

  const label = source === "supabase" ? "数据源：Supabase" : "数据源：本地 fallback";

  return (
    <span className="fixed right-4 top-4 z-30 rounded-full border-2 border-stone-700/70 bg-white/85 px-3 py-1 text-xs font-black text-[#4f2525] shadow-[0_4px_0_rgba(112,84,84,0.12)] backdrop-blur">
      {label}
    </span>
  );
}

function BottomPlayerBar({ isLyricsOpen, onToggleLyrics, player }: { isLyricsOpen: boolean; onToggleLyrics: () => void; player: PlaylistPlayerControls }) {
  const handleSeekChange = (event: ChangeEvent<HTMLInputElement>) => {
    player.seekToPercent(Number(event.currentTarget.value));
  };
  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    player.setVolumePercent(Number(event.currentTarget.value));
  };
  const playbackModeConfig = {
    order: { icon: Repeat, label: "顺序播放", nextLabel: "切换到随机播放" },
    shuffle: { icon: Shuffle, label: "随机播放", nextLabel: "切换到单曲循环" },
    "repeat-one": { icon: Repeat1, label: "单曲循环", nextLabel: "切换到顺序播放" },
  }[player.playbackMode];
  const PlaybackModeIcon = playbackModeConfig.icon;

  return (
    <section aria-label="当前播放栏" className="sticky bottom-3 z-20 mt-5 rounded-[1.5rem] border-[2.5px] border-stone-700/80 bg-[#ffe6ad]/95 p-3 shadow-[0_16px_32px_rgba(112,84,84,0.2)] backdrop-blur">
      <div className="grid gap-3 lg:grid-cols-[minmax(13rem,18rem)_minmax(0,1fr)_12rem] lg:items-center">
        <div className="flex items-center gap-3">
          <SongArtwork song={player.currentSong} />
          <div className="min-w-0">
            <h2 className="truncate text-base font-black text-[#4f2525]">{player.currentSong.title}</h2>
            <p className="truncate text-sm font-semibold text-stone-700">{player.currentSong.artist}</p>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-center gap-4 text-[#4f2525]">
            <button aria-label={playbackModeConfig.nextLabel} className="rounded-full bg-white/60 p-1 text-[#a54454] transition hover:bg-white/80" onClick={player.togglePlaybackMode} title={playbackModeConfig.label} type="button">
              <PlaybackModeIcon aria-hidden="true" className="h-4 w-4" />
            </button>
            <button aria-label="上一首" className="rounded-full p-1 transition hover:bg-white/50" onClick={player.playPrevious} type="button">
              <SkipBack aria-hidden="true" className="h-4 w-4 fill-[#4f2525]" />
            </button>
            <button aria-label={`${player.isPlaying ? "暂停" : "播放"}${player.currentSong.title}`} className="grid h-10 w-10 place-items-center rounded-full border-2 border-stone-700/75 bg-[#f5a0aa] shadow-[0_4px_0_rgba(112,84,84,0.15)]" onClick={player.togglePlay} type="button">
              {player.isPlaying ? <Pause aria-hidden="true" className="h-5 w-5 fill-[#4f2525] text-[#4f2525]" /> : <Play aria-hidden="true" className="h-5 w-5 fill-[#4f2525] text-[#4f2525]" />}
            </button>
            <button aria-label="下一首" className="rounded-full p-1 transition hover:bg-white/50" onClick={player.playNext} type="button">
              <SkipForward aria-hidden="true" className="h-4 w-4 fill-[#4f2525]" />
            </button>
            <button aria-label="喜欢当前歌曲" className="rounded-full p-1 transition hover:bg-white/50" type="button">
              <Heart aria-hidden="true" className="h-4 w-4" />
            </button>
            <button aria-label={isLyricsOpen ? "关闭歌词" : "打开歌词"} aria-pressed={isLyricsOpen} className={`grid h-7 w-7 place-items-center rounded-full border border-transparent text-sm font-black transition hover:bg-white/50 ${isLyricsOpen ? "border-[#a54454] bg-white/65 text-[#a54454]" : ""}`} onClick={onToggleLyrics} type="button">
              词
            </button>
          </div>
          <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 text-xs font-black text-[#5a332f]">
            <span>{player.currentTimeLabel}</span>
            <div className="relative h-2 rounded-full border border-stone-700/50 bg-white/80">
              <div className="h-full rounded-full bg-[#f5a0aa]" style={{ width: `${player.progressPercent}%` }} />
              <input aria-label="播放进度" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" max="100" min="0" onChange={handleSeekChange} type="range" value={Math.round(player.progressPercent)} />
            </div>
            <span className="text-right">{player.durationLabel}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <span className="max-w-32 truncate rounded-full bg-white/55 px-3 py-1 text-xs font-black text-[#7a3d3f]">{player.statusLabel}</span>
          <div className="flex items-center gap-2 text-[#4f2525]">
            <Volume2 aria-hidden="true" className="h-5 w-5" />
            <div className="relative h-2 w-20 rounded-full border border-stone-700/40 bg-white/80">
              <div className="h-full rounded-full bg-[#c8868d]" style={{ width: `${player.volumePercent}%` }} />
              <input aria-label="播放器音量" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" max="100" min="0" onChange={handleVolumeChange} type="range" value={Math.round(player.volumePercent)} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PlaylistsPageView({ collections, dataSource, featuredSongId, notes, playerSnapshot, songs }: PlaylistsPageViewProps) {
  const [displayCollections, setDisplayCollections] = useState(collections);
  const [displayNotes, setDisplayNotes] = useState(notes);
  const initialCollection = displayCollections.find((collection) => collection.songIds.includes(featuredSongId)) ?? displayCollections[0];
  const [activeCollectionId, setActiveCollectionId] = useState(initialCollection.id);
  const [isCreateCollectionDialogOpen, setIsCreateCollectionDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<PlaylistCollection | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const activeCollection = displayCollections.find((collection) => collection.id === activeCollectionId) ?? initialCollection;
  const visibleSongs = songs.filter((song) => activeCollection.songIds.includes(song.id));
  const activeFeaturedSong = visibleSongs.find((song) => song.id === featuredSongId) ?? visibleSongs[0] ?? getFeaturedSong(songs, featuredSongId);
  const player = usePlaylistPlayer(visibleSongs.length > 0 ? visibleSongs : songs, activeFeaturedSong.id, playerSnapshot);
  const isManagementUnlocked = dataSource === "supabase" && isAdminUnlocked;

  useEffect(() => {
    let isMounted = true;

    const loadAdminSession = async () => {
      try {
        const response = await fetch("/api/admin/session", { credentials: "same-origin" });
        const data = (await response.json()) as AdminSessionResult;

        if (isMounted) {
          setIsAdminUnlocked(Boolean(response.ok && data.authenticated));
        }
      } catch {
        if (isMounted) {
          setIsAdminUnlocked(false);
        }
      }
    };

    void loadAdminSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAdminUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminError(null);

    if (dataSource !== "supabase") {
      setAdminError("当前为本地 fallback，管理功能需要 Supabase 数据源。");
      return;
    }

    if (!adminToken.trim()) {
      setAdminError("请输入管理 Token");
      return;
    }

    setIsAdminSubmitting(true);

    try {
      const response = await fetch("/api/admin/session", {
        body: JSON.stringify({ token: adminToken }),
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = (await response.json()) as AdminSessionResult;

      if (!response.ok || !data.authenticated) {
        throw new Error(data.error ?? "管理解锁失败");
      }

      setIsAdminUnlocked(true);
      setAdminToken("");
    } catch (error) {
      setIsAdminUnlocked(false);
      setAdminError(error instanceof Error ? error.message : "管理解锁失败");
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const handleAdminLock = async () => {
    setAdminError(null);
    setIsAdminSubmitting(true);

    try {
      await fetch("/api/admin/session", { credentials: "same-origin", method: "DELETE" });
      setIsAdminUnlocked(false);
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "退出管理模式失败");
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const handleCreatedCollection = (collection: PlaylistCollection) => {
    setDisplayCollections((currentCollections) => [...currentCollections, collection]);
    setActiveCollectionId(collection.id);
    setIsCreateCollectionDialogOpen(false);
  };

  const handleUpdatedCollection = (collection: PlaylistCollection) => {
    setDisplayCollections((currentCollections) => currentCollections.map((currentCollection) => (currentCollection.id === collection.id ? { ...collection, songIds: currentCollection.songIds } : currentCollection)));
    setEditingCollection(null);
  };

  const handleDeleteCollection = async (collection: PlaylistCollection) => {
    if (displayCollections.length <= 1) {
      setAdminError("至少保留一个歌单");
      return;
    }

    if (!window.confirm(`确定删除「${collection.title}」吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/playlists/collections/${encodeURIComponent(collection.id)}`, {
        credentials: "same-origin",
        method: "DELETE",
      });
      const data = (await response.json()) as PlaylistCollectionManageResult;

      if (!response.ok) {
        throw new Error(data.error ?? "删除歌单失败");
      }

      setDisplayCollections((currentCollections) => {
        const nextCollections = currentCollections.filter((currentCollection) => currentCollection.id !== collection.id);

        if (activeCollectionId === collection.id) {
          setActiveCollectionId(nextCollections[0]?.id ?? collection.id);
        }

        return nextCollections;
      });
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "删除歌单失败");
    }
  };

  const handleSelectCollection = (collectionId: string) => {
    const nextCollection = displayCollections.find((collection) => collection.id === collectionId);

    if (!nextCollection) {
      return;
    }

    const nextSongs = songs.filter((song) => nextCollection.songIds.includes(song.id));
    const nextSong = nextSongs[0];

    setActiveCollectionId(nextCollection.id);

    if (nextSong) {
      player.selectSong(nextSong.id);
    }
  };

  return (
    <main className="album-page-scrollbar h-dvh overflow-y-auto bg-[#f7f1e8] text-stone-900">
      <DataSourceBadge source={dataSource} />
      {isCreateCollectionDialogOpen ? <PlaylistCreateCollectionDialog onClose={() => setIsCreateCollectionDialogOpen(false)} onCreated={handleCreatedCollection} /> : null}
      {editingCollection ? <PlaylistEditCollectionDialog collection={editingCollection} onClose={() => setEditingCollection(null)} onUpdated={handleUpdatedCollection} /> : null}
      {isImportDialogOpen ? <PlaylistBatchImportDialog activeCollectionId={activeCollection.id} collections={displayCollections} onClose={() => setIsImportDialogOpen(false)} /> : null}
      <PlaylistHeader />
      <div className="mx-auto max-w-[1480px] px-4 pb-6 pt-4 sm:px-6">
        <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)_21rem]">
          <PlaylistSidebar
            activeCollectionId={activeCollection.id}
            adminPanel={<PlaylistAdminPanel adminError={adminError} adminToken={adminToken} dataSource={dataSource} isAdminSubmitting={isAdminSubmitting} isAdminUnlocked={isAdminUnlocked} onAdminTokenChange={setAdminToken} onLock={() => void handleAdminLock()} onUnlock={handleAdminUnlock} />}
            collections={displayCollections}
            createDisabled={!isManagementUnlocked}
            importDisabled={!isManagementUnlocked}
            isAdminUnlocked={isManagementUnlocked}
            onDeleteCollection={(collection) => void handleDeleteCollection(collection)}
            onEditCollection={setEditingCollection}
            onOpenCreate={() => setIsCreateCollectionDialogOpen(true)}
            onOpenImport={() => setIsImportDialogOpen(true)}
            onSelectCollection={handleSelectCollection}
          />
          <div className="min-w-0 space-y-5">
            <HeroPanel collection={activeCollection} featuredSong={player.currentSong} isPlaying={player.isPlaying} onPlayAll={player.togglePlay} songs={visibleSongs} />
            <SongTable currentSongId={player.currentSongId} durationLabels={player.songDurationLabels} isPlaying={player.isPlaying} onPlaySong={player.playSong} onTogglePlay={player.togglePlay} songs={visibleSongs} />
          </div>
          {isLyricsOpen ? <LyricsPanel currentTimeSeconds={player.currentTimeSeconds} song={player.currentSong} /> : <CommentPlayerPanel dataSource={dataSource} featuredSong={player.currentSong} isAdminUnlocked={isManagementUnlocked} notes={displayNotes} onCreatedNote={(note) => setDisplayNotes((currentNotes) => [...currentNotes, note])} onDeletedNote={(noteId) => setDisplayNotes((currentNotes) => currentNotes.filter((note) => note.id !== noteId))} onUpdatedNote={(updatedNote) => setDisplayNotes((currentNotes) => currentNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note)))} />}
        </div>
        <BottomPlayerBar isLyricsOpen={isLyricsOpen} onToggleLyrics={() => setIsLyricsOpen((open) => !open)} player={player} />
      </div>
      <audio
        ref={player.audioRef}
        onEnded={player.handleEnded}
        onLoadedMetadata={player.handleLoadedMetadata}
        onPause={player.handlePause}
        onPlay={player.handlePlay}
        onTimeUpdate={player.handleTimeUpdate}
        preload="metadata"
      />
      <SongDurationPreloader durationLabels={player.songDurationLabels} onDurationLoaded={player.handleSongDurationLoaded} songs={visibleSongs} />
    </main>
  );
}
