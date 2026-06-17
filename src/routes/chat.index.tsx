import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { MessagesSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readThreads, writeThreads, makeThread } from "@/lib/chat-threads";

export const Route = createFileRoute("/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const existing = readThreads().sort((a, b) => b.updatedAt - a.updatedAt);
    if (existing[0]) {
      navigate({ to: "/chat/$threadId", params: { threadId: existing[0].id }, replace: true });
    }
  }, [navigate]);

  const newChat = () => {
    const t = makeThread();
    const next = [t, ...readThreads()];
    writeThreads(next);
    window.dispatchEvent(new Event("workhub:threads-updated"));
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div
          className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-primary-foreground shadow-[var(--shadow-soft)]"
          style={{ background: "var(--gradient-brand)" }}
        >
          <MessagesSquare className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Workhub Chat</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask anything about emails, meetings, planning, or research. Start a new conversation to
          begin.
        </p>
        <Button onClick={newChat} className="mt-6">
          <Plus className="h-4 w-4" /> New conversation
        </Button>
      </div>
    </div>
  );
}