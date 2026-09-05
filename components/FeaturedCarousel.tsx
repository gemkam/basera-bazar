"use client";

import { useRef } from "react";
import ScrollReveal from "./ScrollReveal";

interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
  originalPrice?: string;
  href: string;
}

/**
 * Horizontally scrolling "Trending Now" product strip. Distinct from the
 * existing "Best Deals" grid — plug in a different product subset
 * (e.g. most-viewed or newest) to avoid duplicating content.
 *
 * Usage:
 *   <FeaturedCarousel title="Trending Now" products={products} />
 */
export default function FeaturedCarousel({
  title = "Trending Now",
  products,
}: {
  title?: string;
  products: Product[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (amount: number) => {
    scrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="py-14 px-4">
      <ScrollReveal direction="up">
        <div className="flex items-center justify-between max-w-6xl mx-auto mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scrollBy(-300)}
              aria-label="Scroll left"
              className="w-9 h-9 rounded-full border flex items-center justify-center transition-transform hover:scale-110"
            >
              ‹
            </button>
            <button
              onClick={() => scrollBy(300)}
              aria-label="Scroll right"
              className="w-9 h-9 rounded-full border flex items-center justify-center transition-transform hover:scale-110"
            >
              ›
            </button>
          </div>
        </div>
      </ScrollReveal>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4 max-w-6xl mx-auto"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {products.map((p) => (
          <a
            key={p.id}
            href={p.href}
            className="min-w-[180px] md:min-w-[220px] rounded-xl border overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg flex-shrink-0"
            style={{ scrollSnapAlign: "start" }}
          >
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-40 object-cover"
              loading="lazy"
            />
            <div className="p-3">
              <p className="text-sm font-medium line-clamp-2">{p.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-sm">{p.price}</span>
                {p.originalPrice && (
                  <span className="text-xs line-through opacity-50">
                    {p.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
