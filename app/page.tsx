import Link from "next/link";
import { answersMap, coverPhotos, listApartments, listQuestions } from "@/lib/data";
import { addressMapsUrl, formatVisit, mapsUrl, money } from "@/lib/types";
import { createApartment } from "./actions";
import { parseSort, sortApartments } from "@/lib/sort";
import { SortSelect } from "@/components/SortSelect";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: PageProps<"/">) {
  const sort = parseSort((await searchParams).orden);
  const [rawApts, questions, answers, covers] = await Promise.all([
    listApartments(),
    listQuestions(),
    answersMap(),
    coverPhotos(),
  ]);
  const boolQs = questions.filter((q) => q.type === "boolean");
  const answeredCount = (id: string) => questions.filter((q) => answers[id]?.[q.id] != null).length;
  const apts = sortApartments(rawApts, sort, answeredCount);

  return (
    <main className="space-y-4 p-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">Mis deptos 🔑</h1>
        <p className="text-sm text-muted">{apts.length === 0 ? "Todavía nada. ¡A cazar!" : `${apts.length} en la mira`}</p>
      </header>

      <form action={createApartment} className="flex gap-2">
        <input name="name" placeholder="Nombre (ej: Palermo 2 amb)" className="input" />
        <button className="btn-primary shrink-0">+ Nuevo</button>
      </form>

      {apts.length > 1 && <SortSelect value={sort} />}

      <ul className="space-y-3">
        {apts.map((a) => {
          const ans = answers[a.id] ?? {};
          const answered = answeredCount(a.id);
          const maps = mapsUrl(a);
          const visit = formatVisit(a.visit_at);
          const meetMaps = a.meeting_place === "inmobiliaria" ? addressMapsUrl(a.agency_address) : maps;
          return (
            <li key={a.id} className="card overflow-hidden p-0">
              <Link href={`/apt/${a.id}`} className="flex gap-3 p-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-line">
                  {covers[a.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={covers[a.id]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">🏢</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="truncate font-semibold">{a.name}</h2>
                    {a.rating && <span className="shrink-0 text-sm">{"⭐".repeat(a.rating)}</span>}
                  </div>
                  <p className="truncate text-sm text-muted">{a.address ?? "Sin dirección"}</p>
                  <p className="text-sm font-medium">
                    {money(a.price, a.currency)}
                    {a.expensas != null && <span className="text-muted"> + {money(a.expensas, "ARS")} exp.</span>}
                  </p>
                  <p className="text-xs text-muted">{answered}/{questions.length} preguntas respondidas</p>
                </div>
              </Link>
              {boolQs.some((q) => ans[q.id]) && (
                <div className="flex flex-wrap gap-1 px-3 pb-3">
                  {boolQs.filter((q) => ans[q.id]).map((q) => (
                    <span key={q.id} className={`rounded-full px-2 py-0.5 text-xs ${ans[q.id] === "si" ? "bg-ok/15 text-ok" : "bg-bad/15 text-bad"}`}>
                      {ans[q.id] === "si" ? "✓" : "✗"} {q.label.replace(/[¿?]/g, "").replace(/^(Tiene|Aceptan) /i, "")}
                    </span>
                  ))}
                </div>
              )}
              {visit && (
                <a href={meetMaps ?? undefined} target="_blank" className="block border-t border-line px-3 py-2 text-xs font-medium">
                  🗓 {visit}
                  {a.meeting_place === "inmobiliaria"
                    ? ` · en la inmobiliaria${a.agency_address ? ` (${a.agency_address})` : ""}`
                    : a.meeting_place === "depto" ? " · en el depto" : ""}
                </a>
              )}
              {(maps || a.listing_url) && (
                <div className="flex border-t border-line text-xs text-accent">
                  {maps && <a href={maps} target="_blank" className="flex-1 px-3 py-2">📍 Abrir en Maps</a>}
                  {a.listing_url && (
                    <a href={a.listing_url} target="_blank" rel="noopener noreferrer" className="flex-1 px-3 py-2 text-right">🔗 Ver aviso</a>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
