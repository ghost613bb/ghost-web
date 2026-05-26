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
    <main className="min-h-dvh bg-stone-100 px-5 py-8 text-stone-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          className="inline-flex items-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-600 transition hover:border-stone-400 hover:text-stone-900"
          href="/"
        >
          返回首页小镇
        </Link>
        <header className="border-b border-stone-200 py-8 sm:py-10">
          {eyebrow ? <p className="text-xs uppercase tracking-[0.28em] text-stone-500">{eyebrow}</p> : null}
          <h1 className={`${eyebrow ? "mt-3" : "mt-0"} text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl`}>{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">{description}</p>
        </header>
        <div className="py-8 sm:py-10">{children}</div>
      </div>
    </main>
  );
}
