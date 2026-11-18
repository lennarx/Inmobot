import Link from "next/link";
import { notFound } from "next/navigation";
import { answersMap, getApartment, listPhotos, listQuestions, listRedesigns } from "@/lib/data";
import { mapsUrl } from "@/lib/types";
import { deleteApartment, updateApartment } from "@/app/actions";
import { Tabs } from "@/components/Tabs";
import { SaveForm } from "@/components/SaveForm";
import { LocationFields } from "@/components/LocationFields";
import { AnswerInput } from "@/components/AnswerInput";
import { PhotoUploader } from "@/components/PhotoUploader";
import { PhotoGrid } from "@/components/PhotoGrid";
import { RedesignPanel } from "@/components/RedesignPanel";

export const dynamic = "force-dynamic";

export default async function AptPage({ params }: PageProps<"/apt/[id]">) {
  const { id } = await params;
  const apt = await getApartment(id);
  if (!apt) notFound();
  const [questions, answers, photos, myPhotos, redesigns] = await Promise.all([
    listQuestions(), answersMap([id]), listPhotos(id), listPhotos(null), listRedesigns(id),
  ]);
  const ans = answers[id] ?? {};
  const save = updateApartment.bind(null, id);
  const del = deleteApartment.bind(null, id);
  const maps = mapsUrl(apt);
  const phone = apt.contact_phone?.replace(/[^\d+]/g, "");
  const wa = phone?.replace(/^\+/, "");

  return (
    <main className="space-y-3 p-4">
      <header className="flex items-center gap-2 pt-2">
        <Link href="/" className="text-2xl">←</Link>
        <h1 className="truncate text-2xl font-bold">{apt.name}</h1>
      </header>

      <Tabs tabs={[
        {
          id: "datos", label: "📝 Datos", content: (
            <>
              <SaveForm action={save}>
                <div>
                  <label className="label" htmlFor="name">Nombre</label>
                  <input id="name" name="name" defaultValue={apt.name} className="input" />
                </div>
                <LocationFields address={apt.address} lat={apt.lat} lng={apt.lng} />
                {maps && <a href={maps} target="_blank" className="block text-sm text-accent">📍 Ver en Google Maps</a>}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="label" htmlFor="price">Alquiler</label>
                    <input id="price" name="price" defaultValue={apt.price ?? ""} className="input" inputMode="decimal" />
                  </div>
                  <div>
                    <label className="label" htmlFor="currency">Moneda</label>
                    <select id="currency" name="currency" defaultValue={apt.currency} className="input">
                      <option>ARS</option><option>USD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="expensas">Expensas (ARS)</label>
                  <input id="expensas" name="expensas" defaultValue={apt.expensas ?? ""} className="input" inputMode="decimal" />
                </div>
                <div>
                  <label className="label" htmlFor="rating">Mi puntaje</label>
                  <select id="rating" name="rating" defaultValue={apt.rating ?? ""} className="input">
                    <option value="">Sin puntaje</option>
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{"⭐".repeat(n)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="listing_url">Link del aviso</label>
                  <input id="listing_url" name="listing_url" type="url" defaultValue={apt.listing_url ?? ""} className="input" placeholder="https://…" />
                </div>
                <div>
                  <label className="label" htmlFor="notes">Notas</label>
                  <textarea id="notes" name="notes" defaultValue={apt.notes ?? ""} rows={4} className="input" placeholder="Olor a humedad en el baño, vecino con batería…" />
                </div>
              </SaveForm>
              <form action={del}>
                <button className="btn w-full text-bad">Borrar depto</button>
              </form>
            </>
          ),
        },
        {
          id: "preguntas", label: "❓ Preguntas", content: (
            <div className="card py-1">
              {questions.map((q) => <AnswerInput key={q.id} apartmentId={id} q={q} initial={ans[q.id]} />)}
              <Link href="/questions" className="block py-3 text-center text-sm text-accent">+ Agregar / editar preguntas (aplican a todos)</Link>
            </div>
          ),
        },
        {
          id: "contacto", label: "📞 Contacto", content: (
            <>
              {phone && (
                <div className="grid grid-cols-2 gap-2">
                  <a href={`tel:${phone}`} className="btn-ghost">📞 Llamar</a>
                  <a href={`https://wa.me/${wa}`} target="_blank" className="btn-ghost">💬 WhatsApp</a>
                </div>
              )}
              {apt.contact_email && <a href={`mailto:${apt.contact_email}`} className="btn-ghost w-full">✉️ {apt.contact_email}</a>}
              <SaveForm action={save}>
                <div><label className="label" htmlFor="contact_name">Nombre</label><input id="contact_name" name="contact_name" defaultValue={apt.contact_name ?? ""} className="input" /></div>
                <div><label className="label" htmlFor="agency">Inmobiliaria / dueño</label><input id="agency" name="agency" defaultValue={apt.agency ?? ""} className="input" /></div>
                <div><label className="label" htmlFor="contact_phone">Teléfono (con código, ej +54911…)</label><input id="contact_phone" name="contact_phone" type="tel" defaultValue={apt.contact_phone ?? ""} className="input" /></div>
                <div><label className="label" htmlFor="contact_email">Email</label><input id="contact_email" name="contact_email" type="email" defaultValue={apt.contact_email ?? ""} className="input" /></div>
              </SaveForm>
            </>
          ),
        },
        {
          id: "fotos", label: "📷 Fotos", content: (
            <>
              <div className="grid grid-cols-2 gap-2">
                <PhotoUploader apartmentId={id} kind="living" label="Living" />
                <PhotoUploader apartmentId={id} kind="other" label="Otras" />
              </div>
              <PhotoGrid photos={photos} allowKind />
            </>
          ),
        },
        {
          id: "ia", label: "🪄 Living IA", content: (
            <RedesignPanel apartmentId={id} aptPhotos={photos} myPhotos={myPhotos} redesigns={redesigns} />
          ),
        },
      ]} />
    </main>
  );
}
