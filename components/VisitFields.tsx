"use client";
import { useState } from "react";
import { addressMapsUrl } from "@/lib/types";
import { APT_FORM } from "./AptForm";

export function VisitFields({ visitAt, meetingPlace, agencyAddress }: {
  visitAt: string; meetingPlace: string | null; agencyAddress: string | null;
}) {
  const [place, setPlace] = useState(meetingPlace ?? "");
  const [addr, setAddr] = useState(agencyAddress ?? "");
  const maps = addressMapsUrl(addr || null);

  return (
    <div className="space-y-2 rounded-xl border border-line p-3">
      <p className="label">🗓 Visita</p>
      <input name="visit_at" type="datetime-local" form={APT_FORM} defaultValue={visitAt} className="input" aria-label="Fecha y hora de la visita" />
      <select name="meeting_place" form={APT_FORM} value={place} onChange={(e) => setPlace(e.target.value)} className="input" aria-label="Lugar de encuentro">
        <option value="">¿Dónde nos encontramos?</option>
        <option value="depto">En el depto</option>
        <option value="inmobiliaria">En la inmobiliaria</option>
      </select>
      {/* Always rendered so the value is kept even if the place changes. */}
      <div hidden={place !== "inmobiliaria"} className="space-y-1">
        <input name="agency_address" form={APT_FORM} value={addr} onChange={(e) => setAddr(e.target.value)}
          className="input" placeholder="Dirección de la inmobiliaria" aria-label="Dirección de la inmobiliaria" />
        {maps && <a href={maps} target="_blank" className="block text-sm text-accent">📍 Inmobiliaria en Google Maps</a>}
      </div>
    </div>
  );
}
