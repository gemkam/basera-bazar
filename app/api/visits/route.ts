import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

// Vercel automatically attaches these headers on deployed traffic
// (they are empty on localhost — that's expected and fine).
const COUNTRY_NAMES: Record<string, string> = {
  PK: 'Pakistan', OM: 'Oman', AE: 'UAE', SA: 'Saudi Arabia', QA: 'Qatar',
  KW: 'Kuwait', BH: 'Bahrain', US: 'the USA', CA: 'Canada', GB: 'the UK',
  CN: 'China', JP: 'Japan', KR: 'South Korea', IN: 'India', BD: 'Bangladesh',
  AU: 'Australia', DE: 'Germany', FR: 'France', TR: 'Turkey', MY: 'Malaysia',
  SG: 'Singapore', ID: 'Indonesia', EG: 'Egypt', ES: 'Spain', IT: 'Italy',
  NL: 'the Netherlands', AF: 'Afghanistan', IR: 'Iran', NO: 'Norway',
  SE: 'Sweden', RU: 'Russia', BR: 'Brazil', ZA: 'South Africa', NZ: 'New Zealand',
};

export async function POST(req: NextRequest) {
  const countryCode = req.headers.get('x-vercel-ip-country') || null;
  const city = req.headers.get('x-vercel-ip-city')
    ? decodeURIComponent(req.headers.get('x-vercel-ip-city') as string)
    : null;
  const countryName = countryCode ? COUNTRY_NAMES[countryCode] || countryCode : null;

  const supabase = getServiceSupabase();
  await supabase.from('site_visits').insert({
    country_code: countryCode,
    country_name: countryName,
    city,
  });

  return NextResponse.json({ ok: true });
}