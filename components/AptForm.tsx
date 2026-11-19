"use client";
import { useEffect, useState, useTransition } from "react";

/** Id of the single form shared by every tab: inputs join it with form={APT_FORM}. */
export const APT_FORM = "apt-form";
export const DIRTY_EVENT = "apt-form-dirty";

/** Mark the shared form as having unsaved changes (for inputs React updates programmatically). */
export function markDirty() {
  window.dispatchEvent(new Event(DIRTY_EVENT));
}

/**
 * One save for all tabs. Inputs live inside each tab and point here via the
 * HTML `form` attribute, so hidden tabs' fields are submitted too.
 */
export function AptForm({ action }: { action: (f: FormData) => Promise<void> }) {
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const onEdit = (e: Event) => {
      const t = e.target as HTMLInputElement | null;
      if (e.type === DIRTY_EVENT || (t?.form?.id === APT_FORM && t.name)) {
        setDirty(true);
        setSaved(false);
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    document.addEventListener("input", onEdit, true);
    document.addEventListener("change", onEdit, true);
    window.addEventListener(DIRTY_EVENT, onEdit);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      document.removeEventListener("input", onEdit, true);
      document.removeEventListener("change", onEdit, true);
      window.removeEventListener(DIRTY_EVENT, onEdit);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [dirty]);

  return (
    <form
      id={APT_FORM}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          try {
            await action(fd);
            setDirty(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
          } catch (err) {
            setError((err as Error).message || "No se pudo guardar");
          }
        });
      }}
      className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+3.75rem)] z-20 px-4"
    >
      <div className="mx-auto max-w-xl">
        {error && <p className="mb-1 rounded-lg bg-bad px-3 py-1 text-xs text-white">{error}</p>}
        <button
          className={`btn w-full shadow-lg ${dirty ? "bg-accent text-accent-ink" : "border border-line bg-card text-muted"}`}
          disabled={pending || !dirty}
        >
          {pending ? "Guardando…" : saved ? "Guardado ✓" : dirty ? "💾 Guardar cambios (todas las pestañas)" : "Sin cambios"}
        </button>
      </div>
    </form>
  );
}
