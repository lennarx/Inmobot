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
