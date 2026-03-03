"use client";

import { useEffect } from "react";
import { useAuthModal } from "./AuthModalProvider";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

export function AuthModal() {
  const { isOpen, mode, close } = useAuthModal();

  // cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <button
        aria-label="Cerrar"
        onClick={close}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />

      {/* panel */}
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 animate-[modalIn_180ms_ease-out]">
        <div className="rounded-3xl border border-black/10 bg-[#F6F0E8] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          {/* top accent */}
          <div className="h-1 w-full rounded-t-3xl bg-gradient-to-r from-transparent via-[#B08D57]/60 to-transparent" />

          <div className="p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.2em] text-black/60">
                  ACCESO PRIVADO
                </p>
                <h2 className="mt-1 text-xl font-semibold text-black">
                  {mode === "login" ? "Bienvenida de vuelta" : "Crear cuenta"}
                </h2>
                <p className="mt-1 text-sm text-black/60">
                  {mode === "login"
                    ? "Accede a tu área de membresía."
                    : "Crea tu cuenta para empezar el programa."}
                </p>
              </div>

              <button
                onClick={close}
                className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-sm text-black/70 hover:bg-white"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5">
              {mode === "login" ? <LoginForm /> : <RegisterForm />}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
}