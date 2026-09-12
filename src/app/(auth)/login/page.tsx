'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle, ShieldCheck, BookOpen, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected authentication error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1012] text-[#171717] dark:text-[#F5F5F2] flex items-center justify-center p-4 sm:p-6 md:p-12">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-xl border border-[#E8D6D9] dark:border-[#303238] bg-white dark:bg-[#17191D] shadow-xl overflow-hidden min-h-[600px]">
        
        {/* Left Editorial Branding Column (Desktop 5 cols / Light Warm Panel) */}
        <div className="lg:col-span-5 bg-[#FFF5F6] dark:bg-[#17191D] p-8 sm:p-12 border-b lg:border-b-0 lg:border-r border-[#E8D6D9] dark:border-[#303238] flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 z-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] p-1.5 shadow-sm flex items-center justify-center">
                <Image
                  src="/DAY.png.png"
                  alt="DAYVERN Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <span className="text-xl font-bold font-serif tracking-tight text-[#171717] dark:text-[#F5F5F2] block">
                  DAYVERN
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C1121F] dark:text-[#F04452] block font-semibold">
                  Personal Life Ledger
                </span>
              </div>
            </div>

            {/* Editorial Manifesto Quote */}
            <div className="pt-8 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-serif text-[#171717] dark:text-[#F5F5F2] leading-snug">
                Architect Your Potential.
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6B6B] dark:text-[#8B8D91] leading-relaxed font-sans">
                Convert your real-world study hours, software craftsmanship, physical discipline, and stoic reading into an authoritative personal growth ledger.
              </p>
            </div>
          </div>

          {/* Bottom Editorial Pillars */}
          <div className="pt-8 border-t border-[#E8D6D9] dark:border-[#303238] grid grid-cols-2 gap-3 z-10">
            <div className="flex items-center gap-2 text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91]">
              <ShieldCheck className="w-4 h-4 text-[#C1121F] dark:text-[#F04452]" />
              <span>Server Verified</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91]">
              <BookOpen className="w-4 h-4 text-[#C1121F] dark:text-[#F04452]" />
              <span>Classic Library</span>
            </div>
          </div>
        </div>

        {/* Right Authentication Form Column (Desktop 7 cols / Clean White Surface) */}
        <div className="lg:col-span-7 p-8 sm:p-12 md:p-16 bg-white dark:bg-[#1D2025] flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Header */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717] dark:text-[#F5F5F2]">
                Sign In to DAYVERN
              </h1>
              <p className="text-xs sm:text-sm text-[#6B6B6B] dark:text-[#8B8D91] font-sans">
                Enter your registered credentials to resume your workstation.
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-4 bg-[#FDE7EA] dark:bg-[#35171B] border border-[#C1121F]/30 dark:border-[#F04452]/40 rounded-lg flex items-center gap-3 text-[#8F0D16] dark:text-[#F04452] text-xs font-mono">
                <AlertCircle className="w-4 h-4 text-[#C1121F] dark:text-[#F04452] shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-[#6B6B6B] dark:text-[#8B8D91] font-semibold tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scholar@dayvern.app"
                  className="w-full bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-md px-4 py-3 text-sm text-[#171717] dark:text-[#F5F5F2] placeholder-neutral-400 focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452] transition-all shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono uppercase text-[#6B6B6B] dark:text-[#8B8D91] font-semibold tracking-wider">
                    Password
                  </label>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-md px-4 py-3 text-sm text-[#171717] dark:text-[#F5F5F2] placeholder-neutral-400 focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452] transition-all shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-mono font-bold py-3.5 px-6 rounded-md border-b-2 border-[#8F0D16] dark:border-[#C1121F] text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading ? 'AUTHENTICATING...' : 'SIGN IN TO WORKSTATION'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Registration Link */}
            <div className="text-center pt-6 border-t border-[#E8D6D9] dark:border-[#303238] text-xs font-sans text-[#6B6B6B] dark:text-[#8B8D91]">
              Don&apos;t have a DAYVERN account yet?{' '}
              <Link href="/register" className="text-[#C1121F] dark:text-[#F04452] hover:underline font-semibold font-mono">
                Create Account &rarr;
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

