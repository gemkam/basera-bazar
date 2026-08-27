'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const slides = [
  { src: '/hero/hero1.webp', alt: 'Summer Sale up to 50% off' },
  { src: '/hero/hero2.webp', alt: 'Sale on Sale - exclusive products' },
];

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [playing, next]);

  return (
    <section className="relative w-full aspect-[16/9] md:aspect-[21/8] bg-black overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Play/Pause control */}
      <button
        onClick={() => setPlaying((p) => !p)}
        className="absolute bottom-4 right-4 z-20 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full border border-white/20 transition-colors"
        aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
      >
        {playing ? '❚❚ Pause' : '▶ Play'}
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
