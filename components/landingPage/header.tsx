"use client"

import { useAuthModal } from "@/components/auth/AuthModalProvider"
import { useEffect, useMemo, useState } from "react"
import { Menu, X, Lock } from "lucide-react"

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Membresia", href: "#niveles" },
  { label: "Planes", href: "#membresia" },
  { label: "Contacto", href: "#contacto" },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeHash, setActiveHash] = useState("#inicio")

  const { openLogin } = useAuthModal()

  // Cierra el menú si pasas a desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false)
    }
    window.addEventListener("resize", onResize, { passive: true })
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // Scroll state + active section simple por hash (cuando clicas)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Sync hash changes (si cambias hash manualmente)
  useEffect(() => {
    const onHash = () => setActiveHash(window.location.hash || "#inicio")
    onHash()
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  const headerClass = useMemo(() => {
    // glass + hairline + shadow sutil al scroll
    return `fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
      scrolled
        ? "bg-background/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
        : "bg-transparent"
    }`
  }, [scrolled])

  return (
    <header className={headerClass}>
      {/* Shine / highlight line */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[1px] transition-opacity duration-500 ${
          scrolled ? "opacity-100" : "opacity-0"
        } bg-gradient-to-r from-transparent via-foreground/20 to-transparent`}
      />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-16">
        {/* Brand */}
        <a
          href="#inicio"
          aria-label="Inicio"
          className="group flex items-center gap-2"
          onClick={() => setActiveHash("#inicio")}
        >
          <span className="relative font-serif text-lg tracking-[0.06em] text-foreground">
            Ana y Boo
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground/50 transition-all duration-500 group-hover:w-full" />
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-10 md:flex" aria-label="Principal">
          {navLinks.map((link) => {
            const isActive = activeHash === link.href
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setActiveHash(link.href)}
                className={`relative text-[11px] tracking-[0.18em] uppercase transition-colors duration-300 ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-foreground/60 transition-transform duration-300 ${
                    isActive ? "scale-x-100" : "group-hover:scale-x-100"
                  }`}
                />
              </a>
            )
          })}

          {/* Premium CTA */}
          <button
            type="button"
            onClick={openLogin}
            className="
              relative ml-2 inline-flex items-center gap-2 rounded-full
              px-4 py-2 text-[11px] tracking-[0.18em] uppercase
              text-background
              transition-all duration-300
              bg-gradient-to-b from-foreground to-foreground/80
              shadow-[0_10px_30px_rgba(0,0,0,0.12)]
              hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(0,0,0,0.16)]
              active:translate-y-0
              focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30
            "
            aria-label="Acceso privado"
          >
            <Lock className="h-4 w-4" strokeWidth={1.5} />
            Acceso privado

            {/* Glow */}
            <span className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-xl opacity-30 bg-foreground" />
          </button>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative rounded-full p-2 text-foreground md:hidden transition hover:bg-foreground/5"
          aria-label={open ? "Cerrar menu" : "Abrir menu"}
        >
          {open ? <X className="h-5 w-5" strokeWidth={1} /> : <Menu className="h-5 w-5" strokeWidth={1} />}
        </button>
      </div>

      {/* Mobile overlay + drawer */}
      <div
        className={`md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* Overlay */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={`fixed inset-0 z-40 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          } bg-black/35`}
          aria-label="Cerrar menú"
          tabIndex={open ? 0 : -1}
        />

        {/* Drawer */}
        <div
          className={`fixed right-0 top-0 z-50 h-dvh w-[86%] max-w-sm transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          } bg-background/95 backdrop-blur-xl border-l border-border/60 shadow-2xl`}
        >
          <div className="flex items-center justify-between px-6 py-5">
            <span className="font-serif tracking-[0.06em] text-foreground">Ana y Boo</span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-foreground transition hover:bg-foreground/5"
              aria-label="Cerrar menu"
            >
              <X className="h-5 w-5" strokeWidth={1} />
            </button>
          </div>

          <div className="px-6 pb-6">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

            <div className="mt-4 flex flex-col">
              {navLinks.map((link) => {
                const isActive = activeHash === link.href
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => {
                      setActiveHash(link.href)
                      setOpen(false)
                    }}
                    className={`flex items-center justify-between py-4 text-[12px] tracking-[0.18em] uppercase transition-colors ${
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    } border-b border-border/40`}
                  >
                    {link.label}
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-foreground" : "bg-transparent"}`} />
                  </a>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setOpen(false)
                openLogin()
              }}
              className="
                mt-6 w-full inline-flex items-center justify-center gap-2
                rounded-full px-4 py-3 text-[11px] tracking-[0.18em] uppercase
                text-background
                bg-gradient-to-b from-foreground to-foreground/80
                shadow-[0_10px_30px_rgba(0,0,0,0.12)]
                transition-all duration-300 hover:-translate-y-[1px]
                hover:shadow-[0_14px_34px_rgba(0,0,0,0.16)]
              "
            >
              <Lock className="h-4 w-4" strokeWidth={1.5} />
              Acceso privado
            </button>

            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Accede a tu área privada para ver contenido y gestionar tu membresía.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom hairline when scrolled */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-px bg-border transition-opacity duration-500 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />
    </header>
  )
}