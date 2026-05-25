import Link from "next/link";
import type { ReactNode } from "react";

type ModulePageShellProps = {
  // 标题上方的小字说明
  eyebrow: string;
  // 页面主标题
  title: string;
  // 页面副标题或说明文案
  description: string;
  // 页面主体内容
  children: ReactNode;
};

export function ModulePageShell({ eyebrow, title, description, children }: ModulePageShellProps) {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(0,245,212,0.16),transparent_32%),linear-gradient(135deg,#020617,#111827_55%,#1e1b4b)] px-5 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10" href="/">
          返回首页小镇
        </Link>
        <header className="py-12">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/70">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">{description}</p>
        </header>
        {children}
      </div>
    </main>
  );
}
