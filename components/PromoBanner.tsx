'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

const slides = [
  { src: '/promo/flash-sale.webp', alt: 'Flash Sale - This weekend only, up to 50% off' },
  { src: '/promo/summer-sale.webp', alt: 'Summer Sale - up to 50% off' },
];

// Cycle of entry directions: left, right, up, down, then repeat
const directions = ['left', 'right', 'up', 'down'] as const;

function offsetFor(direction: (typeof directions)[number]) {
  switch (direction) {
    case 'left':
      return { x: -60, y: 0 };
    case 'right':
      return { x: 60, y: 0 };
    case 'up':
      return { x: 0, y: -60 };
    case 'down':
      return { x: 0, y: 60 };
  }
}

export default function PromoBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [dirIndex, setDirIndex] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
      setDirIndex((d) => (d + 1) % directions.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [visible]);

  const direction = directions[dirIndex];
  const offset = offsetFor(direction);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div
        ref={ref}
        className="relative w-full aspect-[2/1] md:aspect-[21/9] rounded-2xl overflow-hidden bg-neutral-50"
      >
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className="absolute inset-0 transition-all ease-out"
            style={{
              transitionDuration: '900ms',
              opacity: visible && i === current ? 1 : 0,
              transform:
                visible && i === current
                  ? 'translate(0, 0)'
                  : `translate(${offset.x}px, ${offset.y}px)`,
              zIndex: i === current ? 10 : 0,
            }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
              }`}
              aria-label={`Go to promo ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
