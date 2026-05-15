import Link from "next/link";
import type { ReactNode } from "react";

type ContentCardProps = {
  title: string;
  description?: string;
  href?: string;
  meta?: string;
  tags?: string[];
  children?: ReactNode;
};

export function ContentCard({ title, description, href, meta, tags = [], children }: ContentCardProps) {
  const body = (
    <article className="h-full rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-200/35 hover:bg-white/[0.1]">
      {meta ? <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/55">{meta}</p> : null}
      <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
      {description ? <p className="mt-3 text-sm leading-6 text-white/65">{description}</p> : null}
      {tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/65">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
      {children ? <div className="mt-4 text-sm leading-6 text-white/70">{children}</div> : null}
    </article>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
