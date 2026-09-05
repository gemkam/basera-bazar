"use client";

import ScrollReveal from "./ScrollReveal";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: "🚀",
    title: "Fast Delivery",
    description: "Nationwide delivery with real-time order updates",
  },
  {
    icon: "🔒",
    title: "Secure & Trusted",
    description: "Cash on delivery means you pay only when you receive",
  },
  {
    icon: "↩️",
    title: "Easy Returns",
    description: "Hassle-free returns within our policy window",
  },
  {
    icon: "🎧",
    title: "24/7 Support",
    description: "Reach us anytime on WhatsApp for help with your order",
  },
];

/**
 * "Why Choose Us" feature grid — 4 cards with icon + short copy,
 * each fading in with a stagger as the section scrolls into view.
 */
export default function WhyChooseUs() {
  return (
    <section className="py-14 px-4">
      <ScrollReveal direction="up">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          Why Choose BaZariFy
        </h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <ScrollReveal key={i} direction="up" delay={i * 120}>
            <div className="p-6 rounded-2xl border text-center h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm opacity-75">{f.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
