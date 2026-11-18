"use client";
import { useSyncExternalStore, useState, type ReactNode } from "react";

const readTab = () => new URLSearchParams(window.location.search).get("tab");
const noop = () => () => {};

export function Tabs({ tabs }: { tabs: { id: string; label: string; content: ReactNode }[] }) {
  const urlTab = useSyncExternalStore(noop, readTab, () => null);
  const [picked, setActive] = useState<string | null>(null);
  const active = picked ?? urlTab ?? tabs[0].id;
  const pick = (id: string) => {
    setActive(id);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    window.history.replaceState(null, "", url);
  };
  return (
    <>
      <div className="sticky top-0 z-10 -mx-4 flex gap-1 overflow-x-auto bg-bg/95 px-4 py-2 backdrop-blur">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => pick(t.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${active === t.id ? "bg-ink text-bg" : "border border-line bg-card"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <section key={t.id} hidden={active !== t.id} className="space-y-3">{t.content}</section>
      ))}
    </>
  );
}
