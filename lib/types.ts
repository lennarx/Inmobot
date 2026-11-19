export type QuestionType = "boolean" | "text" | "number" | "rating";

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  position: number;
}

export interface Apartment {
  id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  price: number | null;
  expensas: number | null;
  currency: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  agency: string | null;
  listing_url: string | null;
  rating: number | null;
  notes: string | null;
  visit_at: string | null;
  meeting_place: "depto" | "inmobiliaria" | null;
  agency_address: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  apartment_id: string | null;
  kind: "living" | "other" | "my_living";
  storage_path: string;
  created_at: string;
  url?: string;
}

export interface Redesign {
  id: string;
  apartment_id: string;
  result_path: string;
  explanation: string | null;
  model: string | null;
  created_at: string;
  url?: string;
}

export function mapsUrl(a: Pick<Apartment, "address" | "lat" | "lng">): string | null {
  if (a.lat != null && a.lng != null) return `https://www.google.com/maps/search/?api=1&query=${a.lat},${a.lng}`;
  if (a.address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.address)}`;
  return null;
}

export function money(n: number | null, currency: string): string {
  if (n == null) return "—";
  return `${currency === "USD" ? "US$" : "$"} ${n.toLocaleString("es-AR")}`;
}

// Visits are entered and shown in Argentina time (UTC-3, no DST).
const AR_OFFSET_MS = 3 * 3600 * 1000;

/** ISO timestamp -> "YYYY-MM-DDTHH:mm" for <input type="datetime-local"> in AR time. */
export function toArLocalInput(iso: string | null): string {
  if (!iso) return "";
  return new Date(Date.parse(iso) - AR_OFFSET_MS).toISOString().slice(0, 16);
}

/** "YYYY-MM-DDTHH:mm" in AR time -> ISO timestamp. */
export function fromArLocalInput(v: string): string | null {
  const t = Date.parse(`${v}:00-03:00`);
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

export function formatVisit(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "short",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function addressMapsUrl(address: string | null): string | null {
  return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;
}
