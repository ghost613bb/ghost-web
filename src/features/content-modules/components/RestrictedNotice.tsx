import Link from "next/link";
import { siteConfig } from "@/data/site";

export function RestrictedNotice() {
  return (
    <div className="rounded-3xl border border-amber-200/20 bg-amber-100/10 p-6 text-white shadow-2xl shadow-black/25">
      <p className="text-sm uppercase tracking-[0.3em] text-amber-100/70">内容暂不可见</p>
      <h1 className="mt-3 text-3xl font-black">这间房间先轻轻关上门</h1>
      <p className="mt-4 max-w-2xl leading-7 text-white/75">{siteConfig.restrictedMessage}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950" href="/">
          返回首页
        </Link>
        <Link className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white" href="/message">
          给我留言
        </Link>
      </div>
    </div>
  );
}
