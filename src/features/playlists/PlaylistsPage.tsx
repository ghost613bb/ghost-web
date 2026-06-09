"use client";

import { useCallback, useMemo, useRef, useState, type ChangeEvent, type RefObject } from "react";
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
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import type { PlaylistCollection, PlaylistNote, PlaylistPlayerSnapshot, PlaylistSong } from "@/data/playlists";

type PlaylistsPageViewProps = {
  collections: PlaylistCollection[];
  featuredSongId: string;
  notes: PlaylistNote[];
  playerSnapshot: PlaylistPlayerSnapshot;
  songs: PlaylistSong[];
};

type PlaylistPlayerControls = {
  audioRef: RefObject<HTMLAudioElement | null>;
  currentSong: PlaylistSong;
  currentSongId: string;
  currentTimeLabel: string;
  durationLabel: string;
  handleEnded: () => void;
  handleLoadedMetadata: () => void;
  handlePause: () => void;
  handlePlay: () => void;
  handleTimeUpdate: () => void;
  isPlaying: boolean;
  playNext: () => void;
  playPrevious: () => void;
  playSong: (songId: string) => void;
  progressPercent: number;
  selectSong: (songId: string) => void;
  seekToPercent: (percent: number) => void;
  setVolumePercent: (percent: number) => void;
  shuffleEnabled: boolean;
  statusLabel: string;
  togglePlay: () => void;
  toggleShuffle: () => void;
  volumePercent: number;
};

const songDurations = ["3:43", "3:46", "3:19", "3:08", "3:43", "3:42"];
const tableHeaderClass = "px-3 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-[#5a332f]";
const topActionClass =
  "inline-flex items-center rounded-[1rem] border-2 border-stone-700/80 bg-[#f8cfd5] px-3.5 py-1 text-sm font-black text-stone-900 transition hover:-translate-y-0.5 hover:bg-[#fbe0e4] sm:px-4 sm:py-1.5";

function getSongDuration(index: number) {
  return songDurations[index % songDurations.length];
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

function usePlaylistPlayer(songs: PlaylistSong[], featuredSongId: string, playerSnapshot: PlaylistPlayerSnapshot): PlaylistPlayerControls {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSongId, setCurrentSongId] = useState(() => getFeaturedSong(songs, featuredSongId).id);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
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
      if (shuffleEnabled && direction === 1 && songs.length > 1) {
        const candidates = songs.filter((song) => song.id !== currentSong.id);
        return candidates[Math.floor(Math.random() * candidates.length)] ?? currentSong;
      }

      const nextIndex = (currentSongIndex + direction + songs.length) % songs.length;

      return songs[nextIndex] ?? currentSong;
    },
    [currentSong, currentSongIndex, shuffleEnabled, songs],
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

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    setDurationSeconds(Number.isFinite(audio.duration) ? audio.duration : 0);
    audio.volume = volumePercent / 100;
  }, [volumePercent]);

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
  const durationLabel = durationSeconds > 0 ? formatTime(durationSeconds) : getSongDuration(currentSongIndex);
  const statusLabel = playbackError ?? (isPlaying ? `正在播放 ${currentSong.title}` : playerSnapshot.statusLabel);

  return {
    audioRef,
    currentSong,
    currentSongId: currentSong.id,
    currentTimeLabel: formatTime(currentTimeSeconds),
    durationLabel,
    handleEnded,
    handleLoadedMetadata,
    handlePause,
    handlePlay,
    handleTimeUpdate,
    isPlaying,
    playNext,
    playPrevious,
    playSong,
    progressPercent,
    selectSong,
    seekToPercent,
    setVolumePercent,
    shuffleEnabled,
    statusLabel,
    togglePlay,
    toggleShuffle: () => setShuffleEnabled((enabled) => !enabled),
    volumePercent,
  };
}

function PlaylistCover() {
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

function PlaylistSidebar({ activeCollectionId, collections, onSelectCollection }: Pick<PlaylistsPageViewProps, "collections"> & { activeCollectionId: string; onSelectCollection: (collectionId: string) => void }) {
  return (
    <aside aria-label="歌单列表" className="rounded-[1.7rem] border-[2.5px] border-stone-700/80 bg-[#fff7df] p-4 shadow-[0_14px_28px_rgba(112,84,84,0.09)] xl:sticky xl:top-5 xl:self-start">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[1.35rem] font-black uppercase tracking-tight text-[#4f2525]">My Collections</h2>
        <Sparkles aria-hidden="true" className="h-5 w-5 text-[#a54454]" />
      </div>
      <button className="mb-4 flex w-full items-center justify-center gap-2 rounded-[1.15rem] border-[2.5px] border-stone-700/80 bg-[#ffe6ad] px-4 py-2 text-sm font-black text-stone-900 shadow-[0_5px_0_rgba(112,84,84,0.16)] transition hover:-translate-y-0.5" type="button">
        <Plus aria-hidden="true" className="h-4 w-4" />
        New Collection
      </button>
      <div className="flex snap-x gap-3 overflow-x-auto pb-1 xl:block xl:space-y-3 xl:overflow-visible xl:pb-0">
        {collections.map((collection) => {
          const isActive = collection.id === activeCollectionId;

          return (
            <button
              aria-pressed={isActive}
              className={`flex h-[9rem] min-w-[14rem] snap-start flex-col justify-between rounded-[1.2rem] border-[2.5px] border-stone-700/75 p-3 text-left shadow-[0_6px_0_rgba(112,84,84,0.11)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(112,84,84,0.13)] xl:w-full xl:min-w-0 ${collection.accentClass} ${isActive ? "outline outline-2 outline-offset-2 outline-[#c65f70]" : ""}`}
              key={collection.id}
              onClick={() => onSelectCollection(collection.id)}
              type="button"
            >
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
              <p className="mt-3 inline-flex rounded-full border border-stone-700/30 bg-white/55 px-2.5 py-1 text-[0.68rem] font-black text-[#6d3b39]">
                {collection.songIds.length} songs
              </p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function HeroPanel({ collection, featuredSong, isPlaying, onPlayAll, songs }: { collection: PlaylistCollection; featuredSong: PlaylistSong; isPlaying: boolean; onPlayAll: () => void; songs: PlaylistSong[] }) {
  return (
    <section className="grid gap-4 rounded-[1.8rem] border-[2.5px] border-stone-700/80 bg-[#fffaf3] p-4 shadow-[0_14px_28px_rgba(112,84,84,0.08)] md:grid-cols-[13rem_minmax(0,1fr)] md:p-5" aria-label="歌单概览">
      <PlaylistCover />
      <div className="flex min-w-0 flex-col justify-center">
        <p className="mb-2 inline-flex w-fit rounded-full border border-[#e4b7b9] bg-[#fff0c4] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#7a3d3f]">
          Playlist detail · {songs.length * 2 + 2} minutes
        </p>
        <h2 className="text-[2.45rem] font-black leading-none tracking-tight text-[#4f2525] sm:text-[3.35rem]">{collection.title}</h2>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-stone-700 sm:text-base">{featuredSong.feeling}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button aria-label={`${isPlaying ? "暂停" : "播放"}${featuredSong.title}`} className="inline-flex items-center gap-2 rounded-[1.2rem] border-[2.5px] border-stone-700/80 bg-[#ffe6a7] px-5 py-2 text-base font-black text-stone-900 shadow-[0_5px_0_rgba(112,84,84,0.15)] transition hover:-translate-y-0.5" onClick={onPlayAll} type="button">
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

function SongTable({ currentSongId, isPlaying, onPlaySong, onTogglePlay, songs }: Pick<PlaylistsPageViewProps, "songs"> & { currentSongId: string; isPlaying: boolean; onPlaySong: (songId: string) => void; onTogglePlay: () => void }) {
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

      <div className="hidden overflow-hidden rounded-[1.2rem] border border-[#eed8c6] bg-[repeating-linear-gradient(180deg,#fffaf3_0,#fffaf3_42px,#fff3e8_43px,#fff3e8_44px)] md:block">
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
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {(song.tags ?? []).map((tag) => (
                        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[0.68rem] font-black text-[#8d4b55]" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top font-semibold text-stone-700">{song.artist}</td>
                  <td className="max-w-[17rem] px-3 py-3 align-top text-xs font-semibold leading-5 text-stone-700">{song.description}</td>
                  <td className="px-3 py-3 text-right align-top font-black text-[#5a332f]">{getSongDuration(index)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
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
                  {getSongDuration(index)}
                </button>
              </div>
              <p className="mt-2 text-sm font-semibold leading-6 text-stone-700">{song.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(song.tags ?? []).map((tag) => (
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-[0.68rem] font-black text-[#8d4b55]" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function LyricsPanel({ song }: { song: PlaylistSong }) {
  const lyrics = song.lyrics?.length ? song.lyrics : [song.feeling];

  return (
    <aside aria-label="歌词播放器" className="xl:sticky xl:top-5 xl:self-start">
      <section className="lyrics-panel-enter min-h-[40rem] overflow-hidden rounded-[1.7rem] border-[2.5px] border-stone-700/80 bg-[#fff4d8] p-4 shadow-[0_14px_28px_rgba(112,84,84,0.09)]">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#aa6a70] bg-[#fbd4d9] text-lg font-black text-[#7a3d3f]">
            词
          </span>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#4f2525]">Lyrics Room</h2>
            <p className="text-xs font-bold text-stone-600">{song.title}</p>
          </div>
        </div>

        <div className="flex min-h-[32rem] flex-col items-center rounded-[1.45rem] border-2 border-stone-700/70 bg-[#fffaf3] px-4 py-8 shadow-[inset_0_-18px_0_rgba(255,230,173,0.38)]">
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

          <div className="mt-5 w-full space-y-3 text-center">
            {lyrics.map((line, index) => (
              <p className={`lyrics-line rounded-full px-3 py-1.5 font-black ${index === 1 ? "bg-[#f9d7db] text-base text-[#4f2525]" : "text-sm text-stone-500"}`} key={`${song.id}-${line}-${index}`} style={{ animationDelay: `${index * 90 + 120}ms` }}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>
    </aside>
  );
}

function CommentPlayerPanel({ featuredSong, notes }: { featuredSong: PlaylistSong; notes: PlaylistNote[] }) {
  const visibleNotes = notes.filter((note) => note.songId === featuredSong.id);

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
        <label className="sr-only" htmlFor="playlist-comment">
          添加可爱评论
        </label>
        <textarea className="h-20 w-full resize-none rounded-[1.2rem] border-2 border-stone-700/60 bg-white/70 p-3 text-sm font-semibold text-stone-800 placeholder:text-stone-500" id="playlist-comment" placeholder="Add a cute comment..." readOnly />
        <div className="mt-3 flex justify-end">
          <button className="rounded-[1rem] border-2 border-stone-700/70 bg-[#ffe0a8] px-4 py-1.5 text-sm font-black shadow-[0_4px_0_rgba(112,84,84,0.12)]" type="button">
            Comment
          </button>
        </div>
      </section>

      <section className="rounded-[1.7rem] border-[2.5px] border-stone-700/80 bg-[#fffaf3] p-4 shadow-[0_14px_28px_rgba(112,84,84,0.09)]">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle aria-hidden="true" className="h-5 w-5 text-[#9b4d57]" />
          <h2 className="text-lg font-black text-[#4f2525]">耳机留言</h2>
        </div>
        <div className="space-y-3">
          {visibleNotes.map((note) => (
            <article className="relative rounded-[1rem] border border-[#efd7d3] bg-[#fff7f0] p-3 pl-11" key={note.id}>
              <span aria-hidden="true" className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-full border-2 border-[#c4878c] bg-[#fde2e7] text-sm">
                {note.avatar}
              </span>
              <p className="text-sm font-black text-[#4f2525]">
                {note.author} <span className="text-xs font-bold text-stone-500">{note.time}</span>
              </p>
              <p className="mt-1 text-sm font-semibold leading-5 text-stone-700">{note.content}</p>
              <div className="mt-1 flex gap-3 text-xs font-black text-[#7a3d3f]">
                <button className="underline underline-offset-2" type="button">
                  Edit
                </button>
                <button className="underline underline-offset-2" type="button">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </aside>
  );
}

function BottomPlayerBar({ isLyricsOpen, onToggleLyrics, player }: { isLyricsOpen: boolean; onToggleLyrics: () => void; player: PlaylistPlayerControls }) {
  const handleSeekChange = (event: ChangeEvent<HTMLInputElement>) => {
    player.seekToPercent(Number(event.currentTarget.value));
  };
  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    player.setVolumePercent(Number(event.currentTarget.value));
  };

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
            <button aria-label={player.shuffleEnabled ? "关闭随机播放" : "开启随机播放"} className={`rounded-full p-1 transition hover:bg-white/50 ${player.shuffleEnabled ? "bg-white/60 text-[#a54454]" : ""}`} onClick={player.toggleShuffle} type="button">
              <Shuffle aria-hidden="true" className="h-4 w-4" />
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

export function PlaylistsPageView({ collections, featuredSongId, notes, playerSnapshot, songs }: PlaylistsPageViewProps) {
  const initialCollection = collections.find((collection) => collection.songIds.includes(featuredSongId)) ?? collections[0];
  const [activeCollectionId, setActiveCollectionId] = useState(initialCollection.id);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const activeCollection = collections.find((collection) => collection.id === activeCollectionId) ?? initialCollection;
  const visibleSongs = songs.filter((song) => activeCollection.songIds.includes(song.id));
  const activeFeaturedSong = visibleSongs.find((song) => song.id === featuredSongId) ?? visibleSongs[0] ?? getFeaturedSong(songs, featuredSongId);
  const player = usePlaylistPlayer(visibleSongs.length > 0 ? visibleSongs : songs, activeFeaturedSong.id, playerSnapshot);

  const handleSelectCollection = (collectionId: string) => {
    const nextCollection = collections.find((collection) => collection.id === collectionId);

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
      <PlaylistHeader />
      <div className="mx-auto max-w-[1480px] px-4 pb-6 pt-4 sm:px-6">
        <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)_21rem]">
          <PlaylistSidebar activeCollectionId={activeCollection.id} collections={collections} onSelectCollection={handleSelectCollection} />
          <div className="min-w-0 space-y-5">
            <HeroPanel collection={activeCollection} featuredSong={player.currentSong} isPlaying={player.isPlaying} onPlayAll={player.togglePlay} songs={visibleSongs} />
            <SongTable currentSongId={player.currentSongId} isPlaying={player.isPlaying} onPlaySong={player.playSong} onTogglePlay={player.togglePlay} songs={visibleSongs} />
          </div>
          {isLyricsOpen ? <LyricsPanel song={player.currentSong} /> : <CommentPlayerPanel featuredSong={player.currentSong} notes={notes} />}
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
    </main>
  );
}
