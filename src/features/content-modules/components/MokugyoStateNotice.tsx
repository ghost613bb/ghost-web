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
  const [knockCount, setKnockCount] = useState(0);
  const [knockState, setKnockState] = useState<KnockState>("idle");
  const [message, setMessage] = useState("木鱼在等一声咚。");
  const copy = copyByReason[reason];

  async function knockMokugyo() {
    if (knockState === "sending") {
      return;
    }

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
        <div className="mx-auto mb-5 flex h-28 w-36 items-center justify-center rounded-[45%] border-[3px] border-[#5b3a30] bg-[radial-gradient(circle_at_42%_38%,#d39a5e_0_18%,#9a6237_19%_58%,#704326_59%_100%)] shadow-[8px_9px_0_rgba(91,58,48,0.14)]">
          <span className="relative block h-10 w-15 rounded-full border-[2px] border-[#5b3a30]/70 bg-[#3f2619]/85 shadow-[inset_0_5px_0_rgba(255,244,207,0.16)]">
            <span className="absolute left-1/2 top-1/2 h-2 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff0ba]/45" />
          </span>
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
          <span aria-hidden="true" className="inline-block origin-bottom-right -rotate-12 text-lg transition group-hover:-rotate-45 group-active:rotate-6">🔨</span>
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
