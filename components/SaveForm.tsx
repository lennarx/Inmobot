"use client";
import { useState, useTransition, type ReactNode } from "react";

/** A form that calls a server action and shows "Guardado ✓". */
export function SaveForm({ action, children }: { action: (f: FormData) => Promise<void>; children: ReactNode }) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          await action(fd);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        });
      }}
      onChange={() => setSaved(false)}
      className="card space-y-3"
    >
      {children}
      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "Guardando…" : saved ? "Guardado ✓" : "Guardar"}
      </button>
    </form>
  );
}
