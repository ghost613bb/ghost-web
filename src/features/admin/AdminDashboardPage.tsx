"use client";

import Link from "next/link";
import { Coffee, Image, ListMusic, LogOut, NotebookPen, Settings2, ShieldCheck } from "lucide-react";
import { ModuleDisplayModeAdminForm } from "@/features/module-display-mode/components/ModuleDisplayModeAdminForm";
import { useAdminSession } from "./useAdminSession";

const adminLinks = [
  {
    title: "个人相册",
    description: "管理相册、封面、照片和备注。",
    href: "/album",
    icon: Image,
  },
  {
    title: "歌单",
    description: "管理歌单集合、导入歌曲、维护歌曲评论。",
    href: "/playlists",
    icon: ListMusic,
  },
  {
    title: "咖啡推荐",
    description: "记录咖啡评分、判定、why、提醒和照片。",
    href: "/coffee",
    icon: Coffee,
  },
  {
    title: "新建碎碎念",
    description: "进入富文本编辑器写新的碎碎念。",
    href: "/thoughts/new",
    icon: NotebookPen,
  },
];

export function AdminDashboardPage() {
  const { adminError, adminToken, isAdminLoading, isAdminSubmitting, isAdminUnlocked, lockAdmin, setAdminToken, unlockAdmin } = useAdminSession();

  return (
    <main className="album-page-scrollbar min-h-dvh overflow-y-auto bg-[#fff8e6] px-4 py-8 text-[#4a2e28] [background-image:radial-gradient(circle_at_12%_18%,rgba(255,199,211,0.28)_0_80px,transparent_81px),linear-gradient(90deg,rgba(121,76,55,0.04)_1px,transparent_1px),linear-gradient(rgba(121,76,55,0.035)_1px,transparent_1px)] [background-size:auto,42px_42px,42px_42px] sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        <Link className="inline-flex rounded-full border-2 border-[#5b3a30] bg-[#fffaf0] px-4 py-2 text-sm font-black text-[#6a3c34] shadow-[3px_3px_0_rgba(91,58,48,0.1)] transition hover:-translate-y-0.5" href="/">
          返回首页小镇
        </Link>

        <section className="mt-6 overflow-hidden rounded-[1.8rem] border-[2px] border-[#5b3a30] bg-[#fffdf2]/94 p-5 shadow-[8px_8px_0_rgba(91,58,48,0.1)] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border-2 border-[#5b3a30] bg-[#ffb9c8] px-4 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#6a3c34]">
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                Admin Center
              </p>
              <h1 className="mt-4 text-[2.5rem] font-black leading-tight tracking-tight text-[#4a2e28] sm:text-[3.4rem]">后台管理</h1>
              <p className="mt-3 max-w-2xl text-sm font-bold leading-7 text-[#765247]">在这里统一解锁管理会话。解锁后，相册、歌单、咖啡等模块都不需要重复输入 Token。</p>
            </div>

            <form className="w-full rounded-[1.25rem] border-2 border-[#5b3a30] bg-[#fffaf0] p-4 shadow-[5px_5px_0_rgba(91,58,48,0.1)] lg:max-w-[360px]" onSubmit={unlockAdmin}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-black text-[#4a2e28]">管理会话</p>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${isAdminUnlocked ? "bg-[#dff3cf] text-[#42672d]" : "bg-[#ffeef1] text-[#7a3d3f]"}`}>{isAdminUnlocked ? "已解锁" : "未解锁"}</span>
              </div>

              {isAdminUnlocked ? (
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border-2 border-[#5b3a30] bg-white px-4 py-2 text-sm font-black text-[#4a2e28] transition hover:bg-[#fff1f4] disabled:cursor-not-allowed disabled:opacity-60" disabled={isAdminSubmitting} onClick={lockAdmin} type="button">
                  <LogOut aria-hidden="true" className="h-4 w-4" />
                  退出后台管理
                </button>
              ) : (
                <div className="space-y-3">
                  <label className="sr-only" htmlFor="admin-dashboard-token">
                    管理 Token
                  </label>
                  <input className="w-full rounded-[1rem] border-2 border-[#d7b7a2] bg-white px-3 py-2.5 text-sm font-bold text-[#4a2e28] outline-none transition placeholder:text-[#a27a64]/80 focus:border-[#d48b9a]" disabled={isAdminLoading || isAdminSubmitting} id="admin-dashboard-token" onChange={(event) => setAdminToken(event.currentTarget.value)} placeholder={isAdminLoading ? "检查会话中..." : "管理 Token"} type="password" value={adminToken} />
                  <button className="w-full rounded-[1rem] border-2 border-[#5b3a30] bg-[#ffb9c8] px-4 py-2.5 text-sm font-black text-[#5b3a30] shadow-[4px_4px_0_rgba(91,58,48,0.12)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" disabled={isAdminLoading || isAdminSubmitting} type="submit">
                    {isAdminSubmitting ? "解锁中..." : "解锁后台管理"}
                  </button>
                </div>
              )}

              {adminError ? <p className="mt-3 rounded-[1rem] border border-[#d67a8f] bg-[#fff1f4] px-3 py-2 text-xs font-black text-[#9f5365]">{adminError}</p> : null}
            </form>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="后台管理入口">
          {adminLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link className="group rounded-[1.35rem] border-2 border-[#5b3a30] bg-[#fffdf2] p-4 shadow-[5px_5px_0_rgba(91,58,48,0.09)] transition hover:-translate-y-1 hover:bg-[#fffaf0]" href={item.href} key={item.href}>
                <Icon aria-hidden="true" className="h-6 w-6 text-[#d67a8f]" />
                <h2 className="mt-3 text-lg font-black text-[#4a2e28]">{item.title}</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-[#765247]">{item.description}</p>
              </Link>
            );
          })}
        </section>

        {isAdminUnlocked ? (
          <section className="mt-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#765247]">
              <Settings2 aria-hidden="true" className="h-4 w-4" />
              展示模式配置
            </div>
            <ModuleDisplayModeAdminForm />
          </section>
        ) : (
          <section className="mt-6 rounded-[1.35rem] border-2 border-dashed border-[#d7b7a2] bg-[#fffaf0]/70 p-5 text-sm font-bold leading-7 text-[#765247]">
            解锁后台后，可以在这里直接切换各模块真实内容 / 试玩模式。
          </section>
        )}
      </div>
    </main>
  );
}
