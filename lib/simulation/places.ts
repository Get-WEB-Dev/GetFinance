import type { AddressSuggestion, PlacesOutcome } from "@/types/places";

export const PLACES_ERROR_QUERY = "error";
export const PLACES_MIN_QUERY_LENGTH = 3;
const MAX_RESULTS = 5;

type RawAddress = Omit<AddressSuggestion, "id" | "label">;

const rawAddresses: RawAddress[] = [
  { addressLine1: "14 MG Road", addressLine2: "Camp", city: "Pune", state: "Maharashtra", pincode: "411001" },
  { addressLine1: "22 FC Road", addressLine2: "Shivajinagar", city: "Pune", state: "Maharashtra", pincode: "411005" },
  { addressLine1: "8 Marine Drive", addressLine2: "Nariman Point", city: "Mumbai", state: "Maharashtra", pincode: "400021" },
  { addressLine1: "31 Linking Road", addressLine2: "Bandra West", city: "Mumbai", state: "Maharashtra", pincode: "400050" },
  { addressLine1: "5 MG Road", addressLine2: "Ashok Nagar", city: "Bengaluru", state: "Karnataka", pincode: "560001" },
  { addressLine1: "47 Indiranagar 100 Feet Road", addressLine2: "Indiranagar", city: "Bengaluru", state: "Karnataka", pincode: "560038" },
  { addressLine1: "19 Connaught Place", addressLine2: "Block A", city: "New Delhi", state: "Delhi", pincode: "110001" },
  { addressLine1: "63 Anna Salai", addressLine2: "Teynampet", city: "Chennai", state: "Tamil Nadu", pincode: "600018" },
  { addressLine1: "27 Banjara Hills Road No. 12", addressLine2: "Banjara Hills", city: "Hyderabad", state: "Telangana", pincode: "500034" },
  { addressLine1: "9 Park Street", addressLine2: "Park Street Area", city: "Kolkata", state: "West Bengal", pincode: "700016" },
  { addressLine1: "40 CG Road", addressLine2: "Navrangpura", city: "Ahmedabad", state: "Gujarat", pincode: "380009" },
  { addressLine1: "12 MI Road", addressLine2: "Panch Batti", city: "Jaipur", state: "Rajasthan", pincode: "302001" },
  { addressLine1: "6 Marine Drive", addressLine2: "Ernakulam", city: "Kochi", state: "Kerala", pincode: "682031" },
];

export const demoAddresses: AddressSuggestion[] = rawAddresses.map((address, index) => ({
  id: `demo-${index + 1}`,
  label: `${address.addressLine1}, ${address.addressLine2}, ${address.city}, ${address.state} ${address.pincode}`,
  ...address,
}));

export function simulatePlacesSearch(rawQuery: string): PlacesOutcome {
  const query = rawQuery.trim().toLowerCase();

  if (query === PLACES_ERROR_QUERY) {
    return { status: "error", message: "The simulated address service is unavailable." };
  }
  if (query.length < PLACES_MIN_QUERY_LENGTH) {
    return { status: "ok", suggestions: [] };
  }

  const tokens = query.split(/\s+/);
  const suggestions = demoAddresses
    .filter((address) => tokens.every((token) => address.label.toLowerCase().includes(token)))
    .slice(0, MAX_RESULTS);

  return { status: "ok", suggestions };
}