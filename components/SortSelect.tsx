"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SORTS, type SortKey } from "@/lib/sort";

export function SortSelect({ value }: { value: SortKey }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="shrink-0 text-muted">Ordenar:</span>
      <select
        className={`input py-2 text-sm ${pending ? "opacity-60" : ""}`}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          start(() => router.replace(v === "visita" ? "/" : `/?orden=${v}`, { scroll: false }));
        }}
      >
        {Object.entries(SORTS).map(([k, label]) => (
          <option key={k} value={k}>{label}</option>
        ))}
      </select>
    </label>
  );
}
