import { ModulePageShell } from "@/features/content-modules/components/ModulePageShell";

export default function MessagePage() {
  return (
    <ModulePageShell eyebrow="Message" title="留言" description="如果你路过这里，可以留下一点声音。第一版先展示表单界面，提交能力在后续接入。">
      <form className="grid max-w-2xl gap-4 rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/25">
        <label className="grid gap-2 text-sm font-medium text-white/75">
          昵称
          <input className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-cyan-200/60" name="nickname" placeholder="怎么称呼你" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-white/75">
          联系方式
          <input className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-cyan-200/60" name="contact" placeholder="邮箱、微信或其他方式" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-white/75">
          留言
          <textarea className="min-h-36 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-cyan-200/60" name="message" placeholder="想说的话" />
        </label>
        <button className="rounded-full bg-white px-5 py-3 font-semibold text-slate-950" type="button">
          第一版先展示，提交功能建设中
        </button>
      </form>
    </ModulePageShell>
  );
}
