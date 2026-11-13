import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_COUNTRY, isCountryCode } from "@/config/countries";
import { simulatedDelay } from "@/lib/simulation/delay";
import { simulatePlacesSearch } from "@/lib/simulation/places";

const querySchema = z.string().trim().min(3).max(100);

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const parsed = querySchema.safeParse(params.get("q") ?? "");
  const country = params.get("country") ?? DEFAULT_COUNTRY;

  if (!parsed.success) {
    return NextResponse.json(
      { status: "error", message: "Enter at least 3 characters.", simulated: true },
      { status: 400 },
    );
  }
  if (!isCountryCode(country)) {
    return NextResponse.json(
      { status: "error", message: "Unknown country.", simulated: true },
      { status: 400 },
    );
  }

  await simulatedDelay(400);

  const result = simulatePlacesSearch(parsed.data, country);
  return NextResponse.json(
    { ...result, simulated: true },
    { status: result.status === "error" ? 503 : 200 },
  );
}