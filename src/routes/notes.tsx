import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToolShell } from "@/components/ToolShell";
import { EditableOutput } from "@/components/EditableOutput";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { summarizeNotes } from "@/lib/ai-tools.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Workhub AI" },
      { name: "description", content: "Turn raw meeting notes into structured summaries." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const [saved, setSaved] = useLocalStorage("tool:notes", { notes: "", output: "" });
  const [loading, setLoading] = useState(false);
  const fn = useServerFn(summarizeNotes);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saved.notes.trim().length < 10) {
      toast.error("Paste at least a few lines of notes.");
      return;
    }
    setLoading(true);
    try {
      const res = await fn({ data: { notes: saved.notes } });
      setSaved((s) => ({ ...s, output: res.text }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to summarize.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell
      title="Meeting Notes Summarizer"
      description="Paste raw notes or a transcript — get TL;DR, decisions, and action items."
      icon={<FileText className="h-5 w-5" />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={submit}
          className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Raw meeting notes or transcript</Label>
              <Textarea
                rows={16}
                placeholder="Paste your notes here..."
                value={saved.notes}
                onChange={(e) => setSaved((s) => ({ ...s, notes: e.target.value }))}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              <Sparkles className="h-4 w-4" />
              {loading ? "Summarizing..." : "Summarize notes"}
            </Button>
          </div>
        </form>
        <div>
          <EditableOutput
            value={saved.output}
            onChange={(v) => setSaved((s) => ({ ...s, output: v }))}
            loading={loading}
          />
          {!saved.output && !loading && (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
              Your structured summary will appear here.
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}