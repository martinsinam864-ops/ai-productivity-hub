import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { readThreads, writeThreads, deriveTitle } from "@/lib/chat-threads";

export const Route = createFileRoute("/chat/$threadId")({
  component: ChatThreadPage,
});

function ChatThreadPage() {
  const { threadId } = useParams({ from: "/chat/$threadId" });
  return <ChatWindow key={threadId} threadId={threadId} />;
}

function ChatWindow({ threadId }: { threadId: string }) {
  const initial = useMemo<UIMessage[]>(() => {
    if (typeof window === "undefined") return [];
    const t = readThreads().find((x) => x.id === threadId);
    return t?.messages ?? [];
  }, [threadId]);

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initial,
    transport,
    onError: (e) => toast.error(e.message || "Chat error"),
  });

  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";

  // Persist messages whenever they change
  useEffect(() => {
    const all = readThreads();
    const idx = all.findIndex((t) => t.id === threadId);
    const firstUser = messages.find((m) => m.role === "user");
    const firstText =
      firstUser?.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ") ?? "";
    const title = firstText ? deriveTitle(firstText) : "New conversation";
    const updated = { id: threadId, messages, title, updatedAt: Date.now() };
    if (idx === -1) all.unshift(updated);
    else all[idx] = updated;
    writeThreads(all);
    window.dispatchEvent(new Event("workhub:threads-updated"));
  }, [messages, threadId]);

  const handleSubmit = (message: { text: string }) => {
    const text = (message.text ?? input).trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl px-4 py-6">
          {messages.length === 0 && (
            <div className="mx-auto mt-10 max-w-md text-center">
              <div
                className="mx-auto grid h-12 w-12 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-soft)]"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold tracking-tight">
                How can I help you today?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try "Draft a follow-up email to my client" or "Summarize my last meeting notes".
              </p>
            </div>
          )}
          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            return (
              <Message key={m.id} from={m.role}>
                <MessageContent>
                  {m.role === "assistant" ? (
                    <MessageResponse>{text}</MessageResponse>
                  ) : (
                    <p className="whitespace-pre-wrap">{text}</p>
                  )}
                </MessageContent>
              </Message>
            );
          })}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
          {error && (
            <div className="mx-auto mt-2 flex max-w-md items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5" /> {error.message}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              autoFocus
              placeholder="Message Workhub AI…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between gap-2 px-2 pb-2">
              <p className="text-[10px] text-muted-foreground">
                AI can make mistakes. Verify important info.
              </p>
              <PromptInputSubmit status={status} disabled={!input.trim() || isLoading} />
            </div>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}