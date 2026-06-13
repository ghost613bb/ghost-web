"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Disc3,
  Grid2X2,
  Heart,
  ListChecks,
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
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import type { PlaylistCollection, PlaylistNote, PlaylistPlayerSnapshot, PlaylistSong } from "@/data/playlists";
import { CommentPlayerPanel } from "./CommentPlayerPanel";
import { PlaylistBatchImportDialog } from "./PlaylistBatchImportDialog";
import { PlaylistCollectionDialog } from "./PlaylistCollectionDialog";
import { PlaylistDropdown } from "./PlaylistDropdown";
import type { PlaylistDataSource } from "./service";
import { getFeaturedSong, getSongDuration, SongDurationPreloader, usePlaylistPlayer, type PlaylistPlayerControls, type PlaylistMode, type SongDurationLabels } from "./usePlaylistPlayer";

type PlaylistsPageViewProps = {
  collections: PlaylistCollection[];
  dataSource?: PlaylistDataSource;
  featuredSongId: string;
  notes: PlaylistNote[];
  playerSnapshot: PlaylistPlayerSnapshot;
  songs: PlaylistSong[];
};

type PlaylistCollectionManageResult = {
  collection?: PlaylistCollection;
  error?: string;
  ok?: boolean;
};

type PlaylistSongManageResult = {
  error?: string;
  movedSongIds?: string[];
  ok?: boolean;
  removedSongIds?: string[];
  sourceCollectionId?: string;
  sourceSongIds?: string[];
  targetCollectionId?: string;
  targetSongIds?: string[];
};

type AdminSessionResult = {
  authenticated: boolean;
  error?: string;
};

const lyricSyncOffsetSeconds = 0.35;
const tableHeaderClass = "px-3 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-[#5a332f]";
const topActionClass =
  "inline-flex items-center rounded-[1rem] border-2 border-stone-700/80 bg-[#f8cfd5] px-3.5 py-1 text-sm font-black text-stone-900 transition hover:-translate-y-0.5 hover:bg-[#fbe0e4] sm:px-4 sm:py-1.5";

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

type SongTableProps = Pick<PlaylistsPageViewProps, "songs"> & {
  bulkError: string | null;
  canManageSongs: boolean;
  currentSongId: string;
  durationLabels: SongDurationLabels;
  isBulkSubmitting: boolean;
  isManageMode: boolean;
  isPlaying: boolean;
  movableCollections: PlaylistCollection[];
  onMoveSelected: () => void;
  onPlaySong: (songId: string) => void;
  onRemoveSelected: () => void;
  onTargetCollectionChange: (collectionId: string) => void;
  onToggleAllSongs: () => void;
  onToggleManageMode: () => void;
  onTogglePlay: () => void;
  onToggleSongSelection: (songId: string) => void;
  selectedSongIds: string[];
  targetCollectionId: string;
};

function SongTable({ bulkError, canManageSongs, currentSongId, durationLabels, isBulkSubmitting, isManageMode, isPlaying, movableCollections, onMoveSelected, onPlaySong, onRemoveSelected, onTargetCollectionChange, onToggleAllSongs, onToggleManageMode, onTogglePlay, onToggleSongSelection, selectedSongIds, targetCollectionId, songs }: SongTableProps) {
  const selectedSongIdSet = new Set(selectedSongIds);
  const selectedCount = selectedSongIds.length;
  const areAllSongsSelected = songs.length > 0 && songs.every((song) => selectedSongIdSet.has(song.id));

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
        <div className="flex items-center gap-2">
          {canManageSongs ? (
            <button aria-label={isManageMode ? "退出批量管理歌曲" : "批量管理歌曲"} aria-pressed={isManageMode} className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#edc2c6] text-[#7a3d3f] transition hover:-translate-y-0.5 ${isManageMode ? "bg-[#f8cfd5] shadow-[0_4px_0_rgba(112,84,84,0.12)]" : "bg-white/75 hover:bg-[#ffeef1]"}`} onClick={onToggleManageMode} type="button">
              <ListChecks aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : null}
          <span className="inline-flex items-center gap-1 rounded-full border border-[#edc2c6] bg-[#ffeef1] px-3 py-1 text-xs font-black text-[#7a3d3f]">
            <ListMusic aria-hidden="true" className="h-4 w-4" />
            {songs.length} 首
          </span>
        </div>
      </div>

      {isManageMode ? (
        <div className="mb-3 rounded-[1.1rem] border border-[#edc2c6] bg-white/70 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-black text-[#7a3d3f]">已选 {selectedCount} 首</p>
            <div className="flex flex-wrap items-center gap-2">
              <PlaylistDropdown disabled={isBulkSubmitting || movableCollections.length === 0} label="移动到" onChange={onTargetCollectionChange} options={movableCollections.map((collection) => ({ label: collection.title, value: collection.id }))} placeholder="暂无其他歌单" value={targetCollectionId} variant="compact" />
              <button className="rounded-full border-2 border-stone-700/70 bg-[#ffe6ad] px-4 py-1.5 text-sm font-black text-stone-900 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0" disabled={selectedCount === 0 || movableCollections.length === 0 || isBulkSubmitting} onClick={onMoveSelected} type="button">
                移动
              </button>
              <button aria-label="从当前歌单移除选中歌曲" className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#a54454] bg-[#ffeef1] text-[#9b4d57] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0" disabled={selectedCount === 0 || isBulkSubmitting} onClick={onRemoveSelected} type="button">
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
          {bulkError ? <p className="mt-2 rounded-[0.9rem] border border-[#b75d66] bg-[#ffeef1] px-3 py-2 text-sm font-bold text-[#8d3f49]">{bulkError}</p> : null}
        </div>
      ) : null}

      {songs.length === 0 ? (
        <div className="rounded-[1.2rem] border border-[#eed8c6] bg-white/65 p-6 text-center text-sm font-black text-[#7a3d3f]">
          这个歌单还没有歌曲。点击左侧“批量导入歌曲”添加 MP3 和 LRC。
        </div>
      ) : null}

      <div className={`${songs.length === 0 ? "hidden" : "hidden md:block"} overflow-hidden rounded-[1.2rem] border border-[#eed8c6] bg-[repeating-linear-gradient(180deg,#fffaf3_0,#fffaf3_42px,#fff3e8_43px,#fff3e8_44px)]`}>
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[#f8edd1]/90">
            <tr>
              {isManageMode ? (
                <th className={`${tableHeaderClass} w-12`}>
                  <input aria-label={areAllSongsSelected ? "清空当前歌单全部歌曲" : "选择当前歌单全部歌曲"} checked={areAllSongsSelected} className="h-4 w-4 accent-[#a54454]" disabled={isBulkSubmitting} onChange={onToggleAllSongs} type="checkbox" />
                </th>
              ) : null}
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
              const isSelected = selectedSongIdSet.has(song.id);
              const songButtonLabel = `${isCurrent && isPlaying ? "暂停" : "播放"}${song.title}`;

              return (
                <tr className={isCurrent ? "bg-[#f9d7db]" : "transition hover:bg-[#fff1f3]"} key={song.id}>
                  {isManageMode ? (
                    <td className="px-3 py-3 align-top">
                      <input aria-label={`选择${song.title}`} checked={isSelected} className="h-4 w-4 accent-[#a54454]" disabled={isBulkSubmitting} onChange={() => onToggleSongSelection(song.id)} type="checkbox" />
                    </td>
                  ) : null}
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
          const isSelected = selectedSongIdSet.has(song.id);
          const songButtonLabel = `${isCurrent && isPlaying ? "暂停" : "播放"}${song.title}`;

          return (
            <article className={`rounded-[1.2rem] border-2 border-stone-700/50 p-3 ${isCurrent ? "bg-[#f9d7db]" : "bg-white/70"}`} key={song.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  {isManageMode ? <input aria-label={`选择${song.title}`} checked={isSelected} className="mt-1 h-4 w-4 accent-[#a54454]" disabled={isBulkSubmitting} onChange={() => onToggleSongSelection(song.id)} type="checkbox" /> : null}
                  <div>
                    <p className="text-xs font-black text-[#8d4b55]">{String(index + 1).padStart(2, "0")}</p>
                    <h3 className="text-lg font-black text-stone-900">{song.title}</h3>
                    <p className="text-sm font-semibold text-stone-700">{song.artist}</p>
                  </div>
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
  const [isSongManageMode, setIsSongManageMode] = useState(false);
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [bulkTargetCollectionId, setBulkTargetCollectionId] = useState(() => displayCollections.find((collection) => collection.id !== initialCollection.id)?.id ?? "");
  const [bulkSongError, setBulkSongError] = useState<string | null>(null);
  const [isBulkSongSubmitting, setIsBulkSongSubmitting] = useState(false);
  const activeCollection = displayCollections.find((collection) => collection.id === activeCollectionId) ?? initialCollection;
  const visibleSongs = songs.filter((song) => activeCollection.songIds.includes(song.id));
  const activeFeaturedSong = visibleSongs.find((song) => song.id === featuredSongId) ?? visibleSongs[0] ?? getFeaturedSong(songs, featuredSongId);
  const player = usePlaylistPlayer(visibleSongs.length > 0 ? visibleSongs : songs, activeFeaturedSong.id, playerSnapshot);
  const isManagementUnlocked = dataSource === "supabase" && isAdminUnlocked;
  const movableCollections = useMemo(() => displayCollections.filter((collection) => collection.id !== activeCollection.id), [activeCollection.id, displayCollections]);

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

  useEffect(() => {
    setIsSongManageMode(false);
    setSelectedSongIds([]);
    setBulkSongError(null);
  }, [activeCollectionId]);

  useEffect(() => {
    if (!isManagementUnlocked) {
      setIsSongManageMode(false);
      setSelectedSongIds([]);
      setBulkSongError(null);
    }
  }, [isManagementUnlocked]);

  useEffect(() => {
    const nextTargetCollectionId = movableCollections[0]?.id ?? "";
    const isTargetAvailable = movableCollections.some((collection) => collection.id === bulkTargetCollectionId);

    if (!isTargetAvailable) {
      setBulkTargetCollectionId(nextTargetCollectionId);
    }
  }, [bulkTargetCollectionId, movableCollections]);

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

  const getOrderedSelectedSongIds = () => visibleSongs.filter((song) => selectedSongIds.includes(song.id)).map((song) => song.id);

  const syncPlayerAfterRemovingSongs = (sourceSongIds: string[], removedSongIds: string[]) => {
    if (!removedSongIds.includes(player.currentSongId)) {
      return;
    }

    const nextSongId = sourceSongIds[0] ?? songs[0]?.id;

    if (nextSongId) {
      player.selectSong(nextSongId);
    }
  };

  const handleToggleSongManageMode = () => {
    if (!isManagementUnlocked) {
      setAdminError(dataSource !== "supabase" ? "当前为本地 fallback，管理功能需要 Supabase 数据源。" : "请先解锁 Admin 管理模式。");
      return;
    }

    setBulkSongError(null);
    setIsSongManageMode((isCurrentManageMode) => {
      if (isCurrentManageMode) {
        setSelectedSongIds([]);
      }

      return !isCurrentManageMode;
    });
  };

  const handleToggleSongSelection = (songId: string) => {
    setBulkSongError(null);
    setSelectedSongIds((currentSongIds) => (currentSongIds.includes(songId) ? currentSongIds.filter((currentSongId) => currentSongId !== songId) : [...currentSongIds, songId]));
  };

  const handleToggleAllSongs = () => {
    setBulkSongError(null);
    setSelectedSongIds((currentSongIds) => {
      const visibleSongIds = visibleSongs.map((song) => song.id);
      const currentSongIdSet = new Set(currentSongIds);
      const areAllVisibleSongsSelected = visibleSongIds.length > 0 && visibleSongIds.every((songId) => currentSongIdSet.has(songId));

      return areAllVisibleSongsSelected ? [] : visibleSongIds;
    });
  };

  const handleRemoveSelectedSongs = async () => {
    setBulkSongError(null);

    if (!isManagementUnlocked) {
      setBulkSongError("请先解锁 Admin 管理模式。");
      return;
    }

    const orderedSelectedSongIds = getOrderedSelectedSongIds();

    if (orderedSelectedSongIds.length === 0) {
      setBulkSongError("请选择要移除的歌曲");
      return;
    }

    if (!window.confirm(`确定从「${activeCollection.title}」移除选中的 ${orderedSelectedSongIds.length} 首歌吗？不会删除歌曲本体。`)) {
      return;
    }

    setIsBulkSongSubmitting(true);

    try {
      const response = await fetch(`/api/playlists/collections/${encodeURIComponent(activeCollection.id)}/songs`, {
        body: JSON.stringify({
          action: "remove",
          songIds: orderedSelectedSongIds,
        }),
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });
      const data = (await response.json()) as PlaylistSongManageResult;

      if (!response.ok) {
        throw new Error(data.error ?? "批量移除歌曲失败");
      }

      const sourceSongIds = data.sourceSongIds ?? activeCollection.songIds.filter((songId) => !orderedSelectedSongIds.includes(songId));
      const removedSongIds = data.removedSongIds ?? orderedSelectedSongIds;

      setDisplayCollections((currentCollections) => currentCollections.map((collection) => (collection.id === activeCollection.id ? { ...collection, songIds: sourceSongIds } : collection)));
      setSelectedSongIds([]);
      syncPlayerAfterRemovingSongs(sourceSongIds, removedSongIds);
    } catch (error) {
      setBulkSongError(error instanceof Error ? error.message : "批量移除歌曲失败");
    } finally {
      setIsBulkSongSubmitting(false);
    }
  };

  const handleMoveSelectedSongs = async () => {
    setBulkSongError(null);

    if (!isManagementUnlocked) {
      setBulkSongError("请先解锁 Admin 管理模式。");
      return;
    }

    const orderedSelectedSongIds = getOrderedSelectedSongIds();

    if (orderedSelectedSongIds.length === 0) {
      setBulkSongError("请选择要移动的歌曲");
      return;
    }

    if (!bulkTargetCollectionId) {
      setBulkSongError("请选择目标歌单");
      return;
    }

    setIsBulkSongSubmitting(true);

    try {
      const response = await fetch(`/api/playlists/collections/${encodeURIComponent(activeCollection.id)}/songs`, {
        body: JSON.stringify({
          action: "move",
          songIds: orderedSelectedSongIds,
          targetCollectionId: bulkTargetCollectionId,
        }),
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });
      const data = (await response.json()) as PlaylistSongManageResult;

      if (!response.ok) {
        throw new Error(data.error ?? "批量移动歌曲失败");
      }

      const sourceCollectionId = data.sourceCollectionId ?? activeCollection.id;
      const targetCollectionId = data.targetCollectionId ?? bulkTargetCollectionId;
      const sourceSongIds = data.sourceSongIds ?? activeCollection.songIds.filter((songId) => !orderedSelectedSongIds.includes(songId));
      const targetSongIds = data.targetSongIds;
      const movedSongIds = data.movedSongIds ?? orderedSelectedSongIds;

      setDisplayCollections((currentCollections) =>
        currentCollections.map((collection) => {
          if (collection.id === sourceCollectionId) {
            return { ...collection, songIds: sourceSongIds };
          }

          if (collection.id === targetCollectionId && targetSongIds) {
            return { ...collection, songIds: targetSongIds };
          }

          return collection;
        }),
      );
      setSelectedSongIds([]);
      syncPlayerAfterRemovingSongs(sourceSongIds, movedSongIds);
    } catch (error) {
      setBulkSongError(error instanceof Error ? error.message : "批量移动歌曲失败");
    } finally {
      setIsBulkSongSubmitting(false);
    }
  };

  return (
    <main className="album-page-scrollbar h-dvh overflow-y-auto bg-[#f7f1e8] text-stone-900">
      <DataSourceBadge source={dataSource} />
      {isCreateCollectionDialogOpen ? <PlaylistCollectionDialog mode="create" onClose={() => setIsCreateCollectionDialogOpen(false)} onSaved={handleCreatedCollection} /> : null}
      {editingCollection ? <PlaylistCollectionDialog collection={editingCollection} mode="edit" onClose={() => setEditingCollection(null)} onSaved={handleUpdatedCollection} /> : null}
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
            <SongTable
              bulkError={bulkSongError}
              canManageSongs={isManagementUnlocked}
              currentSongId={player.currentSongId}
              durationLabels={player.songDurationLabels}
              isBulkSubmitting={isBulkSongSubmitting}
              isManageMode={isSongManageMode}
              isPlaying={player.isPlaying}
              movableCollections={movableCollections}
              onMoveSelected={() => void handleMoveSelectedSongs()}
              onPlaySong={player.playSong}
              onRemoveSelected={() => void handleRemoveSelectedSongs()}
              onTargetCollectionChange={setBulkTargetCollectionId}
              onToggleAllSongs={handleToggleAllSongs}
              onToggleManageMode={handleToggleSongManageMode}
              onTogglePlay={player.togglePlay}
              onToggleSongSelection={handleToggleSongSelection}
              selectedSongIds={selectedSongIds}
              songs={visibleSongs}
              targetCollectionId={bulkTargetCollectionId}
            />
          </div>
          {isLyricsOpen ? <LyricsPanel currentTimeSeconds={player.currentTimeSeconds} song={player.currentSong} /> : <CommentPlayerPanel dataSource={dataSource} featuredSong={player.currentSong} isAdminUnlocked={isManagementUnlocked} notes={displayNotes} onCreatedNote={(note) => setDisplayNotes((currentNotes) => [...currentNotes, note])} onDeletedNote={(noteId) => setDisplayNotes((currentNotes) => currentNotes.filter((note) => note.id !== noteId))} />}
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
