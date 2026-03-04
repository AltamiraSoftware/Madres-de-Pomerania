"use client";

import { useState } from "react";

export default function SubscribeButton({ userId, tier = "esencial" }: { userId: string; tier?: "esencial" | "vip" }) {
  const [loading, setLoading] = useState(false);

  const goCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Checkout error");

      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      alert("No se pudo iniciar el pago. Revisa consola / logs de Vercel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <p> dejate de joder flaco</p>
    <button
      onClick={goCheckout}
      disabled={loading}
      className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
    >
      {loading ? "Redirigiendo..." : "Suscribirme"}
    </button>
    </>
  );
}