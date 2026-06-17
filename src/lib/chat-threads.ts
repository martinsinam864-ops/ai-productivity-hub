import type { UIMessage } from "ai";

export type ChatThread = {
  id: string;
  title: string;
  messages: UIMessage[];
  updatedAt: number;
};

export const THREADS_KEY = "workhub:chat-threads";

export function readThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(THREADS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatThread[];
  } catch {
    return [];
  }
}

export function writeThreads(threads: ChatThread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
}

export function makeThread(): ChatThread {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    title: "New conversation",
    messages: [],
    updatedAt: Date.now(),
  };
}

export function deriveTitle(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 48 ? t.slice(0, 48) + "…" : t || "New conversation";
}