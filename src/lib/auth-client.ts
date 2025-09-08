"use client";

import { useEffect, useState } from "react";

export type SessionUser = {
  id: string;
  name?: string;
  email?: string;
  image?: string;
} | null;

export type Session = { user: NonNullable<SessionUser> } | null;

export function useSession() {
  const [data, setData] = useState<Session>(null);
  const [isPending, setIsPending] = useState<boolean>(false);

  const refetch = async () => {
    setIsPending(true);
    try {
      const res = await fetch("/api/auth-working/session", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setData(json?.user ? { user: json.user } : null);
      } else {
        setData(null);
      }
    } catch {
      setData(null);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    void refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, isPending, refetch } as const;
}

export const authClient = {
  async signOut(): Promise<{ error: { code: string; message?: string } | null }> {
    try {
      await fetch("/api/auth-working/session", { method: "DELETE", credentials: "include" });
      return { error: null };
    } catch (e: any) {
      return { error: { code: "SIGN_OUT_FAILED", message: e?.message || "Failed" } };
    }
  },
};