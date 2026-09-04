'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { usePowerEditor } from '@/lib/power-editor-context';
import EditableText from './EditableText';

export default function HeroSlideshow() {
  const { settings, editMode, updateSetting, loaded } = usePowerEditor();
  const [current, setCurrent] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  type Slide = { type: 'image'; src: string; alt: string; key: string };

  // Neutral gray placeholder — shown only until the real banner images are
  // uploaded through the admin panel. Deliberately not the old promotional
  // graphics, since those were explicitly retired.
  const PLACEHOLDER =
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500"><rect width="100%" height="100%" fill="#e5e5e5"/></svg>'
    );

  const slides: Slide[] = [
    { type: 'image', src: settings.hero_image_1 || PLACEHOLDER, alt: 'Hero banner 1', key: 'hero_image_1' },
    { type: 'image', src: settings.hero_image_2 || PLACEHOLDER, alt: 'Hero banner 2', key: 'hero_image_2' },
    { type: 'image', src: settings.hero_image_3 || PLACEHOLDER, alt: 'Hero banner 3', key: 'hero_image_3' },
    { type: 'image', src: settings.hero_image_4 || PLACEHOLDER, alt: 'Hero banner 4', key: 'hero_image_4' },
    { type: 'image', src: settings.hero_image_5 || PLACEHOLDER, alt: 'Hero banner 5', key: 'hero_image_5' },
    { type: 'image', src: settings.hero_image_6 || PLACEHOLDER, alt: 'Hero banner 6', key: 'hero_image_6' },
    { type: 'image', src: settings.hero_image_7 || PLACEHOLDER, alt: 'Hero banner 7', key: 'hero_image_7' },
    { type: 'image', src: settings.hero_image_8 || PLACEHOLDER, alt: 'Hero banner 8', key: 'hero_image_8' },
  ];

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
    setCycleCount((n) => n + 1);
  }, [slides.length]);

  useEffect(() => {
    if (!playing || editMode || slides.length <= 1) return;
    // Slow, cinematic pacing — long enough for the Ken Burns pan/zoom on each
    // slide to actually be visible before it cross-fades to the next one.
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [playing, next, editMode, slides.length]);

  // Scroll-driven parallax + zoom
  useEffect(() => {
    function handleScroll() {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // progress: 0 when hero top is at viewport top, 1 when hero has scrolled fully past
      const progress = Math.min(Math.max((0 - rect.top) / (rect.height || viewportH), 0), 1.5);
      setScrollProgress(progress);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Edit mode: show all slides as a grid, each replaceable
  if (editMode) {
    return (
      <section className="w-full bg-black grid grid-cols-2 md:grid-cols-4 gap-1">
        {slides.map((slide, i) => (
          <div key={slide.key} className="relative aspect-square bg-neutral-50">
            <Image src={slide.src} alt={slide.alt} fill className="object-cover" sizes="25vw" unoptimized={slide.src.startsWith('http')} />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={() => fileInputRefs[i].current?.click()}
                disabled={uploadingSlot === i}
                className="btn-solid bg-[var(--gold)] text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
              >
                {uploadingSlot === i ? 'Uploading...' : '📷 Replace'}
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

  // Normal mode: auto-rotating slideshow with scroll parallax + zoom
  const parallaxY = scrollProgress * 60; // px shift
  const zoomScale = 1 + Math.min(scrollProgress, 1) * 0.15; // up to 1.15x

  return (
    <section
      ref={sectionRef}
      className="relative w-full aspect-[16/9] md:aspect-[21/8] bg-black overflow-hidden"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.key}
          className={`absolute inset-0 transition-opacity ease-in-out ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          style={{
            transitionDuration: '1500ms',
            transform: `translateY(${parallaxY}px) scale(${zoomScale})`,
            willChange: 'transform',
          }}
        >
          {/* Separate wrapper for the Ken Burns zoom, kept apart from the
              scroll-parallax transform above so the two don't fight over
              the same element's transform property. Keyed on cycleCount
              so the animation restarts fresh every time this slide comes
              back around, not just the first time. */}
          <div
            key={i === current ? `kb-${cycleCount}` : 'kb-idle'}
            className={i === current ? 'w-full h-full ken-burns' : 'w-full h-full'}
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
        </div>
      ))}

      {/* Dim overlay for text readability */}
      <div className="absolute inset-0 hero-text-dim z-[5] pointer-events-none" />


      {slides.length > 1 && (
        <button
          onClick={() => setPlaying((p) => !p)}
          className="absolute bottom-4 right-4 z-20 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full border border-white/20 transition-colors"
          aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
        >
          {playing ? '❚❚ Pause' : '▶ Play'}
        </button>
      )}

      {slides.length > 1 && (
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
      )}
    </section>
  );
}
