'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  // Build a compact page list: always show first, last, current, and
  // one neighbour on each side; collapse the rest with "...".
  const pages: (number | 'ellipsis')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis');
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed hover:border-black transition-colors"
      >
        ‹
      </button>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-1 text-neutral-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            aria-label={`Go to page ${p}`}
            aria-current={p === currentPage ? 'page' : undefined}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              p === currentPage
                ? 'bg-black text-white'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed hover:border-black transition-colors"
      >
        ›
      </button>
    </div>
  );
}