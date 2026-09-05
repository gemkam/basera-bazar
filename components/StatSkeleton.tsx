"use client";

/**
 * Drop-in replacement for the "0 categories / 0 products / 0 hr delivery"
 * flash that shows before data loads. Use this while your data-fetch
 * (Supabase query etc.) is in a loading state, then swap to the real
 * numbers once loaded.
 *
 * Usage:
 *   {loading ? <StatSkeleton count={3} /> : <YourRealStats />}
 */
export default function StatSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className="skeleton h-8 w-16" />
          <div className="skeleton h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
