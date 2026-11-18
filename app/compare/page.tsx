import Link from "next/link";
import { answersMap, listApartments, listQuestions } from "@/lib/data";
import { money } from "@/lib/types";

export const dynamic = "force-dynamic";

function cell(type: string, v: string | undefined) {
  if (v == null) return <span className="text-muted">—</span>;
  if (type === "boolean") return v === "si" ? <span className="text-ok">✓</span> : <span className="text-bad">✗</span>;
  if (type === "rating") return "⭐".repeat(Number(v));
  return v;
}

export default async function Compare() {
  const [apts, questions, answers] = await Promise.all([listApartments(), listQuestions(), answersMap()]);
  if (apts.length === 0) return <main className="p-4"><h1 className="text-2xl font-bold">Comparar</h1><p className="text-muted">Cargá algún depto primero.</p></main>;

  const rows: { label: string; render: (id: string) => React.ReactNode }[] = [
    { label: "Precio", render: (id) => { const a = apts.find((x) => x.id === id)!; return money(a.price, a.currency); } },
    { label: "Expensas", render: (id) => money(apts.find((x) => x.id === id)!.expensas, "ARS") },
    { label: "Mi puntaje", render: (id) => { const r = apts.find((x) => x.id === id)!.rating; return r ? "⭐".repeat(r) : "—"; } },
    ...questions.map((q) => ({ label: q.label, render: (id: string) => cell(q.type, answers[id]?.[q.id]) })),
  ];

  return (
    <main className="space-y-3 p-4">
      <h1 className="pt-2 text-2xl font-bold">Comparar 📊</h1>
      <div className="overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="sticky left-0 bg-card p-2 text-left"></th>
              {apts.map((a) => (
                <th key={a.id} className="min-w-28 p-2 text-left font-semibold">
                  <Link href={`/apt/${a.id}`} className="text-accent">{a.name}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-line last:border-0">
                <td className="sticky left-0 max-w-36 bg-card p-2 text-xs text-muted">{r.label}</td>
                {apts.map((a) => <td key={a.id} className="p-2">{r.render(a.id)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
