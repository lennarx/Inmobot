"use client";
import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <div className="text-5xl">🏠</div>
        <h1 className="mt-2 text-2xl font-bold">Inmobot</h1>
        <p className="text-sm text-muted">Tu cazador de deptos personal</p>
      </div>
      <form action={action} className="card w-full max-w-xs space-y-3">
        <label className="label" htmlFor="pin">PIN</label>
        <input id="pin" name="pin" type="password" inputMode="numeric" autoComplete="current-password" className="input text-center text-2xl tracking-[.5em]" autoFocus />
        {error && <p className="text-sm text-bad">{error}</p>}
        <button className="btn-primary w-full" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
      </form>
    </main>
  );
}
