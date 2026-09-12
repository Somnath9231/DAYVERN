import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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

function getRequestOrigin(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;
  const proto = request.headers.get('x-forwarded-proto') || (request.nextUrl.protocol.startsWith('https') ? 'https' : 'http');
  return `${proto}://${host}`;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = getSanitizedSupabaseUrl();
  const supabaseAnonKey = getSanitizedSupabaseAnonKey();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const pathname = request.nextUrl.pathname;

  // Skip middleware processing for internal Next.js paths, static files, and API endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return supabaseResponse;
  }

  // Unauthenticated auth routes
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isOnboardingRoute = pathname.startsWith('/onboarding');

  // Verify authentic user token via getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const origin = getRequestOrigin(request);

  // Redirect unauthenticated users attempting to access protected routes
  if (!user && !isAuthRoute && !isOnboardingRoute) {
    const redirectUrl = new URL('/login', origin);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users trying to access login or register back to home
  if (user && isAuthRoute) {
    const redirectUrl = new URL('/', origin);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files, image optimization, and static assets.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
