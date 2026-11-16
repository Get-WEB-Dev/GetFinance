export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiProvider {
  name: string;
  chat(messages: ChatMessage[]): Promise<string>;
}

class OpenAiCompatibleProvider implements AiProvider {
  constructor(
    public name: string,
    private baseUrl: string,
    private apiKey: string,
    private model: string,
  ) {}

  async chat(messages: ChatMessage[]): Promise<string> {
    const res = await fetch(`${this.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.2,
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`${this.name} responded ${res.status}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error(`${this.name} returned no text`);
    return text;
  }
}

export function getProviders(): AiProvider[] {
  const env = process.env;
  const list: AiProvider[] = [];

  if (env.GEMINI_API_KEY) {
    list.push(
      new OpenAiCompatibleProvider(
        "gemini",
        "https://generativelanguage.googleapis.com/v1beta/openai",
        env.GEMINI_API_KEY,
        env.GEMINI_MODEL || "gemini-3.5-flash-lite",
      ),
    );
  }
  if (env.GROQ_API_KEY) {
    list.push(
      new OpenAiCompatibleProvider(
        "groq",
        "https://api.groq.com/openai/v1",
        env.GROQ_API_KEY,
        env.GROQ_MODEL || "llama-3.3-70b-versatile",
      ),
    );
  }
  if (env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_API_TOKEN) {
    list.push(
      new OpenAiCompatibleProvider(
        "cloudflare",
        `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
        env.CLOUDFLARE_API_TOKEN,
        env.CLOUDFLARE_MODEL || "@cf/meta/llama-3.1-8b-instruct",
      ),
    );
  }
  return list;
}