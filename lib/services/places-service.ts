import { z } from "zod";
import type { PlacesOutcome } from "@/types/places";
import type { CountryCode } from "@/config/countries";

export interface PlacesService {
  search(query: string, country: CountryCode, signal?: AbortSignal): Promise<PlacesOutcome>;
}

const suggestionSchema = z.object({
  id: z.string(),
  label: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
});

const outcomeSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("ok"), suggestions: z.array(suggestionSchema) }),
  z.object({ status: z.literal("error"), message: z.string() }),
]);

const UNAVAILABLE: PlacesOutcome = {
  status: "error",
  message: "Address search is unavailable right now.",
};

export class HttpPlacesService implements PlacesService {
  private readonly endpoint: string;

  constructor(endpoint = "/api/places/search") {
    this.endpoint = endpoint;
  }

  async search(query: string, country: CountryCode, signal?: AbortSignal): Promise<PlacesOutcome> {
    try {
        const response = await fetch(
        `${this.endpoint}?q=${encodeURIComponent(query)}&country=${encodeURIComponent(country)}`,
        { signal },
      );
      const parsed = outcomeSchema.safeParse(await response.json());
      return parsed.success ? parsed.data : UNAVAILABLE;
    } catch {
      return UNAVAILABLE;
    }
  }
}