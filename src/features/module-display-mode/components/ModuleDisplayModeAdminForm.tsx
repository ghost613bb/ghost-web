"use client";

import { useEffect, useState } from "react";
import {
  configurableModules,
  createDefaultDisplayModes,
  type DisplayMode,
  type DisplayModes,
  type ModuleId,
} from "@/features/module-display-mode/configurableModules";

const emptyModes: DisplayModes = createDefaultDisplayModes();

export function ModuleDisplayModeAdminForm() {
  const [modes, setModes] = useState<DisplayModes>(emptyModes);
  const [loading, setLoading] = useState(true);
  // 当你点击某个模块切换模式时，我只把那个模块暂时置为“保存中”。
  // 虽然现在 UI 上只是 disabled，但这个状态的意义很重要：
  // 它表示页面知道自己正在等后端确认。
  const [savingModuleId, setSavingModuleId] = useState<ModuleId | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadModes();
  }, []);

  async function loadModes() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/display-modes", {
        method: "GET",
      });

      const data = (await response.json()) as {
        modes?: DisplayModes;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "加载展示模式失败");
      }

      setModes(data.modes as DisplayModes);
    } catch (error) {
      setError(error instanceof Error ? error.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleModeChange(moduleId: ModuleId, displayMode: DisplayMode) {
    try {
      setSavingModuleId(moduleId);
      setError(null);

      const response = await fetch("/api/admin/display-modes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ moduleId, displayMode }),
      });

      const data = (await response.json()) as {
        modes?: DisplayModes;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "更新展示模式失败");
      }

      setModes(data.modes as DisplayModes);
    } catch (error) {
      setError(error instanceof Error ? error.message : "更新失败");
    } finally {
      setSavingModuleId(null);
    }
  }

  return (
    <section className="space-y-5 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_rgba(28,25,23,0.06)] sm:p-8">
      <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-stone-900 sm:text-2xl">模块展示模式</h2>
          <p className="text-sm leading-6 text-stone-600">在这里切换每个模块展示真实内容还是试玩模式，改动会立即保存。</p>
        </div>
      </div>

      {loading ? <p className="text-sm text-stone-500">加载中...</p> : null}
      {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      {!loading ? (
        <div className="space-y-4">
          {configurableModules.map((module) => {
            const mode = modes[module.id];
            const modeLabel = mode === "real" ? "真实内容" : "试玩模式";
            const disabled = savingModuleId === module.id;

            return (
              <fieldset
                key={module.id}
                className="rounded-3xl border border-stone-200 bg-stone-50/80 p-5 transition hover:border-stone-300 hover:bg-stone-50"
              >
                <legend className="sr-only">{module.title} 展示模式</legend>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-stone-900">{module.title}</h3>
                      <p className="text-sm text-stone-500">路径：{module.route}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-stone-600">
                      <span>当前模式</span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          mode === "real" ? "bg-stone-200 text-stone-700" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        <span className="sr-only">当前：{modeLabel}</span>
                        {modeLabel}
                      </span>
                      {disabled ? <span className="text-xs text-stone-500">保存中...</span> : null}
                    </div>
                  </div>
                  <div className="inline-flex w-full rounded-full border border-stone-200 bg-white p-1 sm:w-auto">
                    <label
                      className={`flex-1 cursor-pointer rounded-full px-4 py-2 text-center text-sm transition sm:flex-none ${
                        mode === "real" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
                      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name={`${module.id}-display-mode`}
                        checked={mode === "real"}
                        disabled={disabled}
                        onChange={() => void handleModeChange(module.id, "real")}
                      />
                      真实内容
                    </label>
                    <label
                      className={`flex-1 cursor-pointer rounded-full px-4 py-2 text-center text-sm transition sm:flex-none ${
                        mode === "demo" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
                      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name={`${module.id}-display-mode`}
                        checked={mode === "demo"}
                        disabled={disabled}
                        onChange={() => void handleModeChange(module.id, "demo")}
                      />
                      试玩模式
                    </label>
                  </div>
                </div>
              </fieldset>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
