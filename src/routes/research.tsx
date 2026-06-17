import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Search, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { researchTopic } from "@/lib/ai-tools.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workhub AI" },
      { name: "description", content: "Get structured briefings on any topic." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [saved, setSaved] = useLocalStorage("tool:research", {
    topic: "",
    audience: "general professional audience",
    depth: "standard",
    output: "",
  });
  const [loading, setLoading] = useState(false);
  const fn = useServerFn(researchTopic);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!saved.topic.trim()) {
      toast.error("Enter a topic.");
      return;
    }
    setLoading(true);
    try {
      const res = await fn({
        data: {
          topic: saved.topic,
          audience: saved.audience,
          depth: saved.depth as "brief" | "standard" | "deep",
        },
      });
      setSaved((s) => ({ ...s, output: res.text }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to research.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell
      title="AI Research Assistant"
      description="Get an executive briefing with themes, opportunities, risks, and next steps."
      icon={<Search className="h-5 w-5" />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={submit}
          className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Topic</Label>
              <Input
                placeholder="e.g. Adoption of AI coding assistants in enterprise"
                value={saved.topic}
                onChange={(e) => setSaved((s) => ({ ...s, topic: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Input
                value={saved.audience}
                onChange={(e) => setSaved((s) => ({ ...s, audience: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Depth</Label>
              <Select
                value={saved.depth}
                onValueChange={(v) => setSaved((s) => ({ ...s, depth: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="deep">Deep</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              <Sparkles className="h-4 w-4" />
              {loading ? "Researching..." : "Generate briefing"}
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
              Your briefing will appear here.
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}