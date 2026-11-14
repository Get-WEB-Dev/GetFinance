import { NextResponse } from "next/server";
import { z } from "zod";
import { isCountryCode, type CountryCode } from "@/config/countries";
import { simulateIdentityCheck } from "@/lib/simulation/identity";

const bodySchema = z.object({
  kind: z.enum(["primary", "secondary"]),
  country: z.custom<CountryCode>((v) => typeof v === "string" && isCountryCode(v)),
  value: z.string().max(32),
  attempt: z.number().int().min(1).max(20),
});

function delayMs(): number {
  const configured = Number(process.env.SIMULATED_DELAY_MS ?? 1200);
  return Number.isFinite(configured) && configured >= 0 ? configured : 1200;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "The request could not be read.", simulated: true },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "error", message: "The request was not valid.", simulated: true },
      { status: 400 },
    );
  }

  await new Promise((resolve) => setTimeout(resolve, delayMs()));

  const { kind, country, value, attempt } = parsed.data;
  const outcome = simulateIdentityCheck(kind, value, attempt, country);

  return NextResponse.json(
    { ...outcome, simulated: true },
    { status: outcome.status === "error" ? 503 : 200 },
  );
}