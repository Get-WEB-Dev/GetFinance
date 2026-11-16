"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { CountryCode } from "@/config/countries";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS: Record<CountryCode, string[]> = {
  ET: ["What would 500,000 over 3 years cost?", "Which loan fits me?", "What documents do I need?"],
  US: ["What would $25,000 over 36 months cost?", "Which loan fits me?", "What documents do I need?"],
  GB: ["What would £10,000 over 24 months cost?", "Which loan fits me?", "What documents do I need?"],
};

export function AssistantPanel({ country }: { country: CountryCode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading, open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: pathname, messages: next }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setMessages([
        ...next,
        { role: "assistant", content: data.reply ?? data.error ?? "Sorry, something went wrong." },
      ]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "I couldn't reach the assistant. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <section
          aria-label="GetFinance assistant"
          className="flex h-[32rem] max-h-[80vh] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        >
          <header className="flex items-center justify-between bg-navy-900 px-4 py-3 text-white">
            <h2 className="text-sm font-semibold">Ask GetFinance</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="rounded px-2 text-lg leading-none hover:bg-white/10"
            >
              ×
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm" aria-live="polite">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-slate-600">
                  I can calculate payments, explain loans and guide you. I never decide
                  eligibility, and please don&apos;t type ID numbers.
                </p>
                {SUGGESTIONS[country].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <p
                key={i}
                className={
                  m.role === "user"
                    ? "ml-8 whitespace-pre-wrap rounded-lg bg-navy-900 px-3 py-2 text-white"
                    : "mr-8 whitespace-pre-wrap rounded-lg bg-slate-100 px-3 py-2 text-slate-800"
                }
              >
                {m.content}
              </p>
            ))}
            {loading && <p className="text-slate-500">Thinking…</p>}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex gap-2 border-t border-slate-200 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Ask a question…"
              aria-label="Your question"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-navy-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
          <p className="px-4 pb-2 text-[11px] text-slate-500">
            AI guidance only. Not financial advice or an offer.
          </p>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          className="rounded-full bg-navy-900 px-5 py-3 text-sm font-medium text-white shadow-lg hover:opacity-90"
        >
          Ask AI
        </button>
      )}
    </div>
  );
}