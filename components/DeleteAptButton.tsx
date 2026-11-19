"use client";
import { useTransition } from "react";
import { deleteApartment } from "@/app/actions";

export function DeleteAptButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" className="btn w-full text-bad" disabled={pending}
      onClick={() => confirm("¿Borrar este depto con todas sus fotos?") && start(() => deleteApartment(id))}>
      {pending ? "Borrando…" : "Borrar depto"}
    </button>
  );
}
