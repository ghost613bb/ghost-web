"use client";

import { Camera, ChevronLeft, ChevronRight, ImageIcon, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ContentTabsHeader } from "@/features/content-modules/components/ContentTabsHeader";
import { AlbumFormDialog } from "./AlbumFormDialog";
import { AlbumPhotoUploadDialog } from "./AlbumPhotoUploadDialog";
import type { Album, AlbumPhoto } from "./types";

type AlbumWorkspacePageViewProps = {
  initialActiveAlbum: Album | null;
  initialActivePhoto: AlbumPhoto | null;
  initialAlbums: Album[];
  initialDeleteAlbumCandidate?: Album | null;
  initialPhotos: AlbumPhoto[];
};

type AdminSessionResult = {
  authenticated?: boolean;
  error?: string;
};

type AlbumPhotosByAlbumId = Record<string, AlbumPhoto[]>;

type ApplyAlbumSelectionOptions = {
  fallbackToRouter?: boolean;
  historyMode?: "push" | "replace" | "none";
  photoId?: string | null;
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

function getAdjacentPhotoIds(photos: AlbumPhoto[], activePhotoId?: string | null) {
  if (!activePhotoId) {
    return { previousPhotoId: null, nextPhotoId: null };
  }

  const index = photos.findIndex((photo) => photo.id === activePhotoId);

  if (index === -1) {
    return { previousPhotoId: null, nextPhotoId: null };
  }

  return {
    previousPhotoId: photos[index - 1]?.id ?? null,
    nextPhotoId: photos[index + 1]?.id ?? null,
  };
}

function readWorkspaceLocation() {
  if (typeof window === "undefined") {
    return { albumId: null, photoId: null };
  }

  const searchParams = new URLSearchParams(window.location.search);
  return {
    albumId: searchParams.get("albumId"),
    photoId: searchParams.get("photoId"),
  };
}

function getManagementErrorMessage(error?: string) {
  return error === "无权限新增相册" || error === "无权限编辑相册" || error === "无权限删除相册" || error === "无权限上传照片" || error === "无权限编辑照片" || error === "无权限删除照片" ? "请先解锁管理" : error;
}

function getPhotoAriaLabel(uploadedAt: string, variant: "preview" | "detail") {
  return variant === "detail" ? `照片大图，上传于 ${uploadedAt}` : `照片预览，上传于 ${uploadedAt}`;
}

function buildInitialAlbumPhotosMap(initialActiveAlbum: Album | null, initialPhotos: AlbumPhoto[]): AlbumPhotosByAlbumId {
  if (!initialActiveAlbum) {
    return {};
  }

  return {
    [initialActiveAlbum.id]: initialPhotos,
  };
}

function mergeAlbumPhotos(currentPhotos: AlbumPhoto[], serverPhotos: AlbumPhoto[], uploadedPhoto: AlbumPhoto) {
  const currentPhotoIds = new Set(currentPhotos.map((photo) => photo.id));
  const nextPhotos = [...currentPhotos];

  serverPhotos.forEach((photo) => {
    if (!currentPhotoIds.has(photo.id)) {
      currentPhotoIds.add(photo.id);
      nextPhotos.push(photo);
    }
  });

  if (!currentPhotoIds.has(uploadedPhoto.id)) {
    nextPhotos.push(uploadedPhoto);
  }

  return nextPhotos;
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
    <div className="fixed inset-0 z-40 bg-[#3f2629]/58 px-4 pb-6 pt-10 backdrop-blur-[6px] sm:px-6 sm:pt-14" onClick={onClose}>
      <div aria-label="照片详情弹窗" className="relative z-10 mx-auto w-full max-w-[760px] overflow-hidden rounded-[2rem] border-[2.5px] border-stone-700/75 bg-black shadow-[0_24px_80px_rgba(78,49,50,0.28)]" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="relative h-[460px] bg-black sm:h-[560px]">
          <div aria-label={getPhotoAriaLabel(activePhoto.uploadedAt, "detail")} className="absolute inset-0 grid place-items-center overflow-hidden" role="img">
            <img alt="" className="h-full w-full object-contain" src={activePhoto.imageUrl} style={{ objectPosition: activePhoto.imagePosition }} />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,rgba(39,27,28,0)_0%,rgba(39,27,28,0.72)_100%)]" />
          <div className="absolute right-4 top-4 z-20">
            <button
              aria-label="关闭弹窗"
              className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-[rgba(33,20,24,0.56)] text-white shadow-[0_10px_22px_rgba(30,18,22,0.24)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-[rgba(33,20,24,0.7)]"
              onClick={(event) => {
                event.stopPropagation();
                onClose();
              }}
              type="button"
            >
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

export function AlbumWorkspacePageView({ initialActiveAlbum, initialActivePhoto, initialAlbums, initialDeleteAlbumCandidate = null, initialPhotos }: AlbumWorkspacePageViewProps) {
  const router = useRouter();
  const albumSelectionRequestRef = useRef(0);
  const deletedPhotoIdsRef = useRef(new Set<string>());
  const uploadAlbumIdRef = useRef<string | null>(null);
  const [displayAlbums, setDisplayAlbums] = useState(initialAlbums);
  const [activeAlbumId, setActiveAlbumId] = useState(initialActiveAlbum?.id ?? null);
  const [photosByAlbumId, setPhotosByAlbumId] = useState<AlbumPhotosByAlbumId>(() => buildInitialAlbumPhotosMap(initialActiveAlbum, initialPhotos));
  const [loadingAlbumId, setLoadingAlbumId] = useState<string | null>(null);
  const [activePhotoId, setActivePhotoId] = useState(initialActivePhoto?.id ?? null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadingAlbum, setUploadingAlbum] = useState<Album | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<AlbumPhoto | null>(null);
  const [pendingDeleteAlbum, setPendingDeleteAlbum] = useState<Album | null>(initialDeleteAlbumCandidate);
  const [pendingDeletePhoto, setPendingDeletePhoto] = useState<AlbumPhoto | null>(null);
  const [pendingDeleteAlbumError, setPendingDeleteAlbumError] = useState("");
  const [pendingDeletePhotoError, setPendingDeletePhotoError] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const updateWorkspaceHistory = useCallback((albumId?: string | null, photoId?: string | null, mode: "push" | "replace" = "push") => {
    if (typeof window === "undefined") {
      return;
    }

    const href = buildWorkspaceHref(albumId, photoId);
    const method = mode === "push" ? window.history.pushState : window.history.replaceState;
    method.call(window.history, window.history.state, "", href);
  }, []);

  useEffect(() => {
    const { albumId, photoId } = readWorkspaceLocation();
    const lockedAlbumId = uploadAlbumIdRef.current;
    const nextActiveAlbum = (lockedAlbumId ? initialAlbums.find((album) => album.id === lockedAlbumId) : null) ?? (albumId ? initialAlbums.find((album) => album.id === albumId) : null) ?? initialActiveAlbum;
    const nextActivePhoto = nextActiveAlbum?.id === initialActiveAlbum?.id ? initialActivePhoto : null;
    const nextInitialPhotos = nextActiveAlbum?.id === initialActiveAlbum?.id ? initialPhotos : [];

    albumSelectionRequestRef.current += 1;
    deletedPhotoIdsRef.current.clear();
    setDisplayAlbums(initialAlbums);
    setActiveAlbumId(nextActiveAlbum?.id ?? null);
    setPhotosByAlbumId((current) => ({ ...current, ...buildInitialAlbumPhotosMap(nextActiveAlbum ?? null, nextInitialPhotos) }));
    setLoadingAlbumId(null);
    setActivePhotoId(lockedAlbumId ? null : photoId ? (nextActivePhoto?.id === photoId ? nextActivePhoto.id : null) : (nextActivePhoto?.id ?? null));

    if (lockedAlbumId && nextActiveAlbum) {
      updateWorkspaceHistory(nextActiveAlbum.id, null, "replace");
    }
  }, [initialActiveAlbum, initialActivePhoto, initialAlbums, initialPhotos, updateWorkspaceHistory]);

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

  const activeAlbum = useMemo(() => (activeAlbumId ? displayAlbums.find((album) => album.id === activeAlbumId) ?? null : null), [activeAlbumId, displayAlbums]);
  const visiblePhotosByAlbumId = useMemo(() => {
    if (deletedPhotoIdsRef.current.size === 0) {
      return photosByAlbumId;
    }

    return Object.fromEntries(Object.entries(photosByAlbumId).map(([albumId, photos]) => [albumId, photos.filter((photo) => !deletedPhotoIdsRef.current.has(photo.id))]));
  }, [photosByAlbumId]);
  const displayPhotos = useMemo(() => (activeAlbum ? visiblePhotosByAlbumId[activeAlbum.id] ?? [] : []), [activeAlbum, visiblePhotosByAlbumId]);
  const activeAlbumIndex = useMemo(() => (activeAlbum ? displayAlbums.findIndex((album) => album.id === activeAlbum.id) : -1), [activeAlbum, displayAlbums]);
  const activePhoto = useMemo(() => displayPhotos.find((photo) => photo.id === activePhotoId) ?? null, [activePhotoId, displayPhotos]);
  const { previousPhotoId, nextPhotoId } = useMemo(() => getAdjacentPhotoIds(displayPhotos, activePhotoId), [activePhotoId, displayPhotos]);
  const shouldHidePhotoLightbox = Boolean(isCreateDialogOpen || editingAlbum || isUploadDialogOpen || editingPhoto || pendingDeleteAlbum || pendingDeletePhoto);
  const isPhotoGridLoading = Boolean(activeAlbum?.id && loadingAlbumId === activeAlbum.id && !(activeAlbum.id in photosByAlbumId));
  const displayPhotoCount = isPhotoGridLoading && activeAlbum ? activeAlbum.photoCount : displayPhotos.length;

  const navigateToSelection = useCallback((albumId?: string | null, photoId?: string | null) => {
    router.push(buildWorkspaceHref(albumId, photoId));
  }, [router]);

  const fetchAlbumPhotos = useCallback(async (albumId: string) => {
    if (albumId in visiblePhotosByAlbumId) {
      return visiblePhotosByAlbumId[albumId];
    }

    setLoadingAlbumId(albumId);

    try {
      const response = await fetch(`/api/albums/${albumId}/photos`, {
        credentials: "same-origin",
      });
      const data = (await response.json()) as { photos?: AlbumPhoto[] };

      if (!response.ok || !data.photos) {
        return null;
      }

      setPhotosByAlbumId((current) => (albumId in current ? current : { ...current, [albumId]: data.photos! }));
      return data.photos;
    } catch {
      return null;
    } finally {
      setLoadingAlbumId((current) => (current === albumId ? null : current));
    }
  }, [visiblePhotosByAlbumId]);

  const applyAlbumSelectionLocally = useCallback(async (nextAlbums: Album[], nextAlbumId: string | null, options: ApplyAlbumSelectionOptions = {}) => {
    const { fallbackToRouter = true, historyMode = "replace", photoId = null } = options;
    const requestId = ++albumSelectionRequestRef.current;

    setDisplayAlbums(nextAlbums);

    if (!nextAlbumId) {
      setActiveAlbumId(null);
      setActivePhotoId(null);

      if (historyMode !== "none") {
        updateWorkspaceHistory(null, null, historyMode);
      }

      return true;
    }

    const nextActiveAlbum = nextAlbums.find((album) => album.id === nextAlbumId) ?? null;

    if (!nextActiveAlbum) {
      if (fallbackToRouter) {
        navigateToSelection(nextAlbumId, photoId);
      }

      return false;
    }

    setActiveAlbumId(nextActiveAlbum.id);
    setActivePhotoId(null);

    if (historyMode !== "none" && !photoId) {
      updateWorkspaceHistory(nextActiveAlbum.id, null, historyMode);
    }

    let nextPhotos = nextActiveAlbum.id in visiblePhotosByAlbumId ? visiblePhotosByAlbumId[nextActiveAlbum.id] : null;

    if (!nextPhotos) {
      const loadedPhotos = await fetchAlbumPhotos(nextActiveAlbum.id);

      if (requestId !== albumSelectionRequestRef.current) {
        return false;
      }

      if (!loadedPhotos) {
        if (fallbackToRouter) {
          navigateToSelection(nextActiveAlbum.id, photoId);
        }

        return false;
      }

      nextPhotos = loadedPhotos;
    }

    if (requestId !== albumSelectionRequestRef.current) {
      return false;
    }

    if (photoId) {
      const matchedPhoto = nextPhotos.find((photo) => photo.id === photoId) ?? null;

      if (!matchedPhoto) {
        if (fallbackToRouter) {
          navigateToSelection(nextActiveAlbum.id, photoId);
        }

        return false;
      }

      setActivePhotoId(matchedPhoto.id);

      if (historyMode !== "none") {
        updateWorkspaceHistory(nextActiveAlbum.id, matchedPhoto.id, historyMode);
      }

      return true;
    }

    if (historyMode !== "none" && photoId) {
      updateWorkspaceHistory(nextActiveAlbum.id, null, historyMode);
    }

    return true;
  }, [fetchAlbumPhotos, navigateToSelection, visiblePhotosByAlbumId, updateWorkspaceHistory]);

  useEffect(() => {
    const handlePopState = () => {
      const { albumId, photoId } = readWorkspaceLocation();
      void applyAlbumSelectionLocally(displayAlbums, albumId, {
        fallbackToRouter: true,
        historyMode: "none",
        photoId,
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [applyAlbumSelectionLocally, displayAlbums]);

  const selectPhotoLocally = useCallback((photoId: string, mode: "push" | "replace" = "push") => {
    if (!activeAlbum) {
      return;
    }

    const targetPhoto = displayPhotos.find((photo) => photo.id === photoId);

    if (!targetPhoto) {
      navigateToSelection(activeAlbum.id, photoId);
      return;
    }

    setActivePhotoId(targetPhoto.id);
    updateWorkspaceHistory(activeAlbum.id, targetPhoto.id, mode);
  }, [activeAlbum, displayPhotos, navigateToSelection, updateWorkspaceHistory]);

  const clearPhotoSelection = useCallback((mode: "push" | "replace" = "replace") => {
    setActivePhotoId(null);

    if (!activeAlbum) {
      return;
    }

    updateWorkspaceHistory(activeAlbum.id, null, mode);
  }, [activeAlbum, updateWorkspaceHistory]);

  const closeLightbox = useCallback((mode: "push" | "replace" = "replace") => {
    clearPhotoSelection(mode);
  }, [clearPhotoSelection]);

  const handleSelectAlbum = useCallback((albumId: string) => {
    void applyAlbumSelectionLocally(displayAlbums, albumId, {
      fallbackToRouter: true,
      historyMode: "push",
    });
  }, [applyAlbumSelectionLocally, displayAlbums]);

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
      uploadAlbumIdRef.current = null;
      setIsUploadDialogOpen(false);
      setUploadingAlbum(null);
      setEditingPhoto(null);
      setPendingDeleteAlbum(null);
      setPendingDeletePhoto(null);
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "退出管理模式失败");
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const chooseNextAlbumId = useCallback((nextAlbums: Album[]) => {
    const nextAlbum = nextAlbums[activeAlbumIndex] ?? nextAlbums[Math.max(0, activeAlbumIndex - 1)] ?? nextAlbums[0] ?? null;
    return nextAlbum?.id ?? null;
  }, [activeAlbumIndex]);

  useEffect(() => {
    if (!activePhoto) {
      return;
    }

    [previousPhotoId, nextPhotoId]
      .map((photoId) => displayPhotos.find((photo) => photo.id === photoId)?.imageUrl)
      .filter((imageUrl): imageUrl is string => Boolean(imageUrl))
      .forEach((imageUrl) => {
        const image = new Image();
        image.src = imageUrl;
      });
  }, [activePhoto, displayPhotos, nextPhotoId, previousPhotoId]);

  useEffect(() => {
    if (!isUploadDialogOpen) {
      return;
    }

    displayPhotos
      .map((photo) => photo.imageUrl)
      .filter(Boolean)
      .forEach((imageUrl) => {
        const image = new Image();
        image.src = imageUrl;
      });
  }, [displayPhotos, isUploadDialogOpen]);

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
                clearPhotoSelection();
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
                    <button aria-pressed={isActive} className="flex w-full flex-col gap-2 text-left" onClick={() => handleSelectAlbum(album.id)} type="button">
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
              {coverImageFromAlbum(activeAlbum) ? <img alt={`${activeAlbum?.title ?? "相册"}封面背景`} className="absolute inset-0 h-full w-full object-cover" src={coverImageFromAlbum(activeAlbum) ?? undefined} /> : null}
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
                    clearPhotoSelection();
                    uploadAlbumIdRef.current = activeAlbum.id;
                    setUploadingAlbum(activeAlbum);
                    setIsUploadDialogOpen(true);
                  }} type="button">
                    <Camera aria-hidden="true" className="mr-2 h-[1.05rem] w-[1.05rem] stroke-[1.9]" />
                    上传照片
                  </button>
                  <button className="inline-flex items-center rounded-full border-2 border-[#c7bda4] bg-[#f8f2da] px-5 py-3 text-left text-[1.05rem] font-black text-[#4c2b2d] shadow-[0_7px_16px_rgba(149,116,121,0.08)] transition hover:-translate-y-0.5 hover:bg-[#fbf6e4] disabled:cursor-not-allowed disabled:opacity-60" disabled={!activeAlbum || !isAdminUnlocked} onClick={() => {
                    if (!activeAlbum) {
                      return;
                    }

                    clearPhotoSelection();
                    setEditingAlbum(activeAlbum);
                  }} type="button">
                    <Pencil aria-hidden="true" className="mr-2 h-[1.02rem] w-[1.02rem] stroke-[1.9]" />
                    编辑相册
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border-[2px] border-[#ece3d7] bg-[#fffdf8] px-4 py-5 shadow-[0_16px_36px_rgba(144,118,118,0.08)] sm:px-6 sm:py-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-[1.6rem] font-black tracking-tight text-[#4c2b2d]">Photos ({displayPhotoCount})</h3>
                <p className="text-sm font-semibold text-[#7d5960]">点击一张照片放大浏览，左右切换会更像翻一本真正的相册。</p>
              </div>
              {displayPhotos.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {displayPhotos.map((photo, index) => {
                    const isActive = activePhoto?.id === photo.id;

                    return (
                      <article className={`relative rounded-[1.45rem] border p-3 shadow-[0_10px_26px_rgba(149,116,121,0.08)] transition ${isActive ? "border-[#c65f70] bg-[#fff7f8] ring-2 ring-[#f2c1c8]" : "border-[#e7ddd1] bg-white hover:-translate-y-1 hover:bg-[#fdf7ef]"}`} key={photo.id}>
                        <div aria-hidden="true" className={`absolute ${index % 2 === 0 ? "right-5 top-[-0.35rem] rotate-[7deg]" : "left-6 top-[-0.25rem] -rotate-[6deg]"} h-4 w-14 rounded-sm bg-[#e9dec9]/85`} />
                        <button className="w-full text-left" onClick={() => selectPhotoLocally(photo.id)} type="button">
                          <div className="overflow-hidden rounded-[1.2rem] bg-[#f4ebda]">
                            <img
                              alt={getPhotoAriaLabel(photo.uploadedAt, "preview")}
                              className="h-56 w-full object-cover transition duration-300 hover:scale-[1.02]"
                              decoding="async"
                              loading="lazy"
                              src={photo.imageUrl}
                              style={{ objectPosition: photo.imagePosition }}
                            />
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
              ) : isPhotoGridLoading ? (
                <div className="rounded-[1.4rem] border-[2px] border-dashed border-[#d3c5b8] bg-[#fffaf2] px-6 py-8 text-center text-[#7d5960]">
                  <ImageIcon aria-hidden="true" className="mx-auto h-8 w-8 animate-pulse text-[#c79aa3]" />
                  <p className="mt-3 text-base font-black">正在加载这个相册的照片</p>
                  <p className="mt-2 text-sm font-semibold">已经先切换到目标相册，照片列表马上就到。</p>
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
        activePhoto={shouldHidePhotoLightbox ? null : activePhoto}
        isAdminUnlocked={isAdminUnlocked}
        nextPhotoId={nextPhotoId}
        onClose={() => closeLightbox()}
        onDelete={() => {
          setPendingDeletePhotoError("");
          clearPhotoSelection();
          setPendingDeletePhoto(activePhoto);
        }}
        onEdit={() => {
          if (!activePhoto) {
            return;
          }

          clearPhotoSelection();
          setEditingPhoto(activePhoto);
        }}
        onNavigate={(photoId) => selectPhotoLocally(photoId)}
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
            setActiveAlbumId(data.album.id);
            setPhotosByAlbumId((current) => ({ ...current, [data.album!.id]: [] }));
            setActivePhotoId(null);
            setIsCreateDialogOpen(false);
            updateWorkspaceHistory(data.album.id, null, "push");
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
          onDelete={() => {
            clearPhotoSelection();
            setEditingAlbum(null);
            setPendingDeleteAlbum(editingAlbum);
          }}
          onSubmit={async ({ title, description, coverFile }) => {
            const editingAlbumSnapshot = editingAlbum;
            const albumsBeforeEdit = displayAlbums;
            const optimisticAlbum: Album = {
              ...editingAlbumSnapshot,
              title,
              description: description || "先留一个新的相册位置。",
              coverImage: coverFile ? editingAlbumSnapshot.coverImage : editingAlbumSnapshot.coverImage,
              status: "published",
            };

            setDisplayAlbums((currentAlbums) => currentAlbums.map((album) => (album.id === editingAlbumSnapshot.id ? optimisticAlbum : album)));
            setEditingAlbum(null);

            const formData = new FormData();
            formData.set("title", title);
            formData.set("description", description);

            if (coverFile) {
              formData.set("coverFileName", coverFile.name);
              formData.append("coverFile", coverFile, coverFile.name);
            }

            try {
              const response = await fetch(`/api/albums/${editingAlbumSnapshot.id}`, {
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
            } catch (error) {
              setDisplayAlbums(albumsBeforeEdit);
              setEditingAlbum(editingAlbumSnapshot);
              throw error;
            }
          }}
          submitErrorMessage="编辑相册失败"
          submitLabel="保存修改"
        />
      ) : null}

      {isUploadDialogOpen && uploadingAlbum ? (
        <AlbumPhotoUploadDialog
          onClose={() => {
            uploadAlbumIdRef.current = null;
            setIsUploadDialogOpen(false);
            setUploadingAlbum(null);
          }}
          onSubmit={async ({ note, photoFile }) => {
            if (!photoFile) {
              throw new Error("请先选择照片");
            }

            const uploadAlbum = uploadingAlbum;
            const formData = new FormData();
            formData.set("note", note);
            formData.set("photoFileName", photoFile.name);
            formData.append("photoFile", photoFile, photoFile.name);

            const response = await fetch(`/api/albums/${uploadAlbum.id}/photos`, {
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
            setPhotosByAlbumId((current) => ({
              ...current,
              [uploadAlbum.id]: mergeAlbumPhotos(current[uploadAlbum.id] ?? [], data.photos!, data.photo!),
            }));
            setActiveAlbumId(uploadAlbum.id);
            setActivePhotoId(null);
            updateWorkspaceHistory(uploadAlbum.id, null, "replace");
            setIsUploadDialogOpen(false);
            setUploadingAlbum(null);
          }}
          submitErrorMessage="上传照片失败"
          submitLabel="上传照片"
          title="上传照片"
        />
      ) : null}

      {editingPhoto && activeAlbum ? (
        <AlbumPhotoUploadDialog
          initialNote={editingPhoto.note}
          onClose={() => setEditingPhoto(null)}
          onSubmit={async ({ note }) => {
            const response = await fetch(`/api/albums/${activeAlbum.id}/photos/${editingPhoto.id}`, {
              credentials: "same-origin",
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ note }),
            });
            const data = (await response.json()) as { photo?: AlbumPhoto; error?: string };

            if (!response.ok || !data.photo) {
              const message = getManagementErrorMessage(data.error ?? "编辑照片失败");

              if (message === "请先解锁管理") {
                setIsAdminUnlocked(false);
              }

              throw new Error(message);
            }

            setPhotosByAlbumId((current) => ({
              ...current,
              [activeAlbum.id]: (current[activeAlbum.id] ?? []).map((photo) => (photo.id === data.photo?.id ? data.photo : photo)),
            }));
            setActivePhotoId(null);
            setEditingPhoto(null);
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
              <button className="rounded-full border-[3px] border-[#6f343b] bg-[#fcf8ef] px-5 py-2 text-[1rem] font-black text-[#6f343b] transition hover:-translate-y-0.5 hover:bg-[#fffdf7] disabled:cursor-not-allowed disabled:opacity-70" onClick={() => {
                setPendingDeleteAlbumError("");
                setPendingDeleteAlbum(null);
              }} type="button">
                取消
              </button>
              <button className="rounded-full border-[3px] border-[#9d3245] bg-[#f8c4cd] px-5 py-2 text-[1rem] font-black text-[#9d3245] transition hover:-translate-y-0.5 hover:bg-[#fad0d7] disabled:cursor-not-allowed disabled:opacity-70" onClick={async () => {
                const deletingAlbum = pendingDeleteAlbum;
                const albumsBeforeDelete = displayAlbums;
                const photosBeforeDelete = photosByAlbumId;
                const activeAlbumIdBeforeDelete = activeAlbumId;
                const activePhotoIdBeforeDelete = activePhotoId;
                const nextAlbums = albumsBeforeDelete.filter((album) => album.id !== deletingAlbum.id);
                const nextAlbumId = chooseNextAlbumId(nextAlbums);

                setPendingDeleteAlbumError("");
                setPendingDeleteAlbum(null);
                setPhotosByAlbumId((current) => {
                  const nextPhotos = { ...current };
                  delete nextPhotos[deletingAlbum.id];
                  return nextPhotos;
                });
                await applyAlbumSelectionLocally(nextAlbums, nextAlbumId, {
                  historyMode: "replace",
                });

                try {
                  const response = await fetch(`/api/albums/${deletingAlbum.id}`, {
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
                } catch (error) {
                  setDisplayAlbums(albumsBeforeDelete);
                  setPhotosByAlbumId(photosBeforeDelete);
                  setActiveAlbumId(activeAlbumIdBeforeDelete);
                  setActivePhotoId(activePhotoIdBeforeDelete);
                  updateWorkspaceHistory(activeAlbumIdBeforeDelete, activePhotoIdBeforeDelete, "replace");
                  setPendingDeleteAlbum(deletingAlbum);
                  setPendingDeleteAlbumError(error instanceof Error ? error.message : "删除相册失败");
                }
              }} type="button">
                确认删除
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
            <p className="mt-3 text-sm font-semibold leading-6 text-[#7d5960]">确认删除这张照片吗？删除后会从当前相册中移除。</p>
            {pendingDeletePhotoError ? <p className="mt-4 text-sm font-semibold text-[#b14f5d]">{pendingDeletePhotoError}</p> : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button className="rounded-full border-[3px] border-[#6f343b] bg-[#fcf8ef] px-5 py-2 text-[1rem] font-black text-[#6f343b] transition hover:-translate-y-0.5 hover:bg-[#fffdf7] disabled:cursor-not-allowed disabled:opacity-70" onClick={() => {
                setPendingDeletePhotoError("");
                setPendingDeletePhoto(null);
              }} type="button">
                取消
              </button>
              <button className="rounded-full border-[3px] border-[#9d3245] bg-[#f8c4cd] px-5 py-2 text-[1rem] font-black text-[#9d3245] transition hover:-translate-y-0.5 hover:bg-[#fad0d7] disabled:cursor-not-allowed disabled:opacity-70" onClick={async () => {
                const deletingPhoto = pendingDeletePhoto;
                const albumBeforeDelete = activeAlbum;
                const albumsBeforeDelete = displayAlbums;
                const photosBeforeDelete = photosByAlbumId[albumBeforeDelete.id] ?? displayPhotos;
                const nextPhotos = photosBeforeDelete.filter((photo) => photo.id !== deletingPhoto.id);
                const nextAlbum: Album = {
                  ...albumBeforeDelete,
                  photoCount: Math.max(0, albumBeforeDelete.photoCount - 1),
                  status: "published",
                };

                setPendingDeletePhotoError("");
                deletedPhotoIdsRef.current.add(deletingPhoto.id);
                setPendingDeletePhoto(null);
                setActivePhotoId(null);
                setDisplayAlbums((currentAlbums) => currentAlbums.map((album) => (album.id === albumBeforeDelete.id ? nextAlbum : album)));
                setPhotosByAlbumId((current) => ({ ...current, [albumBeforeDelete.id]: nextPhotos }));
                updateWorkspaceHistory(albumBeforeDelete.id, null, "replace");

                try {
                  const response = await fetch(`/api/albums/${albumBeforeDelete.id}/photos/${deletingPhoto.id}`, {
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
                  setPhotosByAlbumId((current) => ({ ...current, [albumBeforeDelete.id]: data.photos!.filter((photo) => photo.id !== deletingPhoto.id) }));
                } catch (error) {
                  deletedPhotoIdsRef.current.delete(deletingPhoto.id);
                  setDisplayAlbums(albumsBeforeDelete);
                  setPhotosByAlbumId((current) => ({ ...current, [albumBeforeDelete.id]: photosBeforeDelete }));
                  setPendingDeletePhoto(deletingPhoto);
                  setPendingDeletePhotoError(error instanceof Error ? error.message : "删除照片失败");
                }
              }} type="button">
                确认删除照片
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
