import { NextResponse } from "next/server";
import { db, BUCKET, signedUrls } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export const maxDuration = 60;

const DEFAULT_MODEL = "google/gemini-2.5-flash-image";

async function toDataUrl(path: string): Promise<string> {
  const { data, error } = await db().storage.from(BUCKET).download(path);
  if (error || !data) throw new Error(`No pude bajar ${path}`);
  const buf = Buffer.from(await data.arrayBuffer());
  return `data:${data.type || "image/jpeg"};base64,${buf.toString("base64")}`;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Falta OPENROUTER_API_KEY en Vercel" }, { status: 500 });

  const body = (await req.json()) as {
    apartmentId: string;
    targetPhotoId: string;
    myPhotoIds: string[];
    extra?: string;
  };
  if (!body.apartmentId || !body.targetPhotoId || !body.myPhotoIds?.length) {
    return NextResponse.json({ error: "Elegí una foto del depto y al menos una de tu living" }, { status: 400 });
  }

  const { data: photos, error } = await db()
    .from("photos")
    .select("id,storage_path")
    .in("id", [body.targetPhotoId, ...body.myPhotoIds.slice(0, 3)]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const byId = Object.fromEntries((photos ?? []).map((p) => [p.id, p.storage_path]));
  const targetPath = byId[body.targetPhotoId];
  const myPaths = body.myPhotoIds.map((id) => byId[id]).filter(Boolean);
  if (!targetPath || myPaths.length === 0) return NextResponse.json({ error: "Fotos no encontradas" }, { status: 404 });

  const [target, ...mine] = await Promise.all([targetPath, ...myPaths].map(toDataUrl));

  const prompt = [
    "Sos un interiorista. La PRIMERA imagen es el living de un departamento que voy a alquilar (puede estar vacío o con muebles ajenos).",
    `Las ${mine.length} imágenes siguientes son mi living ACTUAL con MIS muebles.`,
    "Generá una imagen fotorrealista del living de la PRIMERA imagen amueblado SOLO con mis muebles (sofá, mesa, sillas, rack, TV, alfombra, plantas, etc.), quitando cualquier mueble ajeno.",
    "Respetá EXACTAMENTE la arquitectura del depto nuevo: paredes, ventanas, puertas, piso, luz, perspectiva de cámara y escala realista.",
    "Elegí una distribución práctica: circulación libre, TV sin reflejos de ventanas, sofá mirando a la TV, aprovechar la luz natural.",
    "Además, respondé en texto (español rioplatense, máx 6 bullets) explicando la distribución y si algún mueble probablemente NO entra.",
    body.extra ? `Pedido extra del usuario: ${body.extra}` : "",
  ].join("\n");

  const model = process.env.OPENROUTER_IMAGE_MODEL || DEFAULT_MODEL;
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Inmobot",
    },
    body: JSON.stringify({
      model,
      modalities: ["image", "text"],
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: target } },
            ...mine.map((url) => ({ type: "image_url", image_url: { url } })),
          ],
        },
      ],
    }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error?.message ?? `OpenRouter respondió ${res.status}`;
    return NextResponse.json({ error: `${msg} (modelo: ${model})` }, { status: 502 });
  }

  const message = json?.choices?.[0]?.message;
  const imageUrl: string | undefined = message?.images?.[0]?.image_url?.url;
  const explanation: string =
    typeof message?.content === "string"
      ? message.content
      : Array.isArray(message?.content)
        ? message.content.map((c: { text?: string }) => c.text ?? "").join("\n")
        : "";

  if (!imageUrl?.startsWith("data:")) {
    return NextResponse.json(
      { error: `El modelo no devolvió imagen (modelo: ${model}). ${explanation.slice(0, 300)}` },
      { status: 502 },
    );
  }

  const [meta, b64] = imageUrl.split(",", 2);
  const mime = meta.match(/data:(.*?);/)?.[1] ?? "image/png";
  const path = `${body.apartmentId}/redesign-${crypto.randomUUID()}.${mime.includes("jpeg") ? "jpg" : "png"}`;
  const { error: upErr } = await db()
    .storage.from(BUCKET)
    .upload(path, Buffer.from(b64, "base64"), { contentType: mime });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: row, error: insErr } = await db()
    .from("redesigns")
    .insert({ apartment_id: body.apartmentId, result_path: path, explanation, model })
    .select("*")
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  revalidatePath(`/apt/${body.apartmentId}`);
  const urls = await signedUrls([path]);
  return NextResponse.json({ ...row, url: urls[path] });
}
