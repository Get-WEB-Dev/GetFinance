import { DEFAULT_COUNTRY, type CountryCode } from "@/config/countries";
import type { AddressSuggestion, PlacesOutcome } from "@/types/places";

export const PLACES_ERROR_QUERY = "error";
export const PLACES_MIN_QUERY_LENGTH = 3;
const MAX_RESULTS = 5;

type Row = [addressLine1: string, addressLine2: string, city: string, state: string, pincode: string];

// Invented sample addresses for demos only.
const rows: Record<CountryCode, Row[]> = {
  ET: [
    ["Bole Sub-city, Woreda 03, House 1204", "Near Bole Medhanialem", "Addis Ababa", "Addis Ababa", "1000"],
    ["Kirkos Sub-city, Woreda 09, House 311", "Kazanchis area", "Addis Ababa", "Addis Ababa", "1000"],
    ["Piassa, Woreda 01, House 58", "Arada Sub-city", "Addis Ababa", "Addis Ababa", ""],
    ["Tabor Sub-city, Kebele 04, House 207", "Near Lake Hawassa", "Hawassa", "Sidama", "45"],
    ["Kebele 11, House 902", "Bahir Dar Sub-city", "Bahir Dar", "Amhara", "79"],
    ["Woreda 02, House 66", "Near Franco", "Adama", "Oromia", ""],
    ["Kebele 03, House 140", "Dire Dawa city centre", "Dire Dawa", "Dire Dawa", ""],
    ["Kebele 07, House 515", "Mekelle city centre", "Mekelle", "Tigray", ""],
  ],
  US: [
    ["120 Market Street", "Suite 4", "San Francisco", "California", "94105"],
    ["48 Congress Avenue", "Unit 12", "Austin", "Texas", "78701"],
    ["305 Pine Street", "Apt 6B", "Seattle", "Washington", "98101"],
    ["77 Broad Street", "Floor 3", "New York", "New York", "10004"],
    ["915 Michigan Avenue", "Unit 22", "Chicago", "Illinois", "60611"],
    ["210 Peachtree Street", "Suite 900", "Atlanta", "Georgia", "30303"],
    ["64 Larimer Street", "Apt 3", "Denver", "Colorado", "80202"],
    ["880 Brickell Avenue", "Unit 15", "Miami", "Florida", "33131"],
    ["58 Elm Street", "Apt 2", "Portland", "Oregon", "97204"],
    ["300 Main Street", "Suite 7", "Boston", "Massachusetts", "02110"],
  ],
  GB: [
    ["14 High Street", "Flat 2", "London", "England", "EC1A 1BB"],
    ["32 Deansgate", "Floor 1", "Manchester", "England", "M1 1AE"],
    ["9 Corporation Street", "Unit 5", "Birmingham", "England", "B1 1BB"],
    ["21 Royal Mile", "Flat 3", "Edinburgh", "Scotland", "EH1 1YZ"],
    ["5 Queen Street", "Suite 2", "Cardiff", "Wales", "CF10 1EP"],
    ["18 Donegall Place", "Flat 4", "Belfast", "Northern Ireland", "BT1 5GS"],
    ["27 Briggate", "Unit 8", "Leeds", "England", "LS1 4AP"],
    ["11 Park Street", "Flat 1", "Bristol", "England", "BS1 4DJ"],
  ],
};

function build(country: CountryCode, list: Row[]): AddressSuggestion[] {
  return list.map(([addressLine1, addressLine2, city, state, pincode], index) => ({
    id: `demo-${country.toLowerCase()}-${index + 1}`,
    label: `${addressLine1}, ${addressLine2}, ${city}, ${state}${pincode ? ` ${pincode}` : ""}`,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
  }));
}

export const demoAddressesByCountry: Record<CountryCode, AddressSuggestion[]> = {
  ET: build("ET", rows.ET),
  US: build("US", rows.US),
  GB: build("GB", rows.GB),
};

export function simulatePlacesSearch(rawQuery: string, country: CountryCode = DEFAULT_COUNTRY): PlacesOutcome {
  const query = rawQuery.trim().toLowerCase();

  if (query === PLACES_ERROR_QUERY) {
    return { status: "error", message: "The simulated address service is unavailable." };
  }
  if (query.length < PLACES_MIN_QUERY_LENGTH) {
    return { status: "ok", suggestions: [] };
  }

  const tokens = query.split(/\s+/);
  const suggestions = demoAddressesByCountry[country]
    .filter((address) => tokens.every((token) => address.label.toLowerCase().includes(token)))
    .slice(0, MAX_RESULTS);

  return { status: "ok", suggestions };
}