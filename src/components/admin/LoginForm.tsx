"use client";

import { useActionState } from "react";
import type { LoginState } from "@/lib/actions/auth";

export default function LoginForm({
  action,
}: {
  action: (state: LoginState, formData: FormData) => Promise<LoginState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm text-smoke mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-champagne/20 bg-obsidian-light px-4 py-3 text-ivory outline-none focus:border-champagne/60 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm text-smoke mb-2">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-champagne/20 bg-obsidian-light px-4 py-3 text-ivory outline-none focus:border-champagne/60 transition-colors"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-ember" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-champagne text-obsidian font-medium py-3 transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
