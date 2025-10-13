export const VALID_JOURNEYS = [
  "airport to campus",
  "airport(T1) to campus",
  "airport(T2) to campus",
  "airport(T3) to campus",
  "campus to airport",
  "campus to airport(T1)",
  "campus to airport(T2)",
  "campus to airport(T3)",
  "airport to jahangirpuri",
  "jahangirpuri to airport",
  "airport to azadpur",
  "azadpur to airport",
  "jahangirpuri to campus",
  "azadpur to campus",
  "campus to jahangirpuri",
  "campus to azadpur",
  "campus to new delhi",
  "new delhi to campus",
  "new delhi to jahangirpuri",
  "jahangirpuri to new delhi",
  "gurgaon to campus",
  "campus to gurgaon",
  "campus to chandigarh",
  "chandigarh to campus",
  "campus to jaipur",
  "jaipur to campus",
  "campus to ludhiana",
  "ludhiana to campus",
  "campus to noida",
  "noida to campus",
  "campus to ghaziabad",
  "ghaziabad to campus",
  "campus to nizamuddin",
  "nizamuddin to campus",
  "campus to agra",
  "agra to campus"
]

const JOURNEY_MAPPINGS: Record<string, string> = {
  "airport (t1) to campus": "airport(T1) to campus",
  "airport (t2) to campus": "airport(T2) to campus",
  "airport (t3) to campus": "airport(T3) to campus",
  "campus to airport (t1)": "campus to airport(T1)",
  "campus to airport (t2)": "campus to airport(T2)",
  "campus to airport (t3)": "campus to airport(T3)",
  "airport (t1) to jahangirpuri": "airport to jahangirpuri",
  "airport (t2) to jahangirpuri": "airport to jahangirpuri",
  "airport (t3) to jahangirpuri": "airport to jahangirpuri",
  "jahangirpuri to airport (t1)": "jahangirpuri to airport",
  "jahangirpuri to airport (t2)": "jahangirpuri to airport",
  "jahangirpuri to airport (t3)": "jahangirpuri to airport",
  "airport (t1) to azadpur": "airport to azadpur",
  "airport (t2) to azadpur": "airport to azadpur",
  "airport (t3) to azadpur": "airport to azadpur",
  "azadpur to airport (t1)": "azadpur to airport",
  "azadpur to airport (t2)": "azadpur to airport",
  "azadpur to airport (t3)": "azadpur to airport",
  "airport to jahangirpuri": "airport to jahangirpuri",
  "jahangirpuri to airport": "jahangirpuri to airport",
  "jahangirpuri to campus": "jahangirpuri to campus",
  "azadpur to campus": "azadpur to campus",
  "campus to jahangirpuri": "campus to jahangirpuri",
  "campus to azadpur": "campus to azadpur",
  "campus to new delhi": "campus to new delhi",
  "new delhi to campus": "new delhi to campus",
  "new delhi to jahangirpuri": "new delhi to jahangirpuri",
  "jahangirpuri to new delhi": "jahangirpuri to new delhi",
  "gurgaon to campus": "gurgaon to campus",
  "campus to gurgaon": "campus to gurgaon",
  "campus to chandigarh": "campus to chandigarh",
  "chandigarh to campus": "chandigarh to campus",
  "campus to jaipur": "campus to jaipur",
  "jaipur to campus": "jaipur to campus",
  "campus to ludhiana": "campus to ludhiana",
  "ludhiana to campus": "ludhiana to campus",
  "campus to noida": "campus to noida",
  "noida to campus": "noida to campus",
  "campus to ghaziabad": "campus to ghaziabad",
  "ghaziabad to campus": "ghaziabad to campus",
  "campus to nizamuddin": "campus to nizamuddin",
  "nizamuddin to campus": "nizamuddin to campus",
  "campus to agra": "campus to agra",
  "agra to campus": "agra to campus"
}

const normalizeLocation = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ")

export function mapLocationsToJourney(from: string, to: string): string | null {
  if (!from || !to) {
    return null
  }

  const normalizedKey = `${normalizeLocation(from)} to ${normalizeLocation(to)}`
  const mappedJourney = JOURNEY_MAPPINGS[normalizedKey] ?? normalizedKey

  return VALID_JOURNEYS.includes(mappedJourney) ? mappedJourney : null
}

export function isValidJourney(from: string, to: string): boolean {
  return mapLocationsToJourney(from, to) !== null
}
