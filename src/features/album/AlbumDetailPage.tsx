"use client";

import { Camera, Pencil, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import type { AlbumPhoto } from "@/data/albumPhotos";
import { AlbumFormDialog, type AlbumFormPayload } from "./AlbumFormDialog";
import { AlbumPhotoUploadDialog } from "./AlbumPhotoUploadDialog";
import type { Album } from "./types";

function coverImageFromAlbum(album: Album) {
  return album.coverImage ?? "/album-cover-placeholder.jpeg";
}

type AlbumDetailPageViewProps = {
  album: Album;
  initialPhotos: AlbumPhoto[];
};

type AdminSessionResult = {
  authenticated?: boolean;
  error?: string;
};

function getManagementErrorMessage(error?: string) {
  return error === "无权限上传照片" || error === "无权限编辑相册" || error === "无权限删除相册" || error === "无权限编辑照片" || error === "无权限删除照片" ? "请先解锁管理" : error;
}

function AlbumAdminBadge({ adminError, adminToken, isAdminSubmitting, isAdminUnlocked, onAdminTokenChange, onLock, onUnlock }: { adminError: string | null; adminToken: string; isAdminSubmitting: boolean; isAdminUnlocked: boolean; onAdminTokenChange: (token: string) => void; onLock: () => void; onUnlock: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="rounded-[1.2rem] border-[2px] border-[#e4d8cb] bg-white/80 p-3 shadow-[0_8px_16px_rgba(149,116,121,0.06)]" onSubmit={onUnlock}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-black text-[#4c2b2d]">Admin 管理</p>
        <span className={`rounded-full px-2 py-0.5 text-[0.68rem] font-black ${isAdminUnlocked ? "bg-[#dff3cf] text-[#42672d]" : "bg-[#ffeef1] text-[#7a3d3f]"}`}>
          {isAdminUnlocked ? "已解锁" : "未解锁"}
        </span>
      </div>
      {isAdminUnlocked ? (
        <button className="w-full rounded-[0.95rem] border-2 border-stone-700/60 bg-white px-3 py-2 text-xs font-black text-stone-900 transition hover:bg-[#fff5f6]" disabled={isAdminSubmitting} onClick={onLock} type="button">
          退出管理模式
        </button>
      ) : (
        <div className="space-y-2">
          <label className="sr-only" htmlFor="album-detail-admin-token">
            管理 Token
          </label>
          <input className="w-full rounded-[0.95rem] border-2 border-stone-700/40 bg-white px-3 py-2 text-sm font-semibold text-stone-800" disabled={isAdminSubmitting} id="album-detail-admin-token" onChange={(event) => onAdminTokenChange(event.currentTarget.value)} placeholder="管理 Token" type="password" value={adminToken} />
          <button className="w-full rounded-[0.95rem] border-2 border-stone-700/70 bg-[#ffe6ad] px-3 py-2 text-xs font-black text-stone-900 shadow-[0_3px_0_rgba(112,84,84,0.12)] disabled:cursor-not-allowed disabled:opacity-60" disabled={isAdminSubmitting} type="submit">
            {isAdminSubmitting ? "解锁中..." : "解锁管理"}
          </button>
        </div>
      )}
      <p className="mt-2 text-xs font-semibold leading-5 text-[#7d5960]">{isAdminUnlocked ? "当前页面的上传、编辑、删除操作已解锁。" : "解锁后才可上传照片、编辑相册和删除内容。"}</p>
      {adminError ? <p className="mt-2 rounded-[0.85rem] border border-[#b75d66] bg-[#ffeef1] px-2 py-1.5 text-xs font-black text-[#7a3d3f]">{adminError}</p> : null}
    </form>
  );
}

export function AlbumDetailPageView({ album, initialPhotos }: AlbumDetailPageViewProps) {
  const router = useRouter();
  const [currentAlbum, setCurrentAlbum] = useState(album);
  const [photos, setPhotos] = useState(initialPhotos);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<AlbumPhoto | null>(null);
  const [deletingPhoto, setDeletingPhoto] = useState<AlbumPhoto | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeleteAlbumError, setPendingDeleteAlbumError] = useState("");
  const [pendingDeletePhotoError, setPendingDeletePhotoError] = useState("");
  const [isDeletingAlbum, setIsDeletingAlbum] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

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
      setIsUploadDialogOpen(false);
      setEditingPhoto(null);
      setDeletingPhoto(null);
      setIsEditDialogOpen(false);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "退出管理模式失败");
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  return (
    <>
      <main className="min-h-dvh bg-[linear-gradient(180deg,#fbf8f0_0%,#f7f1e8_100%)] px-4 py-5 text-[#4c2b2d] sm:px-6 sm:py-7">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              className="inline-flex items-center rounded-[1rem] border-2 border-[#6f343b] bg-[#f8cfd5] px-3.5 py-1 text-sm font-black text-[#4c2b2d] transition hover:-translate-y-0.5 hover:bg-[#fbe0e4] sm:px-4 sm:py-1.5"
              href="/album"
            >
              返回相册列表
            </Link>
          </div>

          <article className="relative overflow-hidden rounded-[2rem] border-[2.5px] border-[#d8cec0] bg-[#fcf8ef] shadow-[0_20px_42px_rgba(145,118,118,0.12)]">
            <img
              alt={`${currentAlbum.title}封面背景`}
              className="absolute inset-0 h-full w-full object-cover"
              src={coverImageFromAlbum(currentAlbum)}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(90deg,rgba(252,248,239,0.92)_0%,rgba(252,248,239,0.84)_34%,rgba(252,248,239,0.5)_64%,rgba(252,248,239,0.22)_100%)]"
            />
            <div aria-hidden="true" className="absolute left-3 top-1 h-7 w-16 -rotate-[28deg] rounded-sm bg-[#efe0be]/75 shadow-sm" />
            <div aria-hidden="true" className="absolute right-2 top-4 h-7 w-16 rotate-[26deg] rounded-sm bg-[#efe0be]/70 shadow-sm" />

            <div className="relative grid gap-6 px-5 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_224px] lg:items-start lg:gap-8">
              <div className="max-w-2xl">
                <h1 className="text-[2rem] font-black tracking-tight text-[#4c2b2d] sm:text-[2.35rem]">{currentAlbum.title}</h1>
                <p className="mt-2 text-base font-semibold text-[#6f4b4e]">Created: {currentAlbum.createdAt}</p>
                <p className="mt-4 max-w-xl text-base leading-7 text-[#5d4145]">{currentAlbum.description}</p>
              </div>

              <div className="flex flex-col gap-3">
                <AlbumAdminBadge adminError={adminError} adminToken={adminToken} isAdminSubmitting={isAdminSubmitting} isAdminUnlocked={isAdminUnlocked} onAdminTokenChange={setAdminToken} onLock={() => void handleAdminLock()} onUnlock={handleAdminUnlock} />
                <button
                  className="inline-flex items-center rounded-full border-2 border-[#b89b9b] bg-[#f4c0c9] px-5 py-3 text-left text-[1.05rem] font-black text-[#4c2b2d] shadow-[0_7px_16px_rgba(149,116,121,0.12)] transition hover:-translate-y-0.5 hover:bg-[#f7ccd3] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!isAdminUnlocked}
                  onClick={() => {
                    setAdminError(null);
                    setIsUploadDialogOpen(true);
                  }}
                  type="button"
                >
                  <Camera aria-hidden="true" className="mr-2 h-[1.05rem] w-[1.05rem] stroke-[1.9]" />
                  Upload Photos
                </button>
                <button
                  className="inline-flex items-center rounded-full border-2 border-[#c7bda4] bg-[#f8f2da] px-5 py-3 text-left text-[1.05rem] font-black text-[#4c2b2d] shadow-[0_7px_16px_rgba(149,116,121,0.08)] transition hover:-translate-y-0.5 hover:bg-[#fbf6e4] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!isAdminUnlocked}
                  onClick={() => {
                    setAdminError(null);
                    setIsEditDialogOpen(true);
                  }}
                  type="button"
                >
                  <Pencil aria-hidden="true" className="mr-2 h-[1.02rem] w-[1.02rem] stroke-[1.9]" />
                  Edit Album
                </button>
                <button
                  className="inline-flex items-center rounded-full border-2 border-[#d7cfc4] bg-white px-5 py-3 text-left text-[1.05rem] font-black text-[#4c2b2d] shadow-[0_7px_16px_rgba(149,116,121,0.08)] transition hover:-translate-y-0.5 hover:bg-[#fffdfa] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!isAdminUnlocked}
                  onClick={() => {
                    setAdminError(null);
                    setPendingDeleteAlbumError("");
                    setIsDeleteDialogOpen(true);
                  }}
                  type="button"
                >
                  <Trash2 aria-hidden="true" className="mr-2 h-[1.02rem] w-[1.02rem] stroke-[1.9]" />
                  Delete Album
                </button>
              </div>
            </div>
          </article>

          <section className="mt-5 rounded-[2rem] border-[2px] border-[#ece3d7] bg-[#fffdf8] px-4 py-5 shadow-[0_16px_36px_rgba(144,118,118,0.08)] sm:px-6 sm:py-6">
            <h2 className="text-[1.6rem] font-black tracking-tight text-[#4c2b2d]">Photos ({photos.length}) - Sorted by Date</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {photos.map((photo, index) => (
                <article
                  key={photo.id}
                  className="relative rounded-[1.45rem] border border-[#e7ddd1] bg-white p-3 shadow-[0_10px_26px_rgba(149,116,121,0.08)]"
                >
                  <div
                    aria-hidden="true"
                    className={`absolute ${index % 2 === 0 ? "right-5 top-[-0.35rem] rotate-[7deg]" : "left-6 top-[-0.25rem] -rotate-[6deg]"} h-4 w-14 rounded-sm bg-[#e9dec9]/85`}
                  />
                  <div className="flex gap-3">
                    <Link
                      aria-label="查看照片详情"
                      className="flex min-w-0 flex-1 gap-3 rounded-[1.1rem] transition hover:bg-[#fdf7ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9898f] focus-visible:ring-offset-2"
                      href={`/album/${currentAlbum.id}/${photo.id}`}
                    >
                      <div
                        aria-hidden="true"
                        className="h-25 w-25 shrink-0 rounded-[1.1rem] bg-[#e7deda] bg-cover bg-center"
                        style={{ backgroundImage: `url(${photo.imageUrl})`, backgroundPosition: photo.imagePosition }}
                      />
                      <div className="min-w-0 flex-1 py-0.5">
                        <p className="text-[1rem] font-semibold text-[#5b4347]">{photo.uploadedAt.split(" /")[0]}</p>
                        <p className="mt-1 line-clamp-2 text-[1rem] font-medium text-[#4c2b2d]">{photo.title}</p>
                      </div>
                    </Link>
                  </div>
                  <div className="mt-3 flex justify-end gap-2 text-[#4c2b2d]">
                    <button
                      aria-label="编辑照片"
                      className="rounded-full px-1 py-1 transition hover:bg-[#f7f1e8] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!isAdminUnlocked}
                      onClick={() => {
                        setAdminError(null);
                        setEditingPhoto(photo);
                      }}
                      type="button"
                    >
                      <Pencil aria-hidden="true" className="h-[0.92rem] w-[0.92rem] stroke-[1.9]" />
                    </button>
                    <button
                      aria-label="删除照片"
                      className="rounded-full px-1 py-1 transition hover:bg-[#f7f1e8] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!isAdminUnlocked}
                      onClick={() => {
                        setAdminError(null);
                        setPendingDeletePhotoError("");
                        setDeletingPhoto(photo);
                      }}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" className="h-[0.92rem] w-[0.92rem] stroke-[1.9]" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      {isUploadDialogOpen ? (
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

            const response = await fetch(`/api/albums/${currentAlbum.id}/photos`, {
              credentials: "same-origin",
              method: "POST",
              body: formData,
            });
            const data = (await response.json()) as {
              album?: Album;
              photos?: AlbumPhoto[];
              error?: string;
            };

            if (!response.ok || !data.album || !data.photos) {
              const message = getManagementErrorMessage(data.error ?? "上传照片失败");

              if (message === "请先解锁管理") {
                setIsAdminUnlocked(false);
              }

              throw new Error(message);
            }

            setCurrentAlbum(data.album);
            setPhotos(data.photos);
            setIsUploadDialogOpen(false);
          }}
          submitErrorMessage="上传照片失败"
          submitLabel="上传照片"
          title="上传照片"
        />
      ) : null}

      {editingPhoto ? (
        <AlbumPhotoUploadDialog
          initialNote={editingPhoto.note}
          initialTitle={editingPhoto.title}
          onClose={() => setEditingPhoto(null)}
          onSubmit={async ({ title, note }) => {
            const response = await fetch(`/api/albums/${currentAlbum.id}/photos/${editingPhoto.id}`, {
              credentials: "same-origin",
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ title, note }),
            });
            const data = (await response.json()) as {
              photo?: AlbumPhoto;
              error?: string;
            };

            if (!response.ok || !data.photo) {
              const message = getManagementErrorMessage(data.error ?? "编辑照片失败");

              if (message === "请先解锁管理") {
                setIsAdminUnlocked(false);
              }

              throw new Error(message);
            }

            setPhotos((currentPhotos) => currentPhotos.map((photo) => (photo.id === data.photo?.id ? data.photo : photo)));
            setEditingPhoto(null);
          }}
          requireFile={false}
          showFileInput={false}
          submitErrorMessage="编辑照片失败"
          submitLabel="保存修改"
          title="编辑照片"
        />
      ) : null}

      {isEditDialogOpen ? (
        <AlbumFormDialog
          album={currentAlbum}
          heading="编辑相册"
          onClose={() => setIsEditDialogOpen(false)}
          onSubmit={async ({ title, description, coverFile }) => {
            const formData = new FormData();
            formData.set("title", title);
            formData.set("description", description);

            if (coverFile) {
              formData.set("coverFileName", coverFile.name);
              formData.append("coverFile", coverFile, coverFile.name);
            }

            const response = await fetch(`/api/albums/${currentAlbum.id}`, {
              credentials: "same-origin",
              method: "PATCH",
              body: formData,
            });
            const data = (await response.json()) as {
              album?: Album;
              error?: string;
            };

            if (!response.ok || !data.album) {
              const message = getManagementErrorMessage(data.error ?? "编辑相册失败");

              if (message === "请先解锁管理") {
                setIsAdminUnlocked(false);
              }

              throw new Error(message);
            }

            setCurrentAlbum(data.album);
            setIsEditDialogOpen(false);
          }}
          submitErrorMessage="编辑相册失败"
          submitLabel="保存修改"
        />
      ) : null}

      {deletingPhoto ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#6b3f49]/22 px-4 py-6 backdrop-blur-[2px]">
          <button
            aria-label="关闭删除照片确认弹窗"
            className="absolute inset-0"
            onClick={() => {
              setPendingDeletePhotoError("");
              setDeletingPhoto(null);
            }}
            type="button"
          />
          <div className="relative z-10 w-full max-w-[420px] rounded-[2rem] border-[3px] border-[#6f343b] bg-[#fcf8ef] px-6 py-6 text-[#6f343b] shadow-[0_24px_60px_rgba(111,52,59,0.16)]">
            <h2 className="text-[1.7rem] font-black tracking-tight">删除照片</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#7d5960]">确认删除“{deletingPhoto.title}”吗？删除后会从当前相册中移除。</p>
            {pendingDeletePhotoError ? <p className="mt-4 text-sm font-semibold text-[#b14f5d]">{pendingDeletePhotoError}</p> : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                className="rounded-full border-[3px] border-[#6f343b] bg-[#fcf8ef] px-5 py-2 text-[1rem] font-black text-[#6f343b] transition hover:-translate-y-0.5 hover:bg-[#fffdf7] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isDeletingPhoto}
                onClick={() => {
                  setPendingDeletePhotoError("");
                  setDeletingPhoto(null);
                }}
                type="button"
              >
                取消
              </button>
              <button
                className="rounded-full border-[3px] border-[#9d3245] bg-[#f8c4cd] px-5 py-2 text-[1rem] font-black text-[#9d3245] transition hover:-translate-y-0.5 hover:bg-[#fad0d7] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isDeletingPhoto}
                onClick={async () => {
                  setPendingDeletePhotoError("");
                  setIsDeletingPhoto(true);

                  try {
                    const response = await fetch(`/api/albums/${currentAlbum.id}/photos/${deletingPhoto.id}`, {
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

                    setCurrentAlbum(data.album);
                    setPhotos(data.photos);
                    setDeletingPhoto(null);
                  } catch (error) {
                    setPendingDeletePhotoError(error instanceof Error ? error.message : "删除照片失败");
                  } finally {
                    setIsDeletingPhoto(false);
                  }
                }}
                type="button"
              >
                {isDeletingPhoto ? "删除中" : "确认删除照片"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isDeleteDialogOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#6b3f49]/22 px-4 py-6 backdrop-blur-[2px]">
          <button
            aria-label="关闭删除确认弹窗"
            className="absolute inset-0"
            onClick={() => {
              setPendingDeleteAlbumError("");
              setIsDeleteDialogOpen(false);
            }}
            type="button"
          />
          <div className="relative z-10 w-full max-w-[420px] rounded-[2rem] border-[3px] border-[#6f343b] bg-[#fcf8ef] px-6 py-6 text-[#6f343b] shadow-[0_24px_60px_rgba(111,52,59,0.16)]">
            <h2 className="text-[1.7rem] font-black tracking-tight">删除相册</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#7d5960]">确认删除“{currentAlbum.title}”吗？删除后会从相册列表中移除。</p>
            {pendingDeleteAlbumError ? <p className="mt-4 text-sm font-semibold text-[#b14f5d]">{pendingDeleteAlbumError}</p> : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                className="rounded-full border-[3px] border-[#6f343b] bg-[#fcf8ef] px-5 py-2 text-[1rem] font-black text-[#6f343b] transition hover:-translate-y-0.5 hover:bg-[#fffdf7] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isDeletingAlbum}
                onClick={() => {
                  setPendingDeleteAlbumError("");
                  setIsDeleteDialogOpen(false);
                }}
                type="button"
              >
                取消
              </button>
              <button
                className="rounded-full border-[3px] border-[#9d3245] bg-[#f8c4cd] px-5 py-2 text-[1rem] font-black text-[#9d3245] transition hover:-translate-y-0.5 hover:bg-[#fad0d7] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isDeletingAlbum}
                onClick={async () => {
                  setPendingDeleteAlbumError("");
                  setIsDeletingAlbum(true);

                  try {
                    const response = await fetch(`/api/albums/${currentAlbum.id}`, {
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

                    router.push("/album");
                  } catch (error) {
                    setPendingDeleteAlbumError(error instanceof Error ? error.message : "删除相册失败");
                  } finally {
                    setIsDeletingAlbum(false);
                  }
                }}
                type="button"
              >
                {isDeletingAlbum ? "删除中" : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
