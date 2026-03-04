"use client";

import { useSearchParams } from "next/navigation";

export default function CheckoutStatusBanner({ tier }: { tier?: string | null }) {
  const params = useSearchParams();
  const success = params.get("success");
  const canceled = params.get("canceled");

  if (!success && !canceled) return null;

  if (success) {
    return (
      <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="font-medium">✅ Suscripción confirmada</p>
        <p className="text-sm opacity-80">
          Te has suscrito al plan <span className="font-medium">{tier ?? "esencial"}</span>. Ya tienes acceso al contenido.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="font-medium">Pago cancelado</p>
      <p className="text-sm opacity-80">
        No se ha realizado ningún cargo. Si quieres, puedes intentarlo de nuevo.
      </p>
    </div>
  );
}