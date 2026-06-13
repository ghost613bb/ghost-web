"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { PlaylistPlayerSnapshot, PlaylistSong } from "@/data/playlists";

export type PlaylistMode = "order" | "shuffle" | "repeat-one";

export type SongDurationLabels = Record<string, string>;

export type PlaylistPlayerControls = {
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

function getDurationCacheKey(song: PlaylistSong) {
  return song.audioSrc ?? song.id;
}

export function getSongDuration(song: PlaylistSong, durationLabels: SongDurationLabels = {}) {
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

export function getFeaturedSong(songs: PlaylistSong[], featuredSongId: string) {
  return songs.find((song) => song.id === featuredSongId) ?? songs[0];
}

type SongDurationPreloaderProps = {
  durationLabels: SongDurationLabels;
  onDurationLoaded: (song: PlaylistSong, durationLabel: string) => void;
  songs: PlaylistSong[];
};

export function SongDurationPreloader({ durationLabels, onDurationLoaded, songs }: SongDurationPreloaderProps) {
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

export function usePlaylistPlayer(songs: PlaylistSong[], featuredSongId: string, playerSnapshot: PlaylistPlayerSnapshot): PlaylistPlayerControls {
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
