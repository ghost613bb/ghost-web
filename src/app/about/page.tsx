import Link from "next/link";
import { aboutProfile } from "@/data/about";
import { ModulePageShell } from "@/features/content-modules/components/ModulePageShell";

export default function AboutPage() {
  return (
    <ModulePageShell eyebrow="About" title="关于我" description={aboutProfile.headline}>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <p className="text-lg leading-9 text-white/75">{aboutProfile.bio}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {aboutProfile.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-cyan-200/15 px-3 py-1 text-sm text-cyan-100">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
          <h2 className="text-2xl font-bold">可以从这里继续逛</h2>
          <div className="mt-5 grid gap-3">
            {aboutProfile.links.map((link) => (
              <Link key={link.href} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 transition hover:bg-white/15" href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </ModulePageShell>
  );
}
