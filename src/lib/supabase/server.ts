import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

export async function createClient() {
  const cookieStore = cookies();

  const supabaseUrl = getSanitizedSupabaseUrl();
  const supabaseAnonKey = getSanitizedSupabaseAnonKey();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from Server Components, ignore if read-only
        }
      },
    },
  });
}
