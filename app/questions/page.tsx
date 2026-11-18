import { listQuestions } from "@/lib/data";
import { addQuestion } from "../actions";
import { QuestionRow } from "@/components/QuestionRow";

export const dynamic = "force-dynamic";

export default async function QuestionsPage() {
  const questions = await listQuestions();
  return (
    <main className="space-y-4 p-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">Preguntas ❓</h1>
        <p className="text-sm text-muted">Las que agregues aparecen en todos los deptos.</p>
      </header>
      <form action={addQuestion} className="card space-y-2">
        <input name="label" required placeholder="¿Entra mi heladera en la cocina?" className="input" />
        <div className="flex gap-2">
          <select name="type" defaultValue="boolean" className="input">
            <option value="boolean">Sí / No</option>
            <option value="rating">Estrellas (1-5)</option>
            <option value="number">Número</option>
            <option value="text">Texto</option>
          </select>
          <button className="btn-primary shrink-0">Agregar</button>
        </div>
      </form>
      <ul className="card py-1">
        {questions.map((q, i) => <QuestionRow key={q.id} q={q} first={i === 0} last={i === questions.length - 1} />)}
      </ul>
    </main>
  );
}
