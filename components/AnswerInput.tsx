"use client";
import { useState, useTransition } from "react";
import { saveAnswer } from "@/app/actions";
import type { Question } from "@/lib/types";

export function AnswerInput({ apartmentId, q, initial }: { apartmentId: string; q: Question; initial?: string }) {
  const [value, setValue] = useState(initial ?? "");
  const [saved, setSaved] = useState(initial ?? "");
  const [pending, start] = useTransition();

  const commit = (v: string) => {
    setValue(v);
    if (v === saved) return;
    start(async () => {
      await saveAnswer(apartmentId, q.id, v || null);
      setSaved(v);
    });
  };

  const status = pending ? <span className="text-xs text-muted">guardando…</span> : null;

  return (
    <div className="border-b border-line py-3 last:border-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{q.label}</span>
        {status}
      </div>
      {q.type === "boolean" && (
        <div className="grid grid-cols-3 gap-2">
          {[["si", "Sí ✓"], ["no", "No ✗"], ["", "?"]].map(([v, l]) => (
            <button key={v} type="button" onClick={() => commit(v)}
              className={`btn ${value === v ? (v === "si" ? "bg-ok text-white" : v === "no" ? "bg-bad text-white" : "bg-line") : "border border-line"}`}>
              {l}
            </button>
          ))}
        </div>
      )}
      {q.type === "rating" && (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => commit(String(n) === value ? "" : String(n))}
              className={`text-2xl ${Number(value) >= n ? "" : "opacity-25 grayscale"}`}>⭐</button>
          ))}
        </div>
      )}
      {(q.type === "text" || q.type === "number") && (
        <input className="input" inputMode={q.type === "number" ? "decimal" : "text"} value={value}
          onChange={(e) => setValue(e.target.value)} onBlur={(e) => commit(e.target.value)} />
      )}
    </div>
  );
}
