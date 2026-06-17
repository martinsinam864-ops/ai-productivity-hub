import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ListChecks, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToolShell } from "@/components/ToolShell";
import { EditableOutput } from "@/components/EditableOutput";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { planTasks } from "@/lib/ai-tools.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Workhub AI" },
      { name: "description", content: "Break goals into milestones and tasks with AI." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const [saved, setSaved] = useLocalStorage("tool:planner", {
    goal: "",
    deadline: "",
    context: "",
    output: "",
  });
  const [loading, setLoading] = useState(false);
  const fn = useServerFn(planTasks);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saved.goal.trim()) {
      toast.error("Describe your goal.");
      return;
    }
    setLoading(true);
    try {
      const res = await fn({
        data: { goal: saved.goal, deadline: saved.deadline, context: saved.context },
      });
      setSaved((s) => ({ ...s, output: res.text }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell
      title="AI Task Planner"
      description="Turn any goal into a sequenced plan with milestones, tasks, and risks."
      icon={<ListChecks className="h-5 w-5" />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={submit}
          className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Goal</Label>
              <Input
                placeholder="e.g. Launch new pricing page"
                value={saved.goal}
                onChange={(e) => setSaved((s) => ({ ...s, goal: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Deadline (optional)</Label>
              <Input
                placeholder="e.g. End of Q3"
                value={saved.deadline}
                onChange={(e) => setSaved((s) => ({ ...s, deadline: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Context (optional)</Label>
              <Textarea
                rows={5}
                placeholder="Team size, constraints, existing assets..."
                value={saved.context}
                onChange={(e) => setSaved((s) => ({ ...s, context: e.target.value }))}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              <Sparkles className="h-4 w-4" />
              {loading ? "Planning..." : "Generate plan"}
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
              Your plan will appear here.
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}