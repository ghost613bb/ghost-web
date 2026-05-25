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

      if (!response.ok) {
        throw new Error("加载展示模式失败");
      }

      const data = (await response.json()) as { modes: DisplayModes };
      setModes(data.modes);
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

      if (!response.ok) {
        throw new Error("更新展示模式失败");
      }

      const data = (await response.json()) as { modes: DisplayModes };
      setModes(data.modes);
    } catch (error) {
      setError(error instanceof Error ? error.message : "更新失败");
    } finally {
      setSavingModuleId(null);
    }
  }

  return (
    <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">模块展示模式</h2>
        <p className="text-sm text-white/65">当前改成接口版读取与保存，后面再继续替换成真实数据库。</p>
      </div>

      {loading ? <p className="text-sm text-white/70">加载中...</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {!loading ? (
        <div className="space-y-4">
          {configurableModules.map((module) => {
            const mode = modes[module.id];
            const modeLabel = mode === "real" ? "真实内容" : "试玩模式";
            const disabled = savingModuleId === module.id;

            return (
              <fieldset key={module.id} className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <legend className="px-1 text-base font-medium text-white">{module.title} 展示模式</legend>
                <div className="space-y-1 text-sm text-white/70">
                  <p>路径：{module.route}</p>
                  <p>当前：{modeLabel}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-white">
                    <input
                      type="radio"
                      name={`${module.id}-display-mode`}
                      checked={mode === "real"}
                      disabled={disabled}
                      onChange={() => void handleModeChange(module.id, "real")}
                    />
                    真实内容
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-white">
                    <input
                      type="radio"
                      name={`${module.id}-display-mode`}
                      checked={mode === "demo"}
                      disabled={disabled}
                      onChange={() => void handleModeChange(module.id, "demo")}
                    />
                    试玩模式
                  </label>
                </div>
              </fieldset>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
