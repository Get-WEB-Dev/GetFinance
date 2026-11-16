import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentCountry } from "@/lib/country/server";
import { buildFacts } from "@/lib/ai/facts";
import { fallbackAnswer } from "@/lib/ai/fallback";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { getProviders } from "@/lib/ai/providers";
import { allowRequest } from "@/lib/ai/rate-limit";
import { redact } from "@/lib/ai/redact";

const bodySchema = z.object({
  page: z.string().max(200).default("/"),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(1000),
      }),
    )
    .min(1)
    .max(20),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowRequest(ip)) {
    return NextResponse.json(
      { error: "You're asking quickly. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { messages, page } = parsed.data;
  const country = await getCurrentCountry();
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) return NextResponse.json({ error: "No question." }, { status: 400 });

  const facts = buildFacts(country, lastUser.content);
  const chat = [
    { role: "system" as const, content: buildSystemPrompt(facts.text, page) },
    ...messages.slice(-8).map((m) => ({ role: m.role, content: redact(m.content) })),
  ];

  for (const provider of getProviders()) {
    try {
      const reply = await provider.chat(chat);
      return NextResponse.json({ reply, source: provider.name });
    } catch {
      // try the next provider
    }
  }

  return NextResponse.json({
    reply: fallbackAnswer(country, facts, lastUser.content),
    source: "rules",
  });
}