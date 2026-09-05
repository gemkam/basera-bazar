"use client";

import ScrollReveal from "./ScrollReveal";

interface Step {
  icon: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  { icon: "🔍", title: "Browse", description: "Explore products across all categories" },
  { icon: "🛒", title: "Order", description: "Add to cart and checkout in seconds" },
  { icon: "💵", title: "Pay on Delivery", description: "No advance payment needed" },
  { icon: "📦", title: "Get Delivered", description: "Fast delivery nationwide" },
];

/**
 * "How It Works" section — 4 steps, each animates in with a small
 * delay stagger as the user scrolls to the section.
 */
export default function HowItWorks() {
  return (
    <section className="py-14 px-4">
      <ScrollReveal direction="up">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          How It Works
        </h2>
      </ScrollReveal>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <ScrollReveal key={i} direction="up" delay={i * 150}>
            <div className="flex flex-col items-center text-center p-4 rounded-xl transition-transform duration-300 hover:-translate-y-2">
              <div className="text-4xl mb-3">{step.icon}</div>
              <h3 className="font-semibold mb-1">{step.title}</h3>
              <p className="text-sm opacity-75">{step.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
