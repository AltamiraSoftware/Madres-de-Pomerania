"use client";
import { Header } from "@/components/landingPage/header"
import { Hero } from "@/components/landingPage/hero"
import { MembershipTiers } from "@/components/landingPage/membership-tiers"
import { BenefitsSummary } from "@/components/landingPage/benefits-summary"
import { Pricing } from "@/components/landingPage/pricing"
import { Timeline } from "@//components/landingPage/timeline"
import { Testimonials } from "@/components/landingPage/testimonials"
import { FAQ } from "@/components/landingPage/faq"
import { FinalCTA } from "@/components/landingPage/final-cta"
import { Footer } from "@/components/landingPage/footer"

import { useAuthModal } from "../components/auth/AuthModalProvider";
export default function Home() {
  const { openLogin } = useAuthModal();
const { openRegister } = useAuthModal();

  return (
    <main>
<>
      <Header />
      
        <Hero />
        <MembershipTiers />
        <BenefitsSummary />
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

