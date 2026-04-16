"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/landingPage/ui/accordion"

const faqs = [
  {
    q: "¿Puedo cambiar de plan en cualquier momento?",
    a: "Sí, puedes subir o bajar de plan cuando quieras. El cambio se aplica en tu siguiente ciclo de facturación, sin penalizaciones.",
  },
  {
    q: "¿Hay compromiso de permanencia?",
    a: "No. Puedes cancelar tu membresía cuando quieras. Mantendrás el acceso hasta el final del periodo pagado.",
  },
  {
    q: "¿Cómo recibo el contenido semanal?",
    a: "Cada semana recibes un email con tu nuevo contenido desbloqueado, adaptado a tu nivel de membresía. También puedes acceder directamente desde tu área privada.",
  },
  {
    q: "¿Qué incluye el dossier mensual del plan A Medida?",
    a: "Un informe personalizado con recomendaciones de cuidado, nutrición, salud capilar y novedades relevantes adaptadas a tu Pomerania.",
  },
  {
    q: "¿Puedo regalar una membresía?",
    a: "Por supuesto. Contáctanos y te ayudamos a preparar un acceso de regalo con una nota personalizada.",
  },
]

export function FAQ() {
  return (
    <section id="blog" className="noise-bg py-28 lg:py-40">
      <div className="mx-auto max-w-3xl px-6 lg:px-16">
        {/* Header */}
        <div className="mb-16">
          <p className="mb-6 text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            Preguntas
          </p>
          <h2 className="font-serif text-[1.8rem] leading-[1.1] text-foreground sm:text-[2.2rem] lg:text-[2.8rem] text-balance">
            Preguntas frecuentes
          </h2>
          <div className="mt-8 h-px w-10 bg-border" />
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border/60">
              <AccordionTrigger className="py-6 text-left font-serif text-[1rem] font-normal text-foreground hover:no-underline lg:text-[1.05rem]">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-[13px] leading-[1.75] text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
