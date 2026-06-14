import { createFileRoute } from "@tanstack/react-router";
import { BackgroundSystem } from "@/components/landing/BackgroundSystem";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Challenges } from "@/components/landing/Challenges";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AICostCalculator } from "@/components/landing/AICostCalculator";
import { Integrations } from "@/components/landing/Integrations";
import { FinalCTA } from "@/components/landing/FinalCTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TRACEai" },
      {
        name: "description",
        content:
          "Monitor AI usage, trace every token, and cut LLM spend by up to 60% with an autonomous optimization agent. Built for AI-native teams.",
      },
      { property: "og:title", content: "TRACEai" },
      {
        property: "og:description",
        content:
          "Monitor AI usage, trace every token, and cut LLM spend by up to 60% with an autonomous optimization agent.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen">
      <BackgroundSystem />
      <Navbar />
      <main>
        <Hero />
        <Challenges />
        <Features />
        <HowItWorks />
        <AICostCalculator />
        <Integrations />
        <FinalCTA />
      </main>
    </div>
  );
}
