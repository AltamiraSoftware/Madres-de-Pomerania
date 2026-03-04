"use client";

import { useState } from "react";

export default function SubscribeButton({
  userId,
  tier = "esencial",
}: {
  userId: string;
  tier?: "esencial" | "vip";
}) {
  const [loading, setLoading] = useState(false);

  const goCheckout = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tier }),
      });

      const text = await res.text();
      let data: { url?: string; error?: string } = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        alert(data.error || `No se pudo iniciar el pago (HTTP ${res.status}).`);
        return;
      }

      if (!data.url) {
        alert("El servidor no devolvió la URL de checkout.");
        return;
      }

      window.location.href = data.url;
    } catch {
      alert("No se pudo iniciar el pago. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={goCheckout}
      disabled={loading}
      className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
    >
      {loading ? "Redirigiendo..." : "Suscribirme"}
    </button>
  );
}