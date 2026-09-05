'use client';
import { usePowerEditor } from '@/lib/power-editor-context';
export default function FloatingWhatsApp() {
  const { settings, loaded } = usePowerEditor();
  if (!loaded) return null;
  const number = (settings.whatsapp_number || '923094415485').replace(/[^0-9]/g, '');
  const message = encodeURIComponent("Hi! I'm interested in your products at BaZariFy.");
  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 left-5 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-black/50 transition-transform hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor">
        <path d="M16.001 3C9.373 3 4 8.373 4 15.001c0 2.318.649 4.484 1.777 6.328L4 29l7.844-1.746A11.94 11.94 0 0 0 16.001 27C22.629 27 28 21.629 28 15.001 28 8.373 22.629 3 16.001 3zm6.906 17.087c-.29.815-1.44 1.508-2.354 1.703-.626.13-1.444.234-4.197-.902-3.522-1.454-5.789-5.023-5.966-5.256-.171-.234-1.42-1.89-1.42-3.606 0-1.717.9-2.556 1.22-2.907.29-.32.67-.4.893-.4.223 0 .446.002.64.011.205.01.48-.078.75.573.29.703.984 2.42 1.07 2.596.086.176.143.383.028.617-.114.234-.171.38-.34.585-.171.205-.36.457-.514.615-.171.176-.35.367-.15.72.2.352.887 1.46 1.903 2.365 1.307 1.164 2.408 1.524 2.76 1.696.352.171.557.143.762-.086.205-.229.877-1.024 1.11-1.375.234-.352.469-.293.79-.176.32.117 2.032.958 2.381 1.132.35.176.583.264.668.41.086.146.086.847-.204 1.663z"/>
      </svg>
    </a>
  );
}