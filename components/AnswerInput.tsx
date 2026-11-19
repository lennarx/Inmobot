"use client";
import { useState } from "react";
import type { Question } from "@/lib/types";
import { APT_FORM, markDirty } from "./AptForm";

/** Answer field; saved with the shared form as "q:<questionId>". */
export function AnswerInput({ q, initial }: { q: Question; initial?: string }) {
  const [value, setValue] = useState(initial ?? "");
  const name = `q:${q.id}`;
  const pick = (v: string) => {
    setValue(v);
    markDirty();
  };

  return (
    <div className="border-b border-line py-3 last:border-0">
      <div className="mb-2 text-sm font-medium">{q.label}</div>
      {(q.type === "boolean" || q.type === "rating") && <input type="hidden" name={name} value={value} form={APT_FORM} />}
      {q.type === "boolean" && (
        <div className="grid grid-cols-3 gap-2">
          {[["si", "Sí ✓"], ["no", "No ✗"], ["", "?"]].map(([v, l]) => (
            <button key={v} type="button" onClick={() => pick(v)}
              className={`btn ${value === v ? (v === "si" ? "bg-ok text-white" : v === "no" ? "bg-bad text-white" : "bg-line") : "border border-line"}`}>
              {l}
            </button>
          ))}
        </div>
      )}
      {q.type === "rating" && (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => pick(String(n) === value ? "" : String(n))}
              className={`text-2xl ${Number(value) >= n ? "" : "opacity-25 grayscale"}`}>⭐</button>
          ))}
        </div>
      )}
      {(q.type === "text" || q.type === "number") && (
        <input className="input" name={name} form={APT_FORM} inputMode={q.type === "number" ? "decimal" : "text"}
          value={value} onChange={(e) => setValue(e.target.value)} />
      )}
    </div>
  );
}
