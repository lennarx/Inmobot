"use client";
import { useTransition } from "react";
import { deletePhoto, setPhotoKind } from "@/app/actions";
import type { Photo } from "@/lib/types";

export function PhotoGrid({ photos, allowKind }: { photos: Photo[]; allowKind?: boolean }) {
  const [pending, start] = useTransition();
  if (photos.length === 0) return <p className="text-sm text-muted">Sin fotos todavía.</p>;
  return (
    <div className={`grid grid-cols-2 gap-2 ${pending ? "opacity-60" : ""}`}>
      {photos.map((p) => (
        <figure key={p.id} className="relative overflow-hidden rounded-xl border border-line">
          <a href={p.url} target="_blank">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="aspect-square w-full object-cover" />
          </a>
          <figcaption className="flex items-center justify-between gap-1 bg-card p-1.5 text-xs">
            {allowKind ? (
              <button
                className={`rounded-full px-2 py-0.5 ${p.kind === "living" ? "bg-accent text-accent-ink" : "border border-line"}`}
                onClick={() => start(() => setPhotoKind(p.id, p.kind === "living" ? "other" : "living"))}
              >
                {p.kind === "living" ? "🛋️ Living" : "Marcar living"}
              </button>
            ) : <span />}
            <button className="px-1 text-bad" onClick={() => confirm("¿Borrar foto?") && start(() => deletePhoto(p.id))}>🗑</button>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
