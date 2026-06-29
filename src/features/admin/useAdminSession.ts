"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type AdminSessionResult = {
  authenticated: boolean;
  error?: string;
};

export function useAdminSession() {
  const [adminToken, setAdminToken] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  const refreshAdminSession = useCallback(async () => {
    try {
      setIsAdminLoading(true);
      const response = await fetch("/api/admin/session", { credentials: "same-origin" });
      const data = (await response.json().catch(() => ({ authenticated: false }))) as AdminSessionResult;

      setIsAdminUnlocked(Boolean(response.ok && data.authenticated));
    } catch {
      setIsAdminUnlocked(false);
    } finally {
      setIsAdminLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAdminSession();
  }, [refreshAdminSession]);

  async function unlockAdmin(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const token = adminToken.trim();

    if (!token) {
      setAdminError("请输入管理 Token");
      return;
    }

    try {
      setIsAdminSubmitting(true);
      setAdminError(null);
      const response = await fetch("/api/admin/session", {
        body: JSON.stringify({ token }),
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = (await response.json().catch(() => ({}))) as AdminSessionResult;

      if (!response.ok) {
        throw new Error(data.error ?? "解锁后台失败");
      }

      setAdminToken("");
      setIsAdminUnlocked(true);
    } catch (error) {
      setIsAdminUnlocked(false);
      setAdminError(error instanceof Error ? error.message : "解锁后台失败");
    } finally {
      setIsAdminSubmitting(false);
    }
  }

  async function lockAdmin() {
    try {
      setIsAdminSubmitting(true);
      setAdminError(null);
      await fetch("/api/admin/session", {
        credentials: "same-origin",
        method: "DELETE",
      });
    } catch {
      // 即使退出请求失败，也先把本地管理态收起，避免继续显示可管理状态。
    } finally {
      setAdminToken("");
      setIsAdminUnlocked(false);
      setIsAdminSubmitting(false);
    }
  }

  return {
    adminError,
    adminToken,
    isAdminLoading,
    isAdminSubmitting,
    isAdminUnlocked,
    lockAdmin,
    refreshAdminSession,
    setAdminError,
    setAdminToken,
    unlockAdmin,
  };
}
