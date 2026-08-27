'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { usePowerEditor } from '@/lib/power-editor-context';

export default function HeroSlideshow() {
  const { settings, editMode, updateSetting, loaded } = usePowerEditor();
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const slides = [
    { src: settings.hero_image_1 || '/hero/hero1.webp', alt: 'Hero banner 1', key: 'hero_image_1' },
    { src: settings.hero_image_2 || '/hero/hero2.webp', alt: 'Hero banner 2', key: 'hero_image_2' },
  ];

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!playing || editMode) return;
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [playing, next, editMode]);

  async function handleReplace(idx: number, file: File) {
    setUploadingSlot(idx);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const data = await res.json();
      await updateSetting(slides[idx].key, data.url);
    }
    setUploadingSlot(null);
  }

  if (!loaded) {
    return <section className="relative w-full aspect-[16/9] md:aspect-[21/8] bg-black" />;
  }

  // Edit mode: show both banners side-by-side so both can be replaced easily
  if (editMode) {
    return (
      <section className="w-full grid grid-cols-2 gap-1 bg-black">
        {slides.map((slide, i) => (
          <div key={slide.key} className="relative aspect-[16/9] md:aspect-[21/16] bg-neutral-900">
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover"
              sizes="50vw"
              unoptimized={slide.src.startsWith('http')}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={() => fileInputRefs[i].current?.click()}
                disabled={uploadingSlot === i}
                className="bg-[var(--gold)] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[var(--gold-light)] transition-colors"
              >
                {uploadingSlot === i ? 'Uploading...' : `📷 Replace Banner ${i + 1}`}
              </button>
              <input
                ref={fileInputRefs[i]}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleReplace(i, file);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        ))}
      </section>
    );
  }

  // Normal mode: auto-rotating slideshow
  return (
    <section className="relative w-full aspect-[16/9] md:aspect-[21/8] bg-black overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.key}
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
            unoptimized={slide.src.startsWith('http')}
          />
        </div>
      ))}

      <button
        onClick={() => setPlaying((p) => !p)}
        className="absolute bottom-4 right-4 z-20 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full border border-white/20 transition-colors"
        aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
      >
        {playing ? '❚❚ Pause' : '▶ Play'}
      </button>

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
