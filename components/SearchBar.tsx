'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/supabase';
import { useLanguage } from '@/lib/language-context';

// Minimal ambient types for the Web Speech API (not in default TS lib)
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

export default function SearchBar() {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (transcript) setQuery(transcript);
    };
    recognitionRef.current = recognition;
  }, []);

  function handleMicClick() {
    if (!recognitionRef.current) {
      alert("Voice search isn't supported in this browser — try Chrome, Edge, or Safari.");
      return;
    }
    if (!window.isSecureContext) {
      alert('Voice search only works when this site is served over HTTPS.');
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

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .ilike('title', `%${q}%`)
      .limit(6);
    setResults(data || []);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={boxRef} className="relative flex-1 max-w-xs hidden sm:block">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query && setOpen(true)}
        placeholder={listening ? '🎙 Listening…' : 'Search products… / تلاش کریں'}
        className="w-full bg-neutral-50 border border-neutral-300 rounded-full pl-4 pr-9 py-1.5 text-sm placeholder-neutral-400 focus:outline-none focus:border-[var(--gold)] text-neutral-900"
      />
      <button
        type="button"
        onClick={handleMicClick}
        aria-label="Search by voice"
        className={`absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
          listening ? 'text-[var(--gold)] bg-black/5' : 'text-neutral-600 hover:text-[var(--gold)] hover:bg-white/5'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M19 11a7 7 0 0 1-14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute mt-2 w-full bg-white border border-neutral-200 rounded-xl overflow-hidden z-50 max-h-80 overflow-y-auto shadow-2xl">
          {results.length ? (
            results.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.handle}`}
                onClick={() => setOpen(false)}
                className="px-3 py-2 hover:bg-neutral-50 text-sm flex justify-between items-center block transition-colors"
              >
                <span className="text-neutral-800 line-clamp-1">{p.title}</span>
                <span className="text-[var(--gold)] shrink-0 ml-2">Rs. {p.price.toLocaleString()}</span>
              </Link>
            ))
          ) : (
            <div className="px-3 py-3 text-xs text-neutral-500">No matches</div>
          )}
        </div>
      )}
    </div>
  );
}
