'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function PromoBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div
        ref={ref}
        className={`relative w-full aspect-[2/1] md:aspect-[21/9] rounded-2xl overflow-hidden transition-all duration-1000 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <Image
          src="/promo/flash-sale.webp"
          alt="Flash Sale - This weekend only, up to 50% off"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
    </section>
  );
}
