import type { Apartment } from "./types";

export const SORTS = {
  visita: "🗓 Fecha de visita",
  alquiler_asc: "💸 Alquiler: más barato",
  alquiler_desc: "💰 Alquiler: más caro",
  total_asc: "🧾 Alquiler + expensas: más barato",
  expensas_asc: "🏢 Expensas: más bajas",
  puntaje: "⭐ Mi puntaje",
  respondidas: "❓ Más preguntas respondidas",
  nombre: "🔤 Nombre (A-Z)",
  recientes: "🆕 Cargados recientemente",
} as const;

export type SortKey = keyof typeof SORTS;

export function parseSort(v: string | string[] | undefined): SortKey {
  return typeof v === "string" && v in SORTS ? (v as SortKey) : "visita";
}

type Num = number | null | undefined;

/** Compare with null/undefined always last, whatever the direction. */
function cmp(a: Num, b: Num, dir: 1 | -1): number {
  const an = a == null, bn = b == null;
  if (an || bn) return an === bn ? 0 : an ? 1 : -1;
  return (a - b) * dir;
}

/**
 * Money sorts never mix currencies: ARS first, then USD.
 * Expensas are always ARS, so "total" only adds them to ARS rents.
 */
function money(a: Apartment, b: Apartment, value: (x: Apartment) => Num, dir: 1 | -1) {
  const av = value(a), bv = value(b);
  if (av == null || bv == null) return cmp(av, bv, dir);
  if (a.currency !== b.currency) return a.currency === "ARS" ? -1 : 1;
  return cmp(av, bv, dir);
}

export function sortApartments(apts: Apartment[], key: SortKey, answeredCount: (id: string) => number): Apartment[] {
  const t = (iso: string | null) => (iso ? Date.parse(iso) : null);
  const by: Record<SortKey, (a: Apartment, b: Apartment) => number> = {
    visita: (a, b) => cmp(t(a.visit_at), t(b.visit_at), 1),
    alquiler_asc: (a, b) => money(a, b, (x) => x.price, 1),
    alquiler_desc: (a, b) => money(a, b, (x) => x.price, -1),
    total_asc: (a, b) =>
      money(a, b, (x) => (x.price == null ? null : x.currency === "ARS" ? x.price + (x.expensas ?? 0) : x.price), 1),
    expensas_asc: (a, b) => cmp(a.expensas, b.expensas, 1),
    puntaje: (a, b) => cmp(a.rating, b.rating, -1),
    respondidas: (a, b) => answeredCount(b.id) - answeredCount(a.id),
    nombre: (a, b) => a.name.localeCompare(b.name, "es"),
    recientes: (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
  };
  // Tie-breaker: visit date, then creation order (stable, predictable).
  return [...apts].sort(
    (a, b) => by[key](a, b) || cmp(t(a.visit_at), t(b.visit_at), 1) || Date.parse(a.created_at) - Date.parse(b.created_at),
  );
}
