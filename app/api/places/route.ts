import { NextResponse } from "next/server";
import { z } from "zod";
import { simulatedDelay } from "@/lib/simulation/delay";
import { simulatePlacesSearch } from "@/lib/simulation/places";

const querySchema = z.string().trim().min(3).max(100);

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const parsed = querySchema.safeParse(query);

  if (!parsed.success) {
    return NextResponse.json(
      { status: "error", message: "Enter at least 3 characters.", simulated: true },
      { status: 400 },
    );
  }

  await simulatedDelay(400);

  const result = simulatePlacesSearch(parsed.data);
  return NextResponse.json(
    { ...result, simulated: true },
    { status: result.status === "error" ? 503 : 200 },
  );
}
