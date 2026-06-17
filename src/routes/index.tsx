import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Mail, FileText, ListChecks, Search, MessagesSquare, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Workhub AI" },
      { name: "description", content: "Your AI workplace productivity suite." },
      { property: "og:title", content: "Dashboard — Workhub AI" },
      { property: "og:description", content: "Your AI workplace productivity suite." },
    ],
  }),
  component: Index,
});

const tools = [
  {
    title: "Smart Email Generator",
    desc: "Draft polished, on-brand emails for any recipient and tone.",
    url: "/email",
    icon: Mail,
  },
  {
    title: "Meeting Notes Summarizer",
    desc: "Turn raw notes into TL;DR, decisions, and action items.",
    url: "/notes",
    icon: FileText,
  },
  {
    title: "AI Task Planner",
    desc: "Break goals into milestones, owners, and estimates.",
    url: "/planner",
    icon: ListChecks,
  },
  {
    title: "AI Research Assistant",
    desc: "Get structured briefings on any topic in seconds.",
    url: "/research",
    icon: Search,
  },
  {
    title: "AI Chat Assistant",
    desc: "Conversational help for any workplace task or question.",
    url: "/chat",
    icon: MessagesSquare,
  },
];

function Index() {
  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
      <section
        className="relative overflow-hidden rounded-2xl p-8 text-primary-foreground shadow-[var(--shadow-elevated)] md:p-10"
        style={{ background: "var(--gradient-brand)" }}
      >
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3 w-3" /> Workhub AI
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            Your AI workspace for everyday work.
          </h1>
          <p className="mt-3 text-sm opacity-90 md:text-base">
            Draft emails, summarize meetings, plan projects, and research topics — all from one
            clean, modern dashboard.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm transition hover:bg-white/90"
            >
              Start a chat <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/email"
              className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-primary-foreground backdrop-blur transition hover:bg-white/20"
            >
              Try Email Generator
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
      </section>

      <h2 className="mt-10 mb-4 text-lg font-semibold tracking-tight">Tools</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.url}
            to={t.url}
            className="group relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-elevated)]"
          >
            <div
              className="grid h-10 w-10 place-items-center rounded-lg text-primary-foreground"
              style={{ background: "var(--gradient-brand)" }}
            >
              <t.icon className="h-4 w-4" />
            </div>
            <h3 className="mt-4 text-base font-semibold tracking-tight">{t.title}</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{t.desc}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
              Open <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
