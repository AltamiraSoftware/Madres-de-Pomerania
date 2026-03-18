"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthModal } from "./AuthModalProvider";

export function LoginForm() {
  const supabase = createClient();
  const { close, openRegister } = useAuthModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setPending(false);

    if (error) return setError(error.message);

    close();
    window.location.href = "/app";
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        className="w-full rounded-2xl border border-black/10 bg-white/70 p-3 outline-none focus:ring-2 focus:ring-[#B08D57]/40"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <input
        className="w-full rounded-2xl border border-black/10 bg-white/70 p-3 outline-none focus:ring-2 focus:ring-[#B08D57]/40"
        placeholder="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        disabled={pending}
        className="w-full rounded-2xl bg-black px-4 py-3 text-white shadow-sm hover:opacity-95 disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-black/60">
        ¿No tienes cuenta?{" "}
        <button
          type="button"
          onClick={openRegister}
          className="font-medium text-black underline underline-offset-4 hover:opacity-80"
        >
          Crear cuenta
        </button>
      </p>
    </form>
  );
}
