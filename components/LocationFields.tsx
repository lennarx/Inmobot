"use client";
import { useState } from "react";
import { APT_FORM, markDirty } from "./AptForm";

export function LocationFields({ address, lat, lng }: { address: string | null; lat: number | null; lng: number | null }) {
  const [la, setLa] = useState(lat?.toString() ?? "");
  const [ln, setLn] = useState(lng?.toString() ?? "");
  const [msg, setMsg] = useState<string | null>(null);

  const locate = () => {
    if (!navigator.geolocation) return setMsg("Tu navegador no soporta ubicación");
    setMsg("Buscando ubicación…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLa(p.coords.latitude.toFixed(6));
        setLn(p.coords.longitude.toFixed(6));
        markDirty();
        setMsg(`Listo (±${Math.round(p.coords.accuracy)} m). Tocá Guardar.`);
      },
      (e) => setMsg(`No pude: ${e.message}`),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  return (
    <div className="space-y-2">
      <label className="label" htmlFor="address">Dirección</label>
      <input id="address" name="address" form={APT_FORM} defaultValue={address ?? ""} className="input" placeholder="Av. Siempreviva 742, CABA" />
      <div className="grid grid-cols-2 gap-2">
        <input name="lat" form={APT_FORM} value={la} onChange={(e) => setLa(e.target.value)} className="input" placeholder="Lat" inputMode="decimal" />
        <input name="lng" form={APT_FORM} value={ln} onChange={(e) => setLn(e.target.value)} className="input" placeholder="Lng" inputMode="decimal" />
      </div>
      <button type="button" className="btn-ghost w-full" onClick={locate}>📍 Estoy acá: usar mi ubicación</button>
      {msg && <p className="text-xs text-muted">{msg}</p>}
    </div>
  );
}
