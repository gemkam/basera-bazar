'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/supabase';
import { useLanguage } from '@/lib/language-context';
import { extractKeywords } from '@/lib/search-keywords';

type SpeechRecognitionResultLike = { transcript: string };
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: { results: SpeechRecognitionResultLike[][] }) => void) | null;
}

type Message = { who: 'bot' | 'user'; text: string };

export default function AIAssistant() {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // --- Draggable position ---
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragInfo = useRef({ dragging: false, moved: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  function handlePointerDown(e: React.PointerEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    const originX = pos?.x ?? rect?.left ?? window.innerWidth - 90;
    const originY = pos?.y ?? rect?.top ?? window.innerHeight - 90;
    dragInfo.current = {
      dragging: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      originX,
      originY,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragInfo.current.dragging) return;
    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragInfo.current.moved = true;

    const size = 84; // button + a little breathing room
    const newX = Math.min(Math.max(dragInfo.current.originX + dx, 8), window.innerWidth - size);
    const newY = Math.min(Math.max(dragInfo.current.originY + dy, 8), window.innerHeight - size);
    setPos({ x: newX, y: newY });
  }

  function handlePointerUp() {
    dragInfo.current.dragging = false;
  }

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (event) => {
      setListening(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        alert('Microphone access was blocked. Please allow microphone permission for this site and try again.');
      }
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        setInput(transcript);
        setTimeout(() => submitQuery(transcript), 100);
      }
    };
    recognitionRef.current = recognition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  function handleMicClick() {
    if (!recognitionRef.current) {
      alert("Voice input isn't supported in this browser — try Chrome, Edge, or Safari.");
      return;
    }
    if (!window.isSecureContext) {
      alert('Voice input only works when this site is served over HTTPS.');
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      return;
    }
    recognitionRef.current.lang = language === 'ur' ? 'ur-PK' : 'en-US';
    try {
      recognitionRef.current.start();
    } catch {
      /* already started */
    }
  }

  function greet() {
    addMessage(
      'bot',
      language === 'ur'
        ? 'السلام علیکم! میں بازاریفائی اسسٹنٹ ہوں۔ آپ کسی پروڈکٹ کی قیمت، دستیابی یا ڈیلیوری کے بارے میں پوچھ سکتے ہیں۔'
        : "Hi! I'm the BaZariFy assistant. Ask me about product pricing, availability, or delivery — I can also connect you with our team."
    );
  }

  function handleOpen() {
    if (dragInfo.current.moved) return; // was a drag, not a click
    setOpen((o) => !o);
    if (!opened) {
      setOpened(true);
      greet();
    }
  }

  function addMessage(who: 'bot' | 'user', text: string) {
    setMessages((m) => [...m, { who, text }]);
  }

  async function submitQuery(text: string) {
    const q = text.trim();
    if (!q) return;
    addMessage('user', q);
    setInput('');
    const answer = await answerQuery(q);
    setTimeout(() => addMessage('bot', answer), 400);
  }

  async function answerQuery(q: string): Promise<string> {
    const lower = q.toLowerCase();
    const keywords = extractKeywords(q);
    let match: Product | undefined;
    if (keywords.length) {
      const orFilter = keywords.map((k) => `title.ilike.%${k}%`).join(',');
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(orFilter)
        .limit(1);
      match = data?.[0];
    }
    if (match) {
      return language === 'ur'
        ? `${match.title} کی قیمت Rs. ${match.price.toLocaleString()} ہے۔ کیا آپ اسے کارٹ میں شامل کرنا چاہیں گے؟`
        : `${match.title} is Rs. ${match.price.toLocaleString()} and currently ${
            match.stock > 0 ? 'in stock' : 'out of stock'
          }. Want me to help you add it to your cart, or connect you with our team?`;
    }
    if (/deliver|shipping|ڈیلیوری/.test(lower)) {
      return language === 'ur'
        ? 'ہم پورے پاکستان میں کیش آن ڈیلیوری کرتے ہیں۔'
        : 'We deliver nationwide with Cash on Delivery.';
    }
    if (!leadCaptured) {
      setLeadCaptured(true);
      return language === 'ur'
        ? 'بہتر رہنمائی کے لیے، براہ کرم اپنا نام اور فون نمبر بتائیں تاکہ ہماری ٹیم رابطہ کر سکے۔'
        : 'Good question — to help you better, could you share your name and phone number so our team can follow up?';
    }
    return language === 'ur' ? 'شکریہ! ہماری ٹیم جلد آپ سے رابطہ کرے گی۔' : 'Got it — thanks! Our team will reach out shortly.';
  }

  const draggedStyle = pos ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' } : undefined;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2"
      style={draggedStyle}
    >
      <style>{`
        @keyframes aiBreathe {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.12); opacity: 1; }
        }
        .ai-breathe-text {
          animation: aiBreathe 2.2s ease-in-out infinite;
        }
        @keyframes aiSparkleTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.6) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.15) rotate(15deg); }
        }
        .ai-sparkle {
          animation: aiSparkleTwinkle 1.8s ease-in-out infinite;
        }
      `}</style>

      {open && (
        <div className="bg-white border border-neutral-200 rounded-2xl w-80 max-w-[85vw] h-96 flex flex-col overflow-hidden shadow-2xl">
          <div className="bg-neutral-50 px-4 py-3 flex items-center justify-between border-b border-neutral-200">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Your AI Assistant</p>
              <p className="text-[10px] text-neutral-500">Usually replies in seconds</p>
            </div>
            <button
              onClick={() => {
                setMessages([]);
                setLeadCaptured(false);
                greet();
              }}
              aria-label="Clear conversation"
              title="Clear conversation"
              className="text-neutral-500 hover:text-neutral-900 text-xs px-2 py-1 rounded-full hover:bg-black/5 transition-colors mr-1"
            >
              Clear
            </button>
            <button onClick={() => setOpen(false)} className="text-neutral-600 hover:text-neutral-900 text-xl">
              ×
            </button>
          </div>
          <div ref={messagesRef} className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.who === 'bot'
                    ? 'bg-neutral-50 text-neutral-800 rounded-xl rounded-bl-sm px-3 py-2 max-w-[85%]'
                    : 'bg-[var(--gold)] text-white rounded-xl rounded-br-sm px-3 py-2 max-w-[85%] ml-auto'
                }
              >
                {m.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitQuery(input);
            }}
            className="border-t border-neutral-200 p-2 flex gap-2 items-center"
          >
            <div className="relative flex-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? '🎙 Listening…' : 'Ask about a product…'}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-3 pr-16 py-1.5 text-sm focus:outline-none focus:border-[var(--gold)] text-neutral-900"
              />
              {input && (
                <button
                  type="button"
                  onClick={() => setInput('')}
                  aria-label="Clear"
                  className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.12" />
                    <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={handleMicClick}
                aria-label="Ask by voice"
                className={`absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  listening ? 'text-[var(--gold)] bg-black/5' : 'text-neutral-600 hover:text-[var(--gold)] hover:bg-white/5'
                }`}
              >
                {listening ? (
                  <span className="mic-waveform" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M19 11a7 7 0 0 1-14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>
            <button className="bg-[var(--gold)] text-white text-xs font-semibold px-3 rounded-full shrink-0" style={{ height: 32 }}>
              ➤
            </button>
          </form>
        </div>
      )}

      <div className="flex items-center gap-3 ai-row">
        <span className="ai-tooltip bg-white border border-neutral-200 text-neutral-800 text-sm px-4 py-2 rounded-full shadow-md">
          May I assist you?
        </span>
        <button
          onClick={handleOpen}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          aria-label="Open AI Assistant"
          title="Drag to move, click to chat"
          className="relative bg-black text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <span className="ai-toggle-ring" />

          {/* Sparkles around the circle */}
          <svg
            className="ai-sparkle absolute -top-1 -right-1 pointer-events-none"
            width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animationDelay: '0s' }}
          >
            <path d="M12 2.5L13.85 9.15L20.5 11L13.85 12.85L12 19.5L10.15 12.85L3.5 11L10.15 9.15L12 2.5Z" fill="white" />
          </svg>
          <svg
            className="ai-sparkle absolute -bottom-1 -left-1 pointer-events-none"
            width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ animationDelay: '0.6s' }}
          >
            <path d="M12 2.5L13.85 9.15L20.5 11L13.85 12.85L12 19.5L10.15 12.85L3.5 11L10.15 9.15L12 2.5Z" fill="white" />
          </svg>
          <svg
            className="ai-sparkle absolute top-0 left-0 pointer-events-none"
            width="8" height="8" viewBox="0 0 24 24" fill="none" style={{ animationDelay: '1.1s' }}
          >
            <path d="M12 2.5L13.85 9.15L20.5 11L13.85 12.85L12 19.5L10.15 12.85L3.5 11L10.15 9.15L12 2.5Z" fill="white" />
          </svg>

          {/* Breathing "AI" text */}
          <span className="ai-breathe-text text-sm font-bold tracking-wide" aria-hidden="true">
            AI
          </span>

          <span className="sr-only">AI Assistant</span>
        </button>
      </div>
    </div>
  );
}