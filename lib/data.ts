import "server-only";
import { db, signedUrls } from "./supabase";
import type { Apartment, Photo, Question, Redesign } from "./types";

export async function listQuestions(): Promise<Question[]> {
  const { data, error } = await db().from("questions").select("*").order("position").order("created_at");
  if (error) throw error;
  return data as Question[];
}

export async function listApartments(): Promise<Apartment[]> {
  const { data, error } = await db().from("apartments").select("*").order("created_at");
  if (error) throw error;
  return data as Apartment[];
}

export async function getApartment(id: string): Promise<Apartment | null> {
  const { data, error } = await db().from("apartments").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Apartment | null;
}

/** answers[apartmentId][questionId] = value */
export async function answersMap(apartmentIds?: string[]): Promise<Record<string, Record<string, string>>> {
  let q = db().from("answers").select("apartment_id,question_id,value");
  if (apartmentIds) q = q.in("apartment_id", apartmentIds);
  const { data, error } = await q;
  if (error) throw error;
  const out: Record<string, Record<string, string>> = {};
  for (const r of data ?? []) {
    if (r.value == null) continue;
    (out[r.apartment_id] ??= {})[r.question_id] = r.value;
  }
  return out;
}

async function withUrls<T extends { url?: string }>(rows: T[], pathOf: (r: T) => string): Promise<T[]> {
  const urls = await signedUrls(rows.map(pathOf));
  return rows.map((r) => ({ ...r, url: urls[pathOf(r)] }));
}

export async function listPhotos(apartmentId: string | null): Promise<Photo[]> {
  let q = db().from("photos").select("*").order("created_at");
  q = apartmentId ? q.eq("apartment_id", apartmentId) : q.eq("kind", "my_living");
  const { data, error } = await q;
  if (error) throw error;
  return withUrls(data as Photo[], (p) => p.storage_path);
}

export async function listRedesigns(apartmentId: string): Promise<Redesign[]> {
  const { data, error } = await db()
    .from("redesigns")
    .select("*")
    .eq("apartment_id", apartmentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return withUrls(data as Redesign[], (r) => r.result_path);
}

/** First photo per apartment (for list thumbnails). */
export async function coverPhotos(): Promise<Record<string, string>> {
  const { data, error } = await db()
    .from("photos")
    .select("apartment_id,storage_path,kind,created_at")
    .not("apartment_id", "is", null)
    .order("created_at");
  if (error) throw error;
  const firstPath: Record<string, string> = {};
  for (const p of data ?? []) firstPath[p.apartment_id] ??= p.storage_path;
  const urls = await signedUrls(Object.values(firstPath));
  return Object.fromEntries(Object.entries(firstPath).map(([k, p]) => [k, urls[p]]));
}
