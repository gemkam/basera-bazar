'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { usePowerEditor } from '@/lib/power-editor-context';
import KineticText from './KineticText';
import EditableText from './EditableText';

// Tiny blurred placeholder shown while the hero video buffers, so visitors
// see something other than a flash of solid black before it starts playing.
const HERO_POSTER =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgC2brfhAAD//gAQTGF2YzYwLjMxLjEwMgD/2wBDAAgKCgsKCw0NDQ0NDRAPEBAQEBAQEBAQEBASEhIVFRUSEhIQEBISFBQVFRcXFxUVFRUXFxkZGR4eHBwjIyQrKzP/xABtAAACAwEBAAAAAAAAAAAAAAAFBAYDAgABAQADAQEAAAAAAAAAAAAAAAAAAQQDAhAAAgICAAUFAQEBAQAAAAAAAQIAAwQRQSEFMRJhURUiE6GBI3ERAQEBAQEBAQAAAAAAAAAAAAABAhExA0H/wAARCAAuAFADASIAAhEAAxEA/9oADAMBAAIRAxEAPwAxblA2+ELUn8yvPvINZaDlA+skzZAVF/yT9vVnJxMFI1EcjIFU5bNVA+kAZGSGP2E3ianG6gPaNU5IeRs2V67QjRdUBqdORU5dQbW54cyocZFrm/6HRMrq5rzPAxBKznVDjPUzK2OtyHOrcz/5OptNbbMAI/GD9vIRnJwmPiV4R+q37HcfLA6mmvnPSzu+KMetzV4t7SlunK3GElcLOss0p1MdWS8aSfoC3T095cmAu97gu7MsVuMuTqLKByjjmiBwV8pl8JF7RY9R9P7KT1Atw/sZCJw0KiZ+PrMU+R0O0tTqO+ywDmf7nQly+fkOctNH2J3PTWQw5yqZnE91enRWTqbevaETSA67xkDYk2szqiavELtxGLERSzGsHDjJa9X2lb0giIIgabPaYSmz2kmNQmfygAE49p3Lsel0bnDprmBXGH//2Q==';

export default function HeroSlideshow() {
  const { settings, editMode, updateSetting, loaded } = usePowerEditor();
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [editingHeading, setEditingHeading] = useState(false);
  const [editingSub, setEditingSub] = useState(false);
  const [headingDraft, setHeadingDraft] = useState('');
  const [subDraft, setSubDraft] = useState('');
  const [showPositionPanel, setShowPositionPanel] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const fileInputRefs = [useRef<HTMLInputElement>(null)];

  // Video crop position, e.g. "50% 30%" — lets the video be nudged so
  // content cropped off by object-cover (like a head near the top) can be
  // brought back into frame without needing to re-edit the video file itself.
  const [videoPos, videoPosY] = (settings.hero_video_position || '50% 50%').split(' ');
  const posX = parseInt(videoPos) || 50;
  const posY = parseInt(videoPosY) || 50;

  async function nudgePosition(dx: number, dy: number) {
    const newX = Math.min(100, Math.max(0, posX + dx));
    const newY = Math.min(100, Math.max(0, posY + dy));
    await updateSetting('hero_video_position', `${newX}% ${newY}%`);
  }

  type Slide =
    | { type: 'image'; src: string; alt: string; key: string }
    | { type: 'video'; src: string; key: string };

  const slides: Slide[] = [
    {
      type: 'video',
      src: settings.hero_video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      key: 'hero_video_url',
    },
  ];

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!playing || editMode || slides.length <= 1) return;
    const timer = setInterval(next, 4500);
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
      <section className={`w-full bg-black ${slides.length === 1 ? '' : 'grid grid-cols-2 md:grid-cols-3 gap-1'}`}>
        {slides.map((slide, i) => (
          <div
            key={slide.key}
            className={`relative bg-neutral-50 ${
              slides.length === 1 ? 'w-full aspect-[16/9] md:aspect-[21/8]' : 'aspect-square'
            }`}
          >
            {slide.type === 'video' ? (
              <video
                src={slide.src}
                poster={HERO_POSTER}
                muted
                loop
                className="w-full h-full object-cover"
                style={{ objectPosition: `${posX}% ${posY}%` }}
              />
            ) : (
              <Image src={slide.src} alt={slide.alt} fill className="object-cover" sizes="33vw" unoptimized={slide.src.startsWith('http')} />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
              <button
                onClick={() => fileInputRefs[i].current?.click()}
                disabled={uploadingSlot === i}
                className="bg-[var(--gold)] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[var(--gold-light)] transition-colors"
              >
                {uploadingSlot === i ? 'Uploading...' : slide.type === 'video' ? '🎬 Replace' : '📷 Replace'}
              </button>
              {slide.type === 'video' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPositionPanel((p) => !p);
                  }}
                  className="bg-neutral-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  🎯 Position
                </button>
              )}
              <input
                ref={fileInputRefs[i]}
                type="file"
                accept={slide.type === 'video' ? 'video/*' : 'image/*'}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleReplace(i, file);
                  e.target.value = '';
                }}
              />
            </div>
            {slide.type === 'video' && showPositionPanel && (
              <div className="absolute bottom-3 right-3 bg-black/80 rounded-xl p-2 grid grid-cols-3 gap-1 w-32">
                <div />
                <button onClick={() => nudgePosition(0, -5)} className="bg-white/10 hover:bg-white/20 text-white rounded py-1 text-sm">▲</button>
                <div />
                <button onClick={() => nudgePosition(-5, 0)} className="bg-white/10 hover:bg-white/20 text-white rounded py-1 text-sm">◄</button>
                <button
                  onClick={() => updateSetting('hero_video_position', '50% 50%')}
                  title="Reset to center"
                  className="bg-white/10 hover:bg-white/20 text-white rounded py-1 text-xs"
                >
                  ⟲
                </button>
                <button onClick={() => nudgePosition(5, 0)} className="bg-white/10 hover:bg-white/20 text-white rounded py-1 text-sm">►</button>
                <div />
                <button onClick={() => nudgePosition(0, 5)} className="bg-white/10 hover:bg-white/20 text-white rounded py-1 text-sm">▼</button>
                <div />
              </div>
            )}
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
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          style={{
            transform: `translateY(${parallaxY}px) scale(${zoomScale})`,
            willChange: 'transform',
          }}
        >
          {slide.type === 'video' ? (
            <video
              src={slide.src}
              poster={HERO_POSTER}
              onLoadedData={() => setVideoReady(true)}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              style={{ objectPosition: `${posX}% ${posY}%` }}
            />
          ) : (
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
              unoptimized={slide.src.startsWith('http')}
            />
          )}
        </div>
      ))}

      {/* Dim overlay for text readability */}
      <div className="absolute inset-0 hero-text-dim z-[5] pointer-events-none" />

      {/* Kinetic headline overlay */}
      <div
        className="absolute inset-0 z-[6] flex flex-col items-center justify-center text-center px-4 transition-opacity duration-500"
        style={{ opacity: slides[current]?.type === 'video' && !videoReady ? 0 : 1 }}
      >
        {editMode && editingHeading ? (
          <input
            autoFocus
            value={headingDraft}
            onChange={(e) => setHeadingDraft(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                await updateSetting('hero_heading', headingDraft);
                setEditingHeading(false);
              }
            }}
            onBlur={async () => {
              await updateSetting('hero_heading', headingDraft);
              setEditingHeading(false);
            }}
            className="bg-black/80 border border-[var(--gold-light)] rounded-lg px-4 py-2 text-2xl md:text-5xl font-bold text-center text-white outline-none w-full max-w-2xl"
          />
        ) : (
          <h1
            key={`heading-${current}`}
            onClick={() => {
              if (editMode) {
                setHeadingDraft(settings.hero_heading || 'Shop Smarter, Live Better');
                setEditingHeading(true);
              }
            }}
            className={`text-2xl md:text-5xl font-bold text-white drop-shadow-lg ${
              editMode ? 'cursor-pointer ring-1 ring-dashed ring-[var(--gold)]/60 rounded px-2' : ''
            }`}
          >
            <KineticText text={settings.hero_heading || 'Shop Smarter, Live Better'} />
          </h1>
        )}

        {editMode && editingSub ? (
          <input
            autoFocus
            value={subDraft}
            onChange={(e) => setSubDraft(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                await updateSetting('hero_subheading', subDraft);
                setEditingSub(false);
              }
            }}
            onBlur={async () => {
              await updateSetting('hero_subheading', subDraft);
              setEditingSub(false);
            }}
            className="mt-4 bg-black/80 border border-[var(--gold)] rounded-lg px-4 py-2 text-sm md:text-lg text-center text-neutral-800 outline-none w-full max-w-xl"
          />
        ) : (
          <p
            key={`sub-${current}`}
            onClick={() => {
              if (editMode) {
                setSubDraft(settings.hero_subheading || '');
                setEditingSub(true);
              }
            }}
            className={`mt-4 text-sm md:text-lg text-neutral-100 drop-shadow-md max-w-xl ${
              editMode ? 'cursor-pointer ring-1 ring-dashed ring-[var(--gold)]/60 rounded px-2' : ''
            }`}
          >
            <KineticText
              text={settings.hero_subheading || 'Quality products at unbeatable prices'}
              staggerMs={35}
              baseDelay={250}
            />
          </p>
        )}
      </div>

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
