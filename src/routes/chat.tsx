import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessagesSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readThreads, writeThreads, makeThread, type ChatThread } from "@/lib/chat-threads";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat Assistant — Workhub AI" },
      { name: "description", content: "Conversational AI for everyday workplace help." },
    ],
  }),
  component: ChatLayout,
});

function ChatLayout() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const activeId = pathname.startsWith("/chat/") ? pathname.slice("/chat/".length) : null;

  useEffect(() => {
    setThreads(readThreads().sort((a, b) => b.updatedAt - a.updatedAt));
    const onStorage = () =>
      setThreads(readThreads().sort((a, b) => b.updatedAt - a.updatedAt));
    window.addEventListener("workhub:threads-updated", onStorage);
    return () => window.removeEventListener("workhub:threads-updated", onStorage);
  }, []);

  const newChat = () => {
    const t = makeThread();
    const next = [t, ...threads];
    writeThreads(next);
    setThreads(next);
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };

  const deleteThread = (id: string) => {
    const next = threads.filter((t) => t.id !== id);
    writeThreads(next);
    setThreads(next);
    if (activeId === id) navigate({ to: "/chat" });
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 w-full">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
        <div className="border-b border-border p-3">
          <Button onClick={newChat} className="w-full">
            <Plus className="h-4 w-4" /> New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {threads.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              No conversations yet.
            </p>
          ) : (
            <ul className="space-y-1">
              {threads.map((t) => (
                <li key={t.id} className="group relative">
                  <Link
                    to="/chat/$threadId"
                    params={{ threadId: t.id }}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 pr-8 text-sm transition",
                      activeId === t.id
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <MessagesSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{t.title}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteThread(t.id)}
                    aria-label="Delete conversation"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}