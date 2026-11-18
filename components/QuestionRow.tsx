"use client";
import { useTransition } from "react";
import { deleteQuestion, moveQuestion, renameQuestion } from "@/app/actions";
import type { Question } from "@/lib/types";

const TYPE_LABEL = { boolean: "Sí/No", text: "Texto", number: "Número", rating: "Estrellas" };

export function QuestionRow({ q, first, last }: { q: Question; first: boolean; last: boolean }) {
  const [pending, start] = useTransition();
  return (
    <li className={`flex items-center gap-2 border-b border-line py-2 last:border-0 ${pending ? "opacity-50" : ""}`}>
      <div className="flex flex-col">
        <button disabled={first} className="px-1 disabled:opacity-20" onClick={() => start(() => moveQuestion(q.id, -1))}>▲</button>
        <button disabled={last} className="px-1 disabled:opacity-20" onClick={() => start(() => moveQuestion(q.id, 1))}>▼</button>
      </div>
      <div className="min-w-0 flex-1">
        <input defaultValue={q.label} className="w-full bg-transparent text-sm font-medium outline-none"
          onBlur={(e) => e.target.value !== q.label && start(() => renameQuestion(q.id, e.target.value))} />
        <span className="text-xs text-muted">{TYPE_LABEL[q.type]}</span>
      </div>
      <button className="px-2 text-bad" onClick={() => confirm(`¿Borrar "${q.label}"? Se borran las respuestas de todos los deptos.`) && start(() => deleteQuestion(q.id))}>🗑</button>
    </li>
  );
}
