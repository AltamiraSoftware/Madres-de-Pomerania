"use client"

import { useState } from "react"

const footerCols = [
  {
    title: "Membresia",
    links: [
      { label: "Plan Esencial", href: "#membresia" },
      { label: "Plan A Medida", href: "#membresia" },
      { label: "Comparar planes", href: "#membresia" },
    ],
  },
  {
    title: "Contenido",
    links: [
      { label: "Blog", href: "#blog" },
      { label: "Guias", href: "#" },
      { label: "Metodo", href: "#metodo" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidad", href: "#" },
      { label: "Terminos", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
]

export function Footer() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
      setEmail("")
    }
  }

  return (
    <footer id="contacto" className="noise-bg border-t border-border bg-background py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <div className="grid gap-14 lg:grid-cols-5 lg:gap-16">
          {/* Brand + Newsletter */}
          <div className="lg:col-span-2">
            <a href="#inicio" aria-label="Ana y Boo" className="inline-block">
              <span className="font-serif text-lg tracking-[0.04em] text-foreground">
                Ana y Boo
              </span>
            </a>
            <p className="mt-6 mb-10 max-w-xs text-[13px] leading-[1.75] text-muted-foreground">
              Cuidado premium y personalizado para tu Pomerania. Una comunidad
              exclusiva de madres que quieren lo mejor.
            </p>

            <div>
              <p className="mb-3 text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
                Newsletter
              </p>
              {submitted ? (
                <p className="text-[13px] text-foreground">Gracias por suscribirte.</p>
              ) : (
                <form onSubmit={handleSubmit} className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu email"
                    required
                    className="flex-1 border border-border bg-transparent px-4 py-3 text-[12px] text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-foreground/20 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="btn-luxury border border-l-0 border-border bg-foreground px-5 py-3 text-[9px] tracking-[0.2em] text-background uppercase"
                  >
                    Enviar
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Links */}
          {footerCols.map((col) => (
            <div key={col.title}>
              <p className="mb-5 text-[10px] tracking-[0.25em] text-foreground uppercase">
                {col.title}
              </p>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="nav-link text-[13px] text-muted-foreground transition-colors duration-500 hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 h-px w-full bg-border" />
        <div className="mt-6 flex flex-col items-center justify-between gap-3 md:flex-row">
          <p className="text-[11px] tracking-wide text-muted-foreground">
            {"2026 Ana y Boo. Todos los derechos reservados."}
          </p>
          <p className="text-[10px] tracking-wide text-muted-foreground/50">
            Hecho con cuidado para tu Pomerania
          </p>
        </div>
      </div>
    </footer>
  )
}
