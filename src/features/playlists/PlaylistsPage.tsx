import Link from "next/link";
import {
  ChevronDown,
  Disc3,
  Heart,
  ListMusic,
  MessageCircle,
  Music2,
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

const songDurations = ["3:43", "3:46", "3:19", "3:08", "3:43", "3:42"];
const tableHeaderClass = "px-3 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-[#5a332f]";
const topActionClass =
  "inline-flex items-center rounded-[1rem] border-2 border-stone-700/80 bg-[#f8cfd5] px-3.5 py-1 text-sm font-black text-stone-900 transition hover:-translate-y-0.5 hover:bg-[#fbe0e4] sm:px-4 sm:py-1.5";

function getSongDuration(index: number) {
  return songDurations[index % songDurations.length];
}

function getFeaturedSong(songs: PlaylistSong[], featuredSongId: string) {
  return songs.find((song) => song.id === featuredSongId) ?? songs[0];
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

function PlaylistSidebar({ collections, featuredSongId }: Pick<PlaylistsPageViewProps, "collections" | "featuredSongId">) {
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
        {collections.map((collection, index) => {
          const isActive = collection.songIds.includes(featuredSongId);

          return (
            <article
              className={`min-w-[14rem] snap-start rounded-[1.2rem] border-[2.5px] border-stone-700/75 p-3 shadow-[0_6px_0_rgba(112,84,84,0.11)] xl:min-w-0 ${collection.accentClass} ${isActive && index === 0 ? "outline outline-2 outline-offset-2 outline-[#c65f70]" : ""}`}
              key={collection.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-base font-black text-stone-900">
                    <span aria-hidden="true">{collection.emoji}</span>
                    <h3>{collection.title}</h3>
                  </div>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-stone-700">{collection.description}</p>
                </div>
                {index === 0 ? <X aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /> : <ChevronDown aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />}
              </div>
              <p className="mt-3 inline-flex rounded-full border border-stone-700/30 bg-white/55 px-2.5 py-1 text-[0.68rem] font-black text-[#6d3b39]">
                {collection.songIds.length} songs
              </p>
            </article>
          );
        })}
      </div>
    </aside>
  );
}

function HeroPanel({ featuredSong, songs }: { featuredSong: PlaylistSong; songs: PlaylistSong[] }) {
  return (
    <section className="grid gap-4 rounded-[1.8rem] border-[2.5px] border-stone-700/80 bg-[#fffaf3] p-4 shadow-[0_14px_28px_rgba(112,84,84,0.08)] md:grid-cols-[13rem_minmax(0,1fr)] md:p-5" aria-label="歌单概览">
      <PlaylistCover />
      <div className="flex min-w-0 flex-col justify-center">
        <p className="mb-2 inline-flex w-fit rounded-full border border-[#e4b7b9] bg-[#fff0c4] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#7a3d3f]">
          Playlist detail · {songs.length * 2 + 2} minutes
        </p>
        <h2 className="text-[2.45rem] font-black leading-none tracking-tight text-[#4f2525] sm:text-[3.35rem]">Daily Moods</h2>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-stone-700 sm:text-base">{featuredSong.feeling}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button aria-label={`播放${featuredSong.title}`} className="inline-flex items-center gap-2 rounded-[1.2rem] border-[2.5px] border-stone-700/80 bg-[#ffe6a7] px-5 py-2 text-base font-black text-stone-900 shadow-[0_5px_0_rgba(112,84,84,0.15)] transition hover:-translate-y-0.5" type="button">
            <Play aria-hidden="true" className="h-5 w-5 fill-[#f5a0aa] text-stone-900" />
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

function SongTable({ featuredSongId, songs }: Pick<PlaylistsPageViewProps, "featuredSongId" | "songs">) {
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
              const isFeatured = song.id === featuredSongId;

              return (
                <tr className={isFeatured ? "bg-[#f9d7db]" : "transition hover:bg-[#fff1f3]"} key={song.id}>
                  <td className="px-3 py-3 align-top text-sm font-black text-[#5a332f]">
                    <span className="inline-flex items-center gap-1">
                      {isFeatured ? <Pause aria-hidden="true" className="h-4 w-4 fill-[#4f2525] text-[#4f2525]" /> : null}
                      {index + 1}.
                    </span>
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
          const isFeatured = song.id === featuredSongId;

          return (
            <article className={`rounded-[1.2rem] border-2 border-stone-700/50 p-3 ${isFeatured ? "bg-[#f9d7db]" : "bg-white/70"}`} key={song.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-[#8d4b55]">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="text-lg font-black text-stone-900">{song.title}</h3>
                  <p className="text-sm font-semibold text-stone-700">{song.artist}</p>
                </div>
                <span className="rounded-full bg-[#fff3c7] px-2.5 py-1 text-xs font-black text-[#6d3b39]">{getSongDuration(index)}</span>
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

function CommentPlayerPanel({ featuredSong, notes }: { featuredSong: PlaylistSong; notes: PlaylistNote[] }) {
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
          {notes.map((note) => (
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

function BottomPlayerBar({ featuredSong, playerSnapshot }: { featuredSong: PlaylistSong; playerSnapshot: PlaylistPlayerSnapshot }) {
  return (
    <section aria-label="当前播放栏" className="sticky bottom-3 z-20 mt-5 rounded-[1.5rem] border-[2.5px] border-stone-700/80 bg-[#ffe6ad]/95 p-3 shadow-[0_16px_32px_rgba(112,84,84,0.2)] backdrop-blur">
      <div className="grid gap-3 lg:grid-cols-[minmax(13rem,18rem)_minmax(0,1fr)_12rem] lg:items-center">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[0.9rem] border-2 border-stone-700/70 bg-[#fffaf3]">
            <Music2 aria-hidden="true" className="h-7 w-7 text-[#9b4d57]" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-black text-[#4f2525]">{featuredSong.title}</h2>
            <p className="truncate text-sm font-semibold text-stone-700">{featuredSong.artist}</p>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-center gap-4 text-[#4f2525]">
            <button aria-label="随机播放" className="rounded-full p-1 transition hover:bg-white/50" type="button">
              <Shuffle aria-hidden="true" className="h-4 w-4" />
            </button>
            <button aria-label="上一首" className="rounded-full p-1 transition hover:bg-white/50" type="button">
              <SkipBack aria-hidden="true" className="h-4 w-4 fill-[#4f2525]" />
            </button>
            <button aria-label={`播放${featuredSong.title}`} className="grid h-10 w-10 place-items-center rounded-full border-2 border-stone-700/75 bg-[#f5a0aa] shadow-[0_4px_0_rgba(112,84,84,0.15)]" type="button">
              <Play aria-hidden="true" className="h-5 w-5 fill-[#4f2525] text-[#4f2525]" />
            </button>
            <button aria-label="下一首" className="rounded-full p-1 transition hover:bg-white/50" type="button">
              <SkipForward aria-hidden="true" className="h-4 w-4 fill-[#4f2525]" />
            </button>
            <button aria-label="喜欢当前歌曲" className="rounded-full p-1 transition hover:bg-white/50" type="button">
              <Heart aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 text-xs font-black text-[#5a332f]">
            <span>{playerSnapshot.currentTime}</span>
            <div className="h-2 rounded-full border border-stone-700/50 bg-white/80">
              <div className="h-full rounded-full bg-[#f5a0aa]" style={{ width: `${playerSnapshot.progressPercent}%` }} />
            </div>
            <span className="text-right">{playerSnapshot.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <span className="rounded-full bg-white/55 px-3 py-1 text-xs font-black text-[#7a3d3f]">{playerSnapshot.statusLabel}</span>
          <div className="flex items-center gap-2 text-[#4f2525]">
            <Volume2 aria-hidden="true" className="h-5 w-5" />
            <div className="h-2 w-20 rounded-full border border-stone-700/40 bg-white/80">
              <div className="h-full rounded-full bg-[#c8868d]" style={{ width: `${playerSnapshot.volumePercent}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PlaylistsPageView({ collections, featuredSongId, notes, playerSnapshot, songs }: PlaylistsPageViewProps) {
  const featuredSong = getFeaturedSong(songs, featuredSongId);

  return (
    <main className="album-page-scrollbar h-dvh overflow-y-auto bg-[#f7f1e8] text-stone-900">
      <PlaylistHeader />
      <div className="mx-auto max-w-[1480px] px-4 pb-6 pt-4 sm:px-6">
        <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)_21rem]">
          <PlaylistSidebar collections={collections} featuredSongId={featuredSong.id} />
          <div className="min-w-0 space-y-5">
            <HeroPanel featuredSong={featuredSong} songs={songs} />
            <SongTable featuredSongId={featuredSong.id} songs={songs} />
          </div>
          <CommentPlayerPanel featuredSong={featuredSong} notes={notes} />
        </div>
        <BottomPlayerBar featuredSong={featuredSong} playerSnapshot={playerSnapshot} />
      </div>
    </main>
  );
}
