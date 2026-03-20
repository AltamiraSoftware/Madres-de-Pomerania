"use client";
import { Header } from "@/components/landingPage/header"
import { Hero } from "@/components/landingPage/hero"
import { Pricing } from "@/components/landingPage/pricing"
import { Timeline } from "@//components/landingPage/timeline"
import { Testimonials } from "@/components/landingPage/testimonials"
import { FAQ } from "@/components/landingPage/faq"
import { FinalCTA } from "@/components/landingPage/final-cta"
import { Footer } from "@/components/landingPage/footer"

export default function Home() {
  return (
    <main>
<>
      <Header />
      
        <Hero />
        <Pricing />
        <Timeline />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      
      <Footer />
    </>
  
    </main>
  );
}
