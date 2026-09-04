'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/supabase';
import { useLanguage } from '@/lib/language-context';
import { extractKeywords } from '@/lib/search-keywords';

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

function Waveform() {
  return (
    <span className="mic-waveform" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </span>
  );
}

export default function SearchBar() {
  const { language } = useLanguage();
  const [panelOpen, setPanelOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [searched, setSearched] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  function openPanel() {
    setPanelOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function closePanel() {
    setPanelOpen(false);
    if (listening) recognitionRef.current?.stop();
  }

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
      setSearched(false);
      return;
    }
    const keywords = extractKeywords(q);
    const searchTerms = keywords.length ? keywords : [q.trim()];
    const orFilter = searchTerms.map((k) => `title.ilike.%${k}%`).join(',');
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .or(orFilter)
      .limit(12);
    setResults(data || []);
    setSearched(true);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && panelOpen) closePanel();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen]);

  return (
    <>
      {/* Trigger button in the nav */}
      <button
        type="button"
        onClick={openPanel}
        aria-label="Search"
        className="hidden sm:flex items-center gap-2 text-sm text-neutral-600 border border-neutral-300 rounded-full pl-3 pr-4 py-1.5 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Search
      </button>

      {panelOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-neutral-200 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-400 shrink-0">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={listening ? 'Listening…' : 'Search products… / تلاش کریں'}
                className="flex-1 text-lg outline-none text-neutral-900 placeholder-neutral-400 bg-transparent"
              />
              <button
                type="button"
                onClick={handleMicClick}
                aria-label="Search by voice"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  listening ? 'text-[var(--gold)] bg-black/5' : 'text-neutral-500 hover:text-[var(--gold)] hover:bg-black/5'
                }`}
              >
                {listening ? (
                  <Waveform />
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M19 11a7 7 0 0 1-14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={closePanel}
                aria-label="Close search"
                className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-black/5 shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {!searched && (
                <p className="px-5 py-8 text-center text-sm text-neutral-400">
                  Start typing or tap the mic to search — try &quot;fan&quot;, &quot;perfume&quot;, or ask a full question.
                </p>
              )}
              {searched && results.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-neutral-500">No products matched &quot;{query}&quot;.</p>
              )}
              {results.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.handle}`}
                  onClick={closePanel}
                  className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-0"
                >
                  <span className="text-sm text-neutral-800">{p.title}</span>
                  <span className="text-[var(--gold)] font-semibold shrink-0">Rs. {p.price.toLocaleString()}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
