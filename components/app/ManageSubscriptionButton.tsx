"use client";

import { useState } from "react";

export default function ManageSubscriptionButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  const goPortal = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Portal error");

      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      alert("No se pudo abrir la gestión de suscripción.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={goPortal}
      disabled={loading}
      className="rounded-md border px-4 py-2 disabled:opacity-50"
    >
      {loading ? "Abriendo..." : "Gestionar suscripción"}
    </button>
  );
}
