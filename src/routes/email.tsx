import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolShell } from "@/components/ToolShell";
import { EditableOutput } from "@/components/EditableOutput";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { generateEmail } from "@/lib/ai-tools.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workhub AI" },
      { name: "description", content: "Draft polished business emails with AI." },
    ],
  }),
  component: EmailPage,
});

type Saved = { recipient: string; purpose: string; tone: string; keyPoints: string; output: string };

function EmailPage() {
  const [saved, setSaved] = useLocalStorage<Saved>("tool:email", {
    recipient: "",
    purpose: "",
    tone: "friendly",
    keyPoints: "",
    output: "",
  });
  const [loading, setLoading] = useState(false);
  const fn = useServerFn(generateEmail);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!saved.recipient.trim() || !saved.purpose.trim()) {
      toast.error("Please fill in recipient and purpose.");
      return;
    }
    setLoading(true);
    try {
      const res = await fn({
        data: {
          recipient: saved.recipient,
          purpose: saved.purpose,
          tone: saved.tone as "formal" | "friendly" | "concise" | "persuasive" | "apologetic",
          keyPoints: saved.keyPoints,
        },
      });
      setSaved((s) => ({ ...s, output: res.text }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell
      title="Smart Email Generator"
      description="Describe your recipient and purpose — get a polished, ready-to-send draft."
      icon={<Mail className="h-5 w-5" />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={submit}
          className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Recipient</Label>
              <Input
                placeholder="e.g. Sarah from the design team"
                value={saved.recipient}
                onChange={(e) => setSaved((s) => ({ ...s, recipient: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Purpose</Label>
              <Input
                placeholder="e.g. Follow up on last week's design review"
                value={saved.purpose}
                onChange={(e) => setSaved((s) => ({ ...s, purpose: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select
                value={saved.tone}
                onValueChange={(v) => setSaved((s) => ({ ...s, tone: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="apologetic">Apologetic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Key points (optional)</Label>
              <Textarea
                rows={4}
                placeholder="Bullet any facts, dates, or asks you want included."
                value={saved.keyPoints}
                onChange={(e) => setSaved((s) => ({ ...s, keyPoints: e.target.value }))}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              <Sparkles className="h-4 w-4" />
              {loading ? "Drafting..." : "Generate email"}
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
              Your draft email will appear here.
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}