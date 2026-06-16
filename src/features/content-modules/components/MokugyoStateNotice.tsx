"use client";

import { useState } from "react";

type MokugyoStateNoticeReason = "empty" | "missing-env" | "read-error";

type MokugyoStateNoticeProps = {
  description?: string;
  page?: string;
  reason?: MokugyoStateNoticeReason;
  title?: string;
};

type KnockState = "error" | "idle" | "sending" | "sent";

const copyByReason: Record<MokugyoStateNoticeReason, { description: string; title: string }> = {
  empty: {
    title: "这里暂时没有碎碎念",
    description: "如果你发现这页空空的，帮我敲一下木鱼提醒作者补货。",
  },
  "missing-env": {
    title: "服务器还没摆好小碗",
    description: "云端数据源暂时没配置好。你可以先敲一下木鱼，提醒作者来看看。",
  },
  "read-error": {
    title: "服务器在打瞌睡",
    description: "这页刚刚没拿到数据。敲一下木鱼，提醒作者把服务器叫醒。",
  },
};

export function MokugyoStateNotice({ description, page = "/thoughts", reason = "empty", title }: MokugyoStateNoticeProps) {
  const [isKnocking, setIsKnocking] = useState(false);
  const [knockCount, setKnockCount] = useState(0);
  const [knockState, setKnockState] = useState<KnockState>("idle");
  const [message, setMessage] = useState("木鱼在等一声咚。");
  const copy = copyByReason[reason];

  function playKnockAnimation() {
    setIsKnocking(false);
    requestAnimationFrame(() => {
      setIsKnocking(true);
    });
    window.setTimeout(() => {
      setIsKnocking(false);
    }, 620);
  }

  async function knockMokugyo() {
    if (knockState === "sending") {
      return;
    }

    playKnockAnimation();
    const nextCount = knockCount + 1;
    setKnockCount(nextCount);
    setKnockState("sending");
    setMessage("咚……木鱼声正在穿过奶油云。");

    try {
      const response = await fetch("/api/contact/muyu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page,
          reason,
          message: `${title ?? copy.title}｜第 ${nextCount} 下木鱼`,
          website: "",
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "木鱼声暂时没送出去");
      }

      setKnockState("sent");
      setMessage(`咚！第 ${nextCount} 下已经送到作者耳边。`);
    } catch (error) {
      setKnockState("error");
      setMessage(error instanceof Error ? error.message : "木鱼声暂时没送出去，但作者已经在路上了。");
    }
  }

  return (
    <section className="relative overflow-hidden rounded-[1.7rem] border-[2px] border-dashed border-[#5b3a30] bg-[#fffdf2]/90 px-6 py-10 text-center shadow-[7px_7px_0_rgba(91,58,48,0.12)]" data-testid="mokugyo-state-notice">
      <div aria-hidden="true" className="absolute -left-8 top-8 h-18 w-18 rounded-full bg-[#ffccd5]/45" />
      <div aria-hidden="true" className="absolute -right-10 bottom-6 h-24 w-24 rounded-full bg-[#bee9dd]/45" />
      <div className="relative mx-auto max-w-[34rem]">
        <div className="relative mx-auto mb-6 h-38 w-56" aria-hidden="true" data-testid="mokugyo-stage">
          <div className={`absolute bottom-4 left-1/2 h-24 w-40 -translate-x-1/2 rounded-[48%] border-[3px] border-[#5b3a30] bg-[radial-gradient(circle_at_38%_30%,#e2ad70_0_15%,#b97743_16%_46%,#744225_72%_100%)] shadow-[8px_10px_0_rgba(91,58,48,0.14)] ${isKnocking ? "animate-[mokugyo-body-knock_620ms_ease-out]" : ""}`}>
            <span className="absolute left-7 top-4 h-3 w-12 -rotate-12 rounded-full bg-[#fff0ba]/30" />
            <span className="absolute bottom-5 left-5 h-2 w-10 rotate-6 rounded-full bg-[#5b3a30]/18" />
            <span className="absolute bottom-6 right-7 h-2 w-11 -rotate-6 rounded-full bg-[#5b3a30]/16" />
            <span className="absolute left-1/2 top-1/2 h-10 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2px] border-[#5b3a30]/70 bg-[#3f2619]/90 shadow-[inset_0_5px_0_rgba(255,244,207,0.16)]">
              <span className="absolute left-1/2 top-1/2 h-2 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff0ba]/45" />
            </span>
          </div>
          <div className={`absolute right-7 top-0 h-30 w-22 origin-[68%_88%] ${isKnocking ? "animate-[mokugyo-mallet-knock_620ms_cubic-bezier(.2,.9,.24,1)]" : "-rotate-[28deg]"}`} data-testid="mokugyo-mallet">
            <span className="absolute bottom-1 right-8 h-23 w-3 rounded-full border border-[#5b3a30]/55 bg-[#b87745] shadow-[2px_2px_0_rgba(91,58,48,0.12)]" />
            <span className="absolute right-2 top-1 h-9 w-14 rounded-[999px] border-[2px] border-[#5b3a30] bg-[linear-gradient(135deg,#ffd596_0%,#d98b4d_72%)] shadow-[3px_3px_0_rgba(91,58,48,0.16)]">
              <span className="absolute left-2 top-2 h-1.5 w-8 rounded-full bg-white/35" />
            </span>
          </div>
          {isKnocking ? (
            <span className="absolute left-[45%] top-8 rounded-full border border-[#5b3a30]/20 bg-[#fff4cf] px-3 py-1 text-xs font-black text-[#7a5147] shadow-[2px_2px_0_rgba(91,58,48,0.1)] animate-[mokugyo-sound-pop_620ms_ease-out]">咚</span>
          ) : null}
        </div>

        <h2 className="text-xl font-black tracking-tight text-[#4a2e28] sm:text-2xl">{title ?? copy.title}</h2>
        <p className="mx-auto mt-2 max-w-[28rem] text-sm font-bold leading-7 text-[#7a5147]">{description ?? copy.description}</p>

        <button
          aria-label="敲一下木鱼提醒作者"
          className="group relative mt-6 inline-flex items-center gap-3 rounded-full border-[3px] border-[#5b3a30] bg-[#ffb9c8] px-6 py-3 text-sm font-black text-[#5b3a30] shadow-[6px_6px_0_rgba(91,58,48,0.16)] transition hover:-translate-y-1 hover:bg-[#ffd6de] active:translate-y-0.5 active:shadow-[3px_3px_0_rgba(91,58,48,0.16)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          disabled={knockState === "sending"}
          onClick={knockMokugyo}
          type="button"
        >
          {knockState === "sending" ? "木鱼传声中..." : "敲一下木鱼"}
        </button>

        <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[#9b6b57]">功德 +{knockCount}</p>
        <p className={`mt-3 rounded-[1rem] border px-4 py-3 text-sm font-bold ${knockState === "error" ? "border-[#f0c6cf] bg-[#fff4f6] text-[#c65f73]" : "border-[#ead7ce] bg-white/60 text-[#7a5147]"}`} role={knockState === "error" ? "alert" : "status"}>
          {message}
        </p>
      </div>
    </section>
  );
}
