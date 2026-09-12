import { createBrowserClient } from '@supabase/ssr';

function getSanitizedSupabaseUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!rawUrl) return 'https://placeholder.supabase.co';
  let cleaned = rawUrl.trim();
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned.replace(/\/+$/, '');
}

function getSanitizedSupabaseAnonKey(): string {
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!rawKey) return 'placeholder-anon-key';
  return rawKey.trim();
}

export function createClient() {
  const supabaseUrl = getSanitizedSupabaseUrl();
  const supabaseAnonKey = getSanitizedSupabaseAnonKey();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
