import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

/** Smart Email Generator */
const EmailInput = z.object({
  recipient: z.string().min(1),
  purpose: z.string().min(1),
  tone: z.enum(["formal", "friendly", "concise", "persuasive", "apologetic"]),
  keyPoints: z.string().optional().default(""),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are an expert workplace communication assistant. Write polished, ready-to-send business emails. Always include a subject line on the first line prefixed with 'Subject:'. Keep emails clear and appropriately concise.",
      prompt: `Recipient: ${data.recipient}
Purpose: ${data.purpose}
Tone: ${data.tone}
Key points to include: ${data.keyPoints || "(none)"}

Write the full email now.`,
    });
    return { text };
  });

/** Meeting Notes Summarizer */
const NotesInput = z.object({
  notes: z.string().min(10),
});

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => NotesInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You summarize meeting notes for busy professionals. Always return markdown with these sections in order: ## TL;DR (2-3 sentences), ## Key Discussion Points (bullets), ## Decisions (bullets), ## Action Items (table with columns: Owner | Task | Due). Be faithful to the source — never invent participants or commitments.",
      prompt: `Summarize the following meeting notes:\n\n${data.notes}`,
    });
    return { text };
  });

/** AI Task Planner */
const PlanInput = z.object({
  goal: z.string().min(3),
  deadline: z.string().optional().default(""),
  context: z.string().optional().default(""),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlanInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are a senior project planner. Break goals into a realistic, sequenced plan. Return markdown with: ## Overview, ## Milestones (numbered, each with target date if a deadline was given), ## Task Breakdown (table: # | Task | Owner suggestion | Estimate | Priority), ## Risks & Dependencies.",
      prompt: `Goal: ${data.goal}
Deadline: ${data.deadline || "(flexible)"}
Context: ${data.context || "(none)"}

Generate the plan.`,
    });
    return { text };
  });

/** AI Research Assistant */
const ResearchInput = z.object({
  topic: z.string().min(3),
  audience: z.string().optional().default("general professional audience"),
  depth: z.enum(["brief", "standard", "deep"]).default("standard"),
});

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are a research analyst. Produce structured briefings using only knowledge you are confident about; when uncertain, say so explicitly. Always return markdown with: ## Executive Summary, ## Background, ## Key Themes (bulleted), ## Opportunities, ## Risks / Open Questions, ## Suggested Next Steps. Do not fabricate citations or statistics.",
      prompt: `Topic: ${data.topic}
Audience: ${data.audience}
Depth: ${data.depth}

Produce the briefing.`,
    });
    return { text };
  });