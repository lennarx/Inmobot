"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, BUCKET } from "@/lib/supabase";
import { AUTH_COOKIE, pinToken } from "@/lib/auth";
import type { QuestionType } from "@/lib/types";

// ---------- auth ----------
export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  const pin = String(form.get("pin") ?? "");
  const expected = process.env.APP_PIN;
  if (!expected) return "Falta configurar APP_PIN en Vercel";
  await new Promise((r) => setTimeout(r, 400)); // slow down brute force a bit
  if (pin !== expected) return "PIN incorrecto";
  (await cookies()).set(AUTH_COOKIE, await pinToken(pin), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  redirect("/");
}

// ---------- apartments ----------
const str = (f: FormData, k: string) => {
  const v = f.get(k);
  return v == null || String(v).trim() === "" ? null : String(v).trim();
};
const num = (f: FormData, k: string) => {
  const v = str(f, k);
  if (v == null) return null;
  // Accept "450.000", "450000", "1.234,5" (es-AR) and "-34.6037" (coords).
  const clean = v.replace(/\s|\$|US/gi, "");
  const thousands = clean.includes(",") || /^-?\d{1,3}(\.\d{3})+$/.test(clean);
  const n = Number(thousands ? clean.replace(/\./g, "").replace(",", ".") : clean);
  return Number.isFinite(n) ? n : null;
};

const coord = (f: FormData, k: string) => {
  const v = str(f, k);
  const n = v == null ? NaN : Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

export async function createApartment(form: FormData) {
  const name = str(form, "name") ?? "Depto sin nombre";
  const { data, error } = await db().from("apartments").insert({ name }).select("id").single();
  if (error) throw error;
  revalidatePath("/");
  redirect(`/apt/${data.id}`);
}

export async function updateApartment(id: string, form: FormData) {
  // Only fields present in the submitted form are updated (several forms share this action).
  const parsers: Record<string, (f: FormData, k: string) => unknown> = {
    name: (f, k) => str(f, k) ?? "Depto sin nombre",
    address: str,
    lat: coord,
    lng: coord,
    price: num,
    expensas: num,
    currency: (f, k) => str(f, k) ?? "ARS",
    contact_name: str,
    contact_phone: str,
    contact_email: str,
    agency: str,
    listing_url: str,
    rating: (f, k) => {
      const r = num(f, k);
      return r && r >= 1 && r <= 5 ? r : null;
    },
    notes: str,
    visit_at: (f, k) => {
      const v = str(f, k);
      return v ? new Date(v).toISOString() : null;
    },
  };
  const patch: Record<string, unknown> = {};
  for (const [k, parse] of Object.entries(parsers)) if (form.has(k)) patch[k] = parse(form, k);
  if (Object.keys(patch).length === 0) return;
  const { error } = await db().from("apartments").update(patch).eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/compare");
  revalidatePath(`/apt/${id}`);
}

export async function deleteApartment(id: string) {
  const { data: photos } = await db().from("photos").select("storage_path").eq("apartment_id", id);
  const { data: reds } = await db().from("redesigns").select("result_path").eq("apartment_id", id);
  const paths = [...(photos ?? []).map((p) => p.storage_path), ...(reds ?? []).map((r) => r.result_path)];
  if (paths.length) await db().storage.from(BUCKET).remove(paths);
  const { error } = await db().from("apartments").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  redirect("/");
}

// ---------- answers ----------
export async function saveAnswer(apartmentId: string, questionId: string, value: string | null) {
  const v = value == null || value.trim() === "" ? null : value.trim();
  const { error } = await db()
    .from("answers")
    .upsert({ apartment_id: apartmentId, question_id: questionId, value: v, updated_at: new Date().toISOString() });
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/compare");
}

// ---------- questions ----------
const TYPES: QuestionType[] = ["boolean", "text", "number", "rating"];

export async function addQuestion(form: FormData) {
  const label = str(form, "label");
  const type = str(form, "type") as QuestionType;
  if (!label || !TYPES.includes(type)) return;
  const { data: last } = await db().from("questions").select("position").order("position", { ascending: false }).limit(1);
  const position = (last?.[0]?.position ?? 0) + 1;
  const { error } = await db().from("questions").insert({ label, type, position });
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function renameQuestion(id: string, label: string) {
  if (!label.trim()) return;
  const { error } = await db().from("questions").update({ label: label.trim() }).eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function deleteQuestion(id: string) {
  const { error } = await db().from("questions").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function moveQuestion(id: string, dir: -1 | 1) {
  const { data } = await db().from("questions").select("id,position").order("position").order("created_at");
  const list = data ?? [];
  const i = list.findIndex((q) => q.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await Promise.all(list.map((q, idx) => db().from("questions").update({ position: idx + 1 }).eq("id", q.id)));
  revalidatePath("/", "layout");
}

// ---------- photos ----------
export async function uploadPhoto(form: FormData) {
  const file = form.get("file") as File | null;
  const apartmentId = str(form, "apartment_id");
  const kind = str(form, "kind") as "living" | "other" | "my_living";
  if (!file || !["living", "other", "my_living"].includes(kind)) throw new Error("Datos inválidos");
  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `${apartmentId ?? "me"}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await db()
    .storage.from(BUCKET)
    .upload(path, await file.arrayBuffer(), { contentType: file.type || "image/jpeg" });
  if (upErr) throw upErr;
  const { error } = await db()
    .from("photos")
    .insert({ apartment_id: kind === "my_living" ? null : apartmentId, kind, storage_path: path });
  if (error) throw error;
  revalidatePath(apartmentId ? `/apt/${apartmentId}` : "/my-living");
  revalidatePath("/");
}

export async function setPhotoKind(id: string, kind: "living" | "other") {
  const { data, error } = await db().from("photos").update({ kind }).eq("id", id).select("apartment_id").single();
  if (error) throw error;
  revalidatePath(`/apt/${data.apartment_id}`);
}

export async function deletePhoto(id: string) {
  const { data } = await db().from("photos").select("storage_path,apartment_id").eq("id", id).single();
  if (!data) return;
  await db().storage.from(BUCKET).remove([data.storage_path]);
  await db().from("photos").delete().eq("id", id);
  revalidatePath(data.apartment_id ? `/apt/${data.apartment_id}` : "/my-living");
  revalidatePath("/");
}

export async function deleteRedesign(id: string) {
  const { data } = await db().from("redesigns").select("result_path,apartment_id").eq("id", id).single();
  if (!data) return;
  await db().storage.from(BUCKET).remove([data.result_path]);
  await db().from("redesigns").delete().eq("id", id);
  revalidatePath(`/apt/${data.apartment_id}`);
}
