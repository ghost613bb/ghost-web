"use client";

import { Camera, ChevronLeft, ChevronRight, ImageIcon, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ContentTabsHeader } from "@/features/content-modules/components/ContentTabsHeader";
import { AlbumFormDialog } from "./AlbumFormDialog";
import { AlbumPhotoUploadDialog } from "./AlbumPhotoUploadDialog";
import type { Album, AlbumPhoto } from "./types";

type AlbumWorkspacePageViewProps = {
  initialActiveAlbum: Album | null;
  initialActivePhoto: AlbumPhoto | null;
  initialAlbums: Album[];
  initialNextPhotoId: string | null;
  initialPhotos: AlbumPhoto[];
  initialPreviousPhotoId: string | null;
};

type AdminSessionResult = {
  authenticated?: boolean;
  error?: string;
};

function AlbumPlaceholder({ className = "", label }: { className?: string; label: string }) {
  return (
    <div aria-label={label} className={`grid place-items-center bg-[#f4ebda] text-[#b58d86] ${className}`} role="img">
      <ImageIcon aria-hidden="true" className="h-14 w-14 stroke-[1.8]" />
    </div>
  );
}

function coverImageFromAlbum(album: Album | null) {
  return album?.coverImage ?? null;
}

function buildWorkspaceHref(albumId?: string | null, photoId?: string | null) {
  const searchParams = new URLSearchParams();

  if (albumId) {
    searchParams.set("albumId", albumId);
  }

  if (photoId) {
    searchParams.set("photoId", photoId);
  }

  const queryString = searchParams.toString();
  return queryString ? `/album?${queryString}` : "/album";
}

function getManagementErrorMessage(error?: string) {
  return error === "无权限新增相册" || error === "无权限编辑相册" || error === "无权限删除相册" || error === "无权限上传照片" || error === "无权限编辑照片" || error === "无权限删除照片" ? "请先解锁管理" : error;
}

function AlbumAdminPanel({ adminError, adminToken, isAdminSubmitting, isAdminUnlocked, onAdminTokenChange, onLock, onUnlock }: { adminError: string | null; adminToken: string; isAdminSubmitting: boolean; isAdminUnlocked: boolean; onAdminTokenChange: (token: string) => void; onLock: () => void; onUnlock: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="rounded-[1.15rem] border-2 border-stone-700/70 bg-white/65 p-3 shadow-[0_6px_0_rgba(91,58,48,0.08)]" onSubmit={onUnlock}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-black text-[#5a3a33]">Admin 管理</p>
        <span className={`rounded-full px-2 py-0.5 text-[0.68rem] font-black ${isAdminUnlocked ? "bg-[#dff3cf] text-[#42672d]" : "bg-[#ffeef1] text-[#7a3d3f]"}`}>
          {isAdminUnlocked ? "已解锁" : "未解锁"}
        </span>
      </div>
      <p className="mb-2 text-xs font-semibold leading-5 text-stone-600">{isAdminUnlocked ? "管理会话已保存，后续操作无需重复输入 Token。" : "输入一次管理 Token，解锁相册管理。"}</p>
      {isAdminUnlocked ? (
        <button className="w-full rounded-[0.9rem] border-2 border-stone-700/60 bg-white px-3 py-1.5 text-xs font-black text-stone-900 transition hover:bg-[#fff5f6]" disabled={isAdminSubmitting} onClick={onLock} type="button">
          退出管理模式
        </button>
      ) : (
        <div className="space-y-2">
          <label className="sr-only" htmlFor="album-workspace-admin-token">
            管理 Token
          </label>
          <input className="w-full rounded-[0.9rem] border-2 border-stone-700/50 bg-white/80 px-3 py-2 text-sm font-semibold text-stone-800" disabled={isAdminSubmitting} id="album-workspace-admin-token" onChange={(event) => onAdminTokenChange(event.currentTarget.value)} placeholder="管理 Token" type="password" value={adminToken} />
          <button className="w-full rounded-[0.9rem] border-2 border-stone-700/70 bg-[#ffe6ad] px-3 py-1.5 text-xs font-black text-stone-900 shadow-[0_3px_0_rgba(112,84,84,0.12)] disabled:cursor-not-allowed disabled:opacity-60" disabled={isAdminSubmitting} type="submit">
            {isAdminSubmitting ? "解锁中..." : "解锁管理"}
          </button>
        </div>
      )}
      {adminError ? <p className="mt-2 rounded-[0.85rem] border border-[#b75d66] bg-[#ffeef1] px-2 py-1.5 text-xs font-black text-[#7a3d3f]">{adminError}</p> : null}
    </form>
  );
}

function AlbumPhotoLightbox({ activeAlbum, activePhoto, isAdminUnlocked, nextPhotoId, onClose, onDelete, onEdit, onNavigate, previousPhotoId }: { activeAlbum: Album | null; activePhoto: AlbumPhoto | null; isAdminUnlocked: boolean; nextPhotoId: string | null; onClose: () => void; onDelete: () => void; onEdit: () => void; onNavigate: (photoId: string) => void; previousPhotoId: string | null }) {
  useEffect(() => {
    if (!activePhoto) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft" && previousPhotoId) {
        onNavigate(previousPhotoId);
      }

      if (event.key === "ArrowRight" && nextPhotoId) {
        onNavigate(nextPhotoId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhoto, nextPhotoId, onClose, onNavigate, previousPhotoId]);

  if (!activePhoto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-[#3f2629]/58 px-4 pb-6 pt-10 backdrop-blur-[6px] sm:px-6 sm:pt-14">
      <button aria-label="关闭照片详情弹窗" className="absolute inset-0" onClick={onClose} type="button" />
      <div aria-label="照片详情弹窗" className="relative z-10 mx-auto w-full max-w-[760px] overflow-hidden rounded-[2rem] border-[2.5px] border-stone-700/75 bg-black shadow-[0_24px_80px_rgba(78,49,50,0.28)]" role="dialog" aria-modal="true">
        <div className="relative h-[460px] bg-black sm:h-[560px]">
          <div aria-label={`${activePhoto.title}大图`} className="absolute inset-0 grid place-items-center overflow-hidden" role="img">
            <img alt="" className="h-full w-full object-contain" src={activePhoto.imageUrl} style={{ objectPosition: activePhoto.imagePosition }} />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,rgba(39,27,28,0)_0%,rgba(39,27,28,0.72)_100%)]" />
          <div className="absolute right-4 top-4">
            <button aria-label="关闭弹窗" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-[rgba(33,20,24,0.56)] text-white shadow-[0_10px_22px_rgba(30,18,22,0.24)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-[rgba(33,20,24,0.7)]" onClick={onClose} type="button">
              <X aria-hidden="true" className="h-4.5 w-4.5 stroke-[2.4]" />
            </button>
          </div>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <button aria-label="上一张" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-[rgba(33,20,24,0.56)] text-white shadow-[0_10px_22px_rgba(30,18,22,0.24)] backdrop-blur-md transition enabled:hover:-translate-y-0.5 enabled:hover:bg-[rgba(33,20,24,0.7)] disabled:cursor-not-allowed disabled:opacity-40" disabled={!previousPhotoId} onClick={() => previousPhotoId && onNavigate(previousPhotoId)} type="button">
              <ChevronLeft aria-hidden="true" className="h-5 w-5 stroke-[2.6]" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button aria-label="下一张" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-[rgba(33,20,24,0.56)] text-white shadow-[0_10px_22px_rgba(30,18,22,0.24)] backdrop-blur-md transition enabled:hover:-translate-y-0.5 enabled:hover:bg-[rgba(33,20,24,0.7)] disabled:cursor-not-allowed disabled:opacity-40" disabled={!nextPhotoId} onClick={() => nextPhotoId && onNavigate(nextPhotoId)} type="button">
              <ChevronRight aria-hidden="true" className="h-5 w-5 stroke-[2.6]" />
            </button>
          </div>
          <div className="absolute inset-x-4 bottom-4 rounded-[1.35rem] border border-white/20 bg-[rgba(34,22,25,0.38)] px-4 py-3 text-white shadow-[0_14px_28px_rgba(25,16,18,0.26)] backdrop-blur-md sm:inset-x-5 sm:px-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/72">照片备注</p>
              <div className="flex items-center gap-1.5">
                <button aria-label="编辑备注" className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-45" disabled={!isAdminUnlocked} onClick={onEdit} type="button">
                  <Pencil aria-hidden="true" className="h-[0.76rem] w-[0.76rem] stroke-[2.15]" />
                </button>
                <button aria-label="删除照片" className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-45" disabled={!isAdminUnlocked} onClick={onDelete} type="button">
                  <Trash2 aria-hidden="true" className="h-[0.76rem] w-[0.76rem] stroke-[2.15]" />
                </button>
              </div>
            </div>
            <div className="album-page-scrollbar max-h-[124px] overflow-y-auto pr-1 sm:max-h-[146px]">
              <p className="whitespace-pre-line text-[0.95rem] leading-7 text-white">{activePhoto.note || "还没有备注。"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlbumWorkspacePageView({ initialActiveAlbum, initialActivePhoto, initialAlbums, initialNextPhotoId, initialPhotos, initialPreviousPhotoId }: AlbumWorkspacePageViewProps) {
  const router = useRouter();
  const [displayAlbums, setDisplayAlbums] = useState(initialAlbums);
  const [activeAlbum, setActiveAlbum] = useState(initialActiveAlbum);
  const [displayPhotos, setDisplayPhotos] = useState(initialPhotos);
  const [activePhoto, setActivePhoto] = useState(initialActivePhoto);
  const [nextPhotoId, setNextPhotoId] = useState(initialNextPhotoId);
  const [previousPhotoId, setPreviousPhotoId] = useState(initialPreviousPhotoId);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<AlbumPhoto | null>(null);
  const [pendingDeleteAlbum, setPendingDeleteAlbum] = useState<Album | null>(null);
  const [pendingDeletePhoto, setPendingDeletePhoto] = useState<AlbumPhoto | null>(null);
  const [pendingDeleteAlbumError, setPendingDeleteAlbumError] = useState("");
  const [pendingDeletePhotoError, setPendingDeletePhotoError] = useState("");
  const [isDeletingAlbum, setIsDeletingAlbum] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayAlbums(initialAlbums);
    setActiveAlbum(initialActiveAlbum);
    setDisplayPhotos(initialPhotos);
    setActivePhoto(initialActivePhoto);
    setNextPhotoId(initialNextPhotoId);
    setPreviousPhotoId(initialPreviousPhotoId);
  }, [initialActiveAlbum, initialActivePhoto, initialAlbums, initialNextPhotoId, initialPhotos, initialPreviousPhotoId]);

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

  const activeAlbumIndex = useMemo(() => (activeAlbum ? displayAlbums.findIndex((album) => album.id === activeAlbum.id) : -1), [activeAlbum, displayAlbums]);

  const navigateToSelection = (albumId?: string | null, photoId?: string | null) => {
    router.push(buildWorkspaceHref(albumId, photoId));
  };

  const closeLightbox = () => {
    navigateToSelection(activeAlbum?.id ?? null, null);
  };

  const handleAdminUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminError(null);

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
      setIsCreateDialogOpen(false);
      setEditingAlbum(null);
      setIsUploadDialogOpen(false);
      setEditingPhoto(null);
      setPendingDeleteAlbum(null);
      setPendingDeletePhoto(null);
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "退出管理模式失败");
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const chooseNextAlbumId = (nextAlbums: Album[]) => {
    const nextAlbum = nextAlbums[activeAlbumIndex] ?? nextAlbums[Math.max(0, activeAlbumIndex - 1)] ?? nextAlbums[0] ?? null;
    return nextAlbum?.id ?? null;
  };

  return (
    <main className="album-page-scrollbar h-dvh overflow-y-auto bg-[#f7f1e8] text-stone-900">
      <ContentTabsHeader activeTab="album" />
      <div className="mx-auto max-w-[1600px] px-4 pb-6 pt-6 sm:px-6">
        <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="rounded-[1.7rem] border-[2.5px] border-stone-700/80 bg-[#fff7df] p-4 shadow-[0_14px_28px_rgba(112,84,84,0.09)] xl:sticky xl:top-5 xl:h-[calc(100dvh-3.25rem)] xl:self-start xl:overflow-hidden xl:flex xl:flex-col">
            <AlbumAdminPanel adminError={adminError} adminToken={adminToken} isAdminSubmitting={isAdminSubmitting} isAdminUnlocked={isAdminUnlocked} onAdminTokenChange={setAdminToken} onLock={() => void handleAdminLock()} onUnlock={handleAdminUnlock} />
            <div className="mb-4 mt-4">
              <button className="flex w-full items-center justify-center gap-2 rounded-[1.15rem] border-[2.5px] border-stone-700/80 bg-[#ffe6ad] px-4 py-2 text-sm font-black text-stone-900 shadow-[0_5px_0_rgba(112,84,84,0.16)] transition enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" disabled={!isAdminUnlocked} onClick={() => {
                setAdminError(null);
                setIsCreateDialogOpen(true);
              }} type="button">
                <Plus aria-hidden="true" className="h-4 w-4" />
                新建相册
              </button>
            </div>
            <div className="album-page-scrollbar min-h-0 space-y-3 xl:flex-1 xl:overflow-y-auto xl:px-1 xl:py-2">
              {displayAlbums.map((album) => {
                const isActive = activeAlbum?.id === album.id;

                return (
                  <article className={`rounded-[1.2rem] border-[2.5px] border-stone-700/75 p-3 shadow-[0_6px_0_rgba(112,84,84,0.11)] transition hover:-translate-y-0.5 ${isActive ? "bg-[#fff4cf] outline outline-2 outline-offset-2 outline-[#c65f70]" : "bg-white/75"}`} key={album.id}>
                    <button aria-pressed={isActive} className="flex w-full flex-col gap-2 text-left" onClick={() => navigateToSelection(album.id)} type="button">
                      <div className="overflow-hidden rounded-[0.95rem] bg-[#f4ebda]">
                        {coverImageFromAlbum(album) ? <img alt={`${album.title}封面`} className="h-24 w-full object-cover" src={coverImageFromAlbum(album) ?? undefined} /> : <AlbumPlaceholder className="h-24 w-full" label={`${album.title}封面`} />}
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-[1rem] font-black text-[#4f2525]">{album.title}</h2>
                        <p className="inline-flex shrink-0 rounded-full border border-stone-700/30 bg-white/55 px-2.5 py-1 text-[0.68rem] font-black text-[#6d3b39]">数量：{album.photoCount}</p>
                      </div>
                    </button>
                  </article>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0 space-y-5">
            <section className="relative overflow-hidden rounded-[2rem] border-[2.5px] border-[#d8cec0] bg-[linear-gradient(135deg,#fcf8ef_0%,#fffdf8_62%,#f8efe2_100%)] shadow-[0_20px_42px_rgba(145,118,118,0.12)]">
              {coverImageFromAlbum(activeAlbum) ? <img alt={`${activeAlbum?.title ?? "相册"}封面背景`} className="absolute inset-0 h-full w-full object-cover" src={coverImageFromAlbum(activeAlbum) ?? undefined} /> : <AlbumPlaceholder className="absolute inset-0 h-full w-full" label={`${activeAlbum?.title ?? "相册"}封面背景`} />}
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(252,248,239,0.92)_0%,rgba(255,253,248,0.9)_48%,rgba(248,239,226,0.84)_100%)]" />
              <div className="relative grid gap-6 px-5 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_224px] lg:items-start lg:gap-8">
                <div className="max-w-2xl">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#7a5147]">Album Gallery</p>
                  <h2 className="mt-2 text-[2rem] font-black tracking-tight text-[#4c2b2d] sm:text-[2.35rem]">{activeAlbum?.title ?? "还没有相册"}</h2>
                  <p className="mt-2 text-base font-semibold text-[#6f4b4e]">Created: {activeAlbum?.createdAt ?? "--"}</p>
                  <p className="mt-4 max-w-xl text-base leading-7 text-[#5d4145]">{activeAlbum?.description || "左侧挑一个相册，中央会铺开它的照片。点开任意一张，就会进入更沉浸的弹窗浏览。"}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <button className="inline-flex items-center rounded-full border-2 border-[#b89b9b] bg-[#f4c0c9] px-5 py-3 text-left text-[1.05rem] font-black text-[#4c2b2d] shadow-[0_7px_16px_rgba(149,116,121,0.12)] transition hover:-translate-y-0.5 hover:bg-[#f7ccd3] disabled:cursor-not-allowed disabled:opacity-60" disabled={!activeAlbum || !isAdminUnlocked} onClick={() => {
                    setAdminError(null);
                    setIsUploadDialogOpen(true);
                  }} type="button">
                    <Camera aria-hidden="true" className="mr-2 h-[1.05rem] w-[1.05rem] stroke-[1.9]" />
                    上传照片
                  </button>
                  <button className="inline-flex items-center rounded-full border-2 border-[#c7bda4] bg-[#f8f2da] px-5 py-3 text-left text-[1.05rem] font-black text-[#4c2b2d] shadow-[0_7px_16px_rgba(149,116,121,0.08)] transition hover:-translate-y-0.5 hover:bg-[#fbf6e4] disabled:cursor-not-allowed disabled:opacity-60" disabled={!activeAlbum || !isAdminUnlocked} onClick={() => activeAlbum && setEditingAlbum(activeAlbum)} type="button">
                    <Pencil aria-hidden="true" className="mr-2 h-[1.02rem] w-[1.02rem] stroke-[1.9]" />
                    编辑相册
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border-[2px] border-[#ece3d7] bg-[#fffdf8] px-4 py-5 shadow-[0_16px_36px_rgba(144,118,118,0.08)] sm:px-6 sm:py-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-[1.6rem] font-black tracking-tight text-[#4c2b2d]">Photos ({displayPhotos.length})</h3>
                <p className="text-sm font-semibold text-[#7d5960]">点击一张照片放大浏览，左右切换会更像翻一本真正的相册。</p>
              </div>
              {displayPhotos.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {displayPhotos.map((photo, index) => {
                    const isActive = activePhoto?.id === photo.id;

                    return (
                      <article className={`relative rounded-[1.45rem] border p-3 shadow-[0_10px_26px_rgba(149,116,121,0.08)] transition ${isActive ? "border-[#c65f70] bg-[#fff7f8] ring-2 ring-[#f2c1c8]" : "border-[#e7ddd1] bg-white hover:-translate-y-1 hover:bg-[#fdf7ef]"}`} key={photo.id}>
                        <div aria-hidden="true" className={`absolute ${index % 2 === 0 ? "right-5 top-[-0.35rem] rotate-[7deg]" : "left-6 top-[-0.25rem] -rotate-[6deg]"} h-4 w-14 rounded-sm bg-[#e9dec9]/85`} />
                        <button className="w-full text-left" onClick={() => activeAlbum && navigateToSelection(activeAlbum.id, photo.id)} type="button">
                          <div className="overflow-hidden rounded-[1.2rem] bg-[#f4ebda]">
                            <div aria-label={`${photo.title}预览`} className="h-56 w-full bg-cover bg-center transition duration-300 hover:scale-[1.02]" role="img" style={{ backgroundImage: `url(${photo.imageUrl})`, backgroundPosition: photo.imagePosition }} />
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9a7f74]">{photo.uploadedAt.split(" /")[0]}</p>
                              <span className="rounded-full border border-[#ebdccf] bg-[#fff8ee] px-2 py-0.5 text-[0.68rem] font-black text-[#8d6667]">查看详情</span>
                            </div>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5b4347]">{photo.note || "还没有备注。"}</p>
                          </div>
                        </button>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[1.4rem] border-[2px] border-dashed border-[#d3c5b8] bg-[#fffaf2] px-6 py-8 text-center text-[#7d5960]">
                  <ImageIcon aria-hidden="true" className="mx-auto h-8 w-8 text-[#c79aa3]" />
                  <p className="mt-3 text-base font-black">这个相册还没有照片</p>
                  <p className="mt-2 text-sm font-semibold">先点右上角上传，把第一张画面贴进来。</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <AlbumPhotoLightbox
        activeAlbum={activeAlbum}
        activePhoto={activePhoto}
        isAdminUnlocked={isAdminUnlocked}
        nextPhotoId={nextPhotoId}
        onClose={closeLightbox}
        onDelete={() => {
          setPendingDeletePhotoError("");
          setPendingDeletePhoto(activePhoto);
        }}
        onEdit={() => activePhoto && setEditingPhoto(activePhoto)}
        onNavigate={(photoId) => activeAlbum && navigateToSelection(activeAlbum.id, photoId)}
        previousPhotoId={previousPhotoId}
      />

      {isCreateDialogOpen ? (
        <AlbumFormDialog
          heading="新建相册"
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={async ({ title, description, coverFile }) => {
            const formData = new FormData();
            formData.set("title", title);
            formData.set("description", description);

            if (coverFile) {
              formData.set("coverFileName", coverFile.name);
              formData.append("coverFile", coverFile, coverFile.name);
            }

            const response = await fetch("/api/albums", {
              credentials: "same-origin",
              method: "POST",
              body: formData,
            });
            const data = (await response.json()) as { album?: Album; error?: string };

            if (!response.ok || !data.album) {
              const message = getManagementErrorMessage(data.error ?? "新建相册失败");

              if (message === "请先解锁管理") {
                setIsAdminUnlocked(false);
              }

              throw new Error(message);
            }

            const nextAlbums = [data.album, ...displayAlbums];
            setDisplayAlbums(nextAlbums);
            setActiveAlbum(data.album);
            setDisplayPhotos([]);
            setActivePhoto(null);
            setNextPhotoId(null);
            setPreviousPhotoId(null);
            setIsCreateDialogOpen(false);
            navigateToSelection(data.album.id);
          }}
          submitErrorMessage="新建相册失败"
          submitLabel="保存"
        />
      ) : null}

      {editingAlbum ? (
        <AlbumFormDialog
          album={editingAlbum}
          heading="编辑相册"
          onClose={() => setEditingAlbum(null)}
          onSubmit={async ({ title, description, coverFile }) => {
            const formData = new FormData();
            formData.set("title", title);
            formData.set("description", description);

            if (coverFile) {
              formData.set("coverFileName", coverFile.name);
              formData.append("coverFile", coverFile, coverFile.name);
            }

            const response = await fetch(`/api/albums/${editingAlbum.id}`, {
              credentials: "same-origin",
              method: "PATCH",
              body: formData,
            });
            const data = (await response.json()) as { album?: Album; error?: string };

            if (!response.ok || !data.album) {
              const message = getManagementErrorMessage(data.error ?? "编辑相册失败");

              if (message === "请先解锁管理") {
                setIsAdminUnlocked(false);
              }

              throw new Error(message);
            }

            setDisplayAlbums((currentAlbums) => currentAlbums.map((album) => (album.id === data.album?.id ? data.album : album)));
            setActiveAlbum((current) => (current?.id === data.album.id ? data.album : current));
            setEditingAlbum(null);
          }}
          submitErrorMessage="编辑相册失败"
          submitLabel="保存修改"
        />
      ) : null}

      {isUploadDialogOpen && activeAlbum ? (
        <AlbumPhotoUploadDialog
          onClose={() => setIsUploadDialogOpen(false)}
          onSubmit={async ({ title, note, photoFile }) => {
            if (!photoFile) {
              throw new Error("请先选择照片");
            }

            const formData = new FormData();
            formData.set("title", title);
            formData.set("note", note);
            formData.set("photoFileName", photoFile.name);
            formData.append("photoFile", photoFile, photoFile.name);

            const response = await fetch(`/api/albums/${activeAlbum.id}/photos`, {
              credentials: "same-origin",
              method: "POST",
              body: formData,
            });
            const data = (await response.json()) as { album?: Album; photo?: AlbumPhoto; photos?: AlbumPhoto[]; error?: string };

            if (!response.ok || !data.album || !data.photos || !data.photo) {
              const message = getManagementErrorMessage(data.error ?? "上传照片失败");

              if (message === "请先解锁管理") {
                setIsAdminUnlocked(false);
              }

              throw new Error(message);
            }

            setDisplayAlbums((currentAlbums) => currentAlbums.map((album) => (album.id === data.album?.id ? data.album : album)));
            setActiveAlbum(data.album);
            setDisplayPhotos(data.photos);
            setActivePhoto(data.photo);
            setIsUploadDialogOpen(false);
            navigateToSelection(activeAlbum.id, data.photo.id);
          }}
          submitErrorMessage="上传照片失败"
          submitLabel="上传照片"
          title="上传照片"
        />
      ) : null}

      {editingPhoto && activeAlbum ? (
        <AlbumPhotoUploadDialog
          initialNote={editingPhoto.note}
          initialTitle={editingPhoto.title}
          onClose={() => setEditingPhoto(null)}
          onSubmit={async ({ title, note }) => {
            const response = await fetch(`/api/albums/${activeAlbum.id}/photos/${editingPhoto.id}`, {
              credentials: "same-origin",
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ title, note }),
            });
            const data = (await response.json()) as { photo?: AlbumPhoto; error?: string };

            if (!response.ok || !data.photo) {
              const message = getManagementErrorMessage(data.error ?? "编辑照片失败");

              if (message === "请先解锁管理") {
                setIsAdminUnlocked(false);
              }

              throw new Error(message);
            }

            setDisplayPhotos((currentPhotos) => currentPhotos.map((photo) => (photo.id === data.photo?.id ? data.photo : photo)));
            setActivePhoto(data.photo);
            setEditingPhoto(data.photo);
          }}
          requireFile={false}
          showFileInput={false}
          submitErrorMessage="编辑照片失败"
          submitLabel="保存修改"
          title="编辑照片"
        />
      ) : null}

      {pendingDeleteAlbum ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#6b3f49]/22 px-4 py-6 backdrop-blur-[2px]">
          <button aria-label="关闭删除确认弹窗" className="absolute inset-0" onClick={() => {
            setPendingDeleteAlbumError("");
            setPendingDeleteAlbum(null);
          }} type="button" />
          <div className="relative z-10 w-full max-w-[420px] rounded-[2rem] border-[3px] border-[#6f343b] bg-[#fcf8ef] px-6 py-6 text-[#6f343b] shadow-[0_24px_60px_rgba(111,52,59,0.16)]">
            <h2 className="text-[1.7rem] font-black tracking-tight">删除相册</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#7d5960]">确认删除“{pendingDeleteAlbum.title}”吗？删除后会从相册列表中移除。</p>
            {pendingDeleteAlbumError ? <p className="mt-4 text-sm font-semibold text-[#b14f5d]">{pendingDeleteAlbumError}</p> : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button className="rounded-full border-[3px] border-[#6f343b] bg-[#fcf8ef] px-5 py-2 text-[1rem] font-black text-[#6f343b] transition hover:-translate-y-0.5 hover:bg-[#fffdf7] disabled:cursor-not-allowed disabled:opacity-70" disabled={isDeletingAlbum} onClick={() => {
                setPendingDeleteAlbumError("");
                setPendingDeleteAlbum(null);
              }} type="button">
                取消
              </button>
              <button className="rounded-full border-[3px] border-[#9d3245] bg-[#f8c4cd] px-5 py-2 text-[1rem] font-black text-[#9d3245] transition hover:-translate-y-0.5 hover:bg-[#fad0d7] disabled:cursor-not-allowed disabled:opacity-70" disabled={isDeletingAlbum} onClick={async () => {
                setPendingDeleteAlbumError("");
                setIsDeletingAlbum(true);

                try {
                  const response = await fetch(`/api/albums/${pendingDeleteAlbum.id}`, {
                    credentials: "same-origin",
                    method: "DELETE",
                  });
                  const data = (await response.json()) as { error?: string };

                  if (!response.ok) {
                    const message = getManagementErrorMessage(data.error ?? "删除相册失败");

                    if (message === "请先解锁管理") {
                      setIsAdminUnlocked(false);
                    }

                    throw new Error(message);
                  }

                  const nextAlbums = displayAlbums.filter((album) => album.id !== pendingDeleteAlbum.id);
                  setDisplayAlbums(nextAlbums);
                  setPendingDeleteAlbum(null);
                  navigateToSelection(chooseNextAlbumId(nextAlbums));
                } catch (error) {
                  setPendingDeleteAlbumError(error instanceof Error ? error.message : "删除相册失败");
                } finally {
                  setIsDeletingAlbum(false);
                }
              }} type="button">
                {isDeletingAlbum ? "删除中" : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pendingDeletePhoto && activeAlbum ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#6b3f49]/22 px-4 py-6 backdrop-blur-[2px]">
          <button aria-label="关闭删除照片确认弹窗" className="absolute inset-0" onClick={() => {
            setPendingDeletePhotoError("");
            setPendingDeletePhoto(null);
          }} type="button" />
          <div className="relative z-10 w-full max-w-[420px] rounded-[2rem] border-[3px] border-[#6f343b] bg-[#fcf8ef] px-6 py-6 text-[#6f343b] shadow-[0_24px_60px_rgba(111,52,59,0.16)]">
            <h2 className="text-[1.7rem] font-black tracking-tight">删除照片</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#7d5960]">确认删除“{pendingDeletePhoto.title}”吗？删除后会从当前相册中移除。</p>
            {pendingDeletePhotoError ? <p className="mt-4 text-sm font-semibold text-[#b14f5d]">{pendingDeletePhotoError}</p> : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button className="rounded-full border-[3px] border-[#6f343b] bg-[#fcf8ef] px-5 py-2 text-[1rem] font-black text-[#6f343b] transition hover:-translate-y-0.5 hover:bg-[#fffdf7] disabled:cursor-not-allowed disabled:opacity-70" disabled={isDeletingPhoto} onClick={() => {
                setPendingDeletePhotoError("");
                setPendingDeletePhoto(null);
              }} type="button">
                取消
              </button>
              <button className="rounded-full border-[3px] border-[#9d3245] bg-[#f8c4cd] px-5 py-2 text-[1rem] font-black text-[#9d3245] transition hover:-translate-y-0.5 hover:bg-[#fad0d7] disabled:cursor-not-allowed disabled:opacity-70" disabled={isDeletingPhoto} onClick={async () => {
                setPendingDeletePhotoError("");
                setIsDeletingPhoto(true);

                try {
                  const deletingPhotoIndex = displayPhotos.findIndex((photo) => photo.id === pendingDeletePhoto.id);
                  const nextSelectedPhotoId = displayPhotos[deletingPhotoIndex + 1]?.id ?? displayPhotos[deletingPhotoIndex - 1]?.id ?? null;
                  const response = await fetch(`/api/albums/${activeAlbum.id}/photos/${pendingDeletePhoto.id}`, {
                    credentials: "same-origin",
                    method: "DELETE",
                  });
                  const data = (await response.json()) as { album?: Album; photos?: AlbumPhoto[]; error?: string };

                  if (!response.ok || !data.album || !data.photos) {
                    const message = getManagementErrorMessage(data.error ?? "删除照片失败");

                    if (message === "请先解锁管理") {
                      setIsAdminUnlocked(false);
                    }

                    throw new Error(message);
                  }

                  setDisplayAlbums((currentAlbums) => currentAlbums.map((album) => (album.id === data.album?.id ? data.album : album)));
                  setActiveAlbum(data.album);
                  setDisplayPhotos(data.photos);
                  setPendingDeletePhoto(null);
                  navigateToSelection(activeAlbum.id, nextSelectedPhotoId);
                } catch (error) {
                  setPendingDeletePhotoError(error instanceof Error ? error.message : "删除照片失败");
                } finally {
                  setIsDeletingPhoto(false);
                }
              }} type="button">
                {isDeletingPhoto ? "删除中" : "确认删除照片"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
