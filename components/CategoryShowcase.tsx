"use client";

import ScrollReveal from "./ScrollReveal";

interface ShowcaseItem {
  title: string;
  description: string;
  image: string;
  href: string;
  ctaLabel?: string;
}

/**
 * Full-width alternating image/text banners — one per category.
 * This is the single biggest contributor to page length and gives
 * a "lifestyle brand" feel rather than a plain product grid.
 *
 * Usage:
 *   <CategoryShowcase items={[
 *     { title: "Beauty & Personal Care", description: "...", image: "/img1.jpg", href: "/categories/beauty-personal-care" },
 *     ...
 *   ]} />
 */
export default function CategoryShowcase({ items }: { items: ShowcaseItem[] }) {
  return (
    <section className="py-10">
      {items.map((item, i) => {
        const reversed = i % 2 === 1;
        return (
          <ScrollReveal
            key={i}
            direction={reversed ? "right" : "left"}
            className="max-w-6xl mx-auto px-4 py-10"
          >
            <div
              className={`flex flex-col md:flex-row ${
                reversed ? "md:flex-row-reverse" : ""
              } items-center gap-8`}
            >
              <div className="w-full md:w-1/2">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-64 md:h-80 object-cover rounded-2xl transition-transform duration-500 hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
              <div className="w-full md:w-1/2 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="opacity-75 mb-5">{item.description}</p>
                <a
                  href={item.href}
                  className="inline-block px-6 py-3 rounded-full border font-medium transition-transform duration-300 hover:scale-105"
                >
                  {item.ctaLabel ?? "Shop Now"}
                </a>
              </div>
            </div>
          </ScrollReveal>
        );
      })}
    </section>
  );
}
