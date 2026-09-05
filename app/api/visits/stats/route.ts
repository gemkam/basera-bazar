import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  const supabase = getServiceSupabase();

  const now = Date.now();
  const liveSince = new Date(now - 15 * 60 * 1000).toISOString(); // last 15 minutes
  const daySince = new Date(now - 24 * 60 * 60 * 1000).toISOString(); // last 24 hours

  const [{ data: liveRows }, { data: dayRows }] = await Promise.all([
    supabase.from('site_visits').select('country_name').gte('created_at', liveSince),
    supabase.from('site_visits').select('country_name').gte('created_at', daySince),
  ]);

  function tally(rows: { country_name: string | null }[] | null) {
    const counts: Record<string, number> = {};
    for (const row of rows || []) {
      const name = row.country_name || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    }
    return counts;
  }

  const liveCounts = tally(liveRows);
  const dayCounts = tally(dayRows);

  const liveTotal = liveRows?.length || 0;
  const dayTotal = dayRows?.length || 0;

  const live = Object.entries(liveCounts)
    .filter(([name]) => name !== 'Unknown')
    .map(([country_name, count]) => ({ country_name, count }))
    .sort((a, b) => b.count - a.count);

  const daily = Object.entries(dayCounts)
    .filter(([name]) => name !== 'Unknown')
    .map(([country_name, count]) => ({
      country_name,
      count,
      percent: dayTotal > 0 ? Math.round((count / dayTotal) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ liveTotal, dayTotal, live, daily });
}