export interface AddressSuggestion {
  id: string;
  label: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

export type PlacesOutcome =
  | { status: "ok"; suggestions: AddressSuggestion[] }
  | { status: "error"; message: string };