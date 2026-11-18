"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteRedesign } from "@/app/actions";
import type { Photo, Redesign } from "@/lib/types";

export function RedesignPanel({ apartmentId, aptPhotos, myPhotos, redesigns }: {
  apartmentId: string; aptPhotos: Photo[]; myPhotos: Photo[]; redesigns: Redesign[];
}) {
  const livingFirst = [...aptPhotos].sort((a, b) => (a.kind === "living" ? -1 : 0) - (b.kind === "living" ? -1 : 0));
  const [target, setTarget] = useState<string | null>(livingFirst[0]?.id ?? null);
  const [mine, setMine] = useState<string[]>(myPhotos.slice(0, 3).map((p) => p.id));
  const [extra, setExtra] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();
  const router = useRouter();

  if (aptPhotos.length === 0 || myPhotos.length === 0) {
    return (
      <div className="card space-y-2 text-sm">
        <p className="font-semibold">Para la magia necesito:</p>
        <p>{aptPhotos.length ? "✅" : "⬜"} Al menos una foto del living de este depto (pestaña Fotos)</p>
        <p>{myPhotos.length ? "✅" : "⬜"} Fotos de tu living actual (<Link href="/my-living" className="text-accent underline">Mi living</Link>)</p>
      </div>
    );
  }

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/redesign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartmentId, targetPhotoId: target, myPhotoIds: mine, extra }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const pickGrid = (photos: Photo[], selected: (id: string) => boolean, toggle: (id: string) => void) => (
    <div className="grid grid-cols-4 gap-1.5">
      {photos.map((p) => (
        <button key={p.id} type="button" onClick={() => toggle(p.id)}
          className={`overflow-hidden rounded-lg border-2 ${selected(p.id) ? "border-accent" : "border-transparent opacity-60"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.url} alt="" className="aspect-square w-full object-cover" />
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className="card space-y-3">
        <div>
          <p className="label">1. Living de este depto</p>
          {pickGrid(livingFirst, (id) => id === target, setTarget)}
        </div>
        <div>
          <p className="label">2. Tu living actual (hasta 3)</p>
          {pickGrid(myPhotos, (id) => mine.includes(id), (id) =>
            setMine((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id].slice(-3))))}
        </div>
        <input className="input" value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Opcional: 'el escritorio va junto a la ventana'" />
        <button className="btn-primary w-full" disabled={busy || !target || mine.length === 0} onClick={run}>
          {busy ? "🪄 Mudando muebles virtualmente… (~30s)" : "🪄 Reacomodar mis muebles acá"}
        </button>
        {error && <p className="text-sm text-bad">{error}</p>}
      </div>

      {redesigns.map((r) => (
        <figure key={r.id} className="card space-y-2 p-2">
          <a href={r.url} target="_blank">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.url} alt="Propuesta" className="w-full rounded-xl" />
          </a>
          {r.explanation && <figcaption className="whitespace-pre-wrap px-1 text-sm">{r.explanation}</figcaption>}
          <div className="flex justify-between px-1 text-xs text-muted">
            <span>{new Date(r.created_at).toLocaleString("es-AR")} · {r.model}</span>
            <button className="text-bad" onClick={() => confirm("¿Borrar propuesta?") && start(() => deleteRedesign(r.id))}>🗑</button>
          </div>
        </figure>
      ))}
    </>
  );
}
