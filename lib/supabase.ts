import { createClient } from '@supabase/supabase-js';

// Public URL + anon key are safe to ship in the client bundle (protected by RLS policies).
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ujxzrncwnmazpygaoxbt.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_F5nloMxsy7YchzcwxgUFZA_lRGnbxKh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role for admin operations.
// SUPABASE_SERVICE_ROLE_KEY must be set in Vercel project settings (Supabase dashboard -> Settings -> API).
export function getServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it in Vercel project settings to enable admin writes.'
    );
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type Product = {
  id: string;
  handle: string;
  title: string;
  description_html: string | null;
  category_id: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};
