'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      } else if (data?.user && !data?.session) {
        setInfoMsg('Account created! Please check your email inbox to confirm your registration before logging in.');
        setLoading(false);
      } else {
        router.push('/onboarding');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected registration error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#171717] flex items-center justify-center p-4 sm:p-6 md:p-12">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-xl border border-[#E8D6D9] bg-white shadow-xl overflow-hidden min-h-[600px]">
        
        {/* Left Editorial Branding Column */}
        <div className="lg:col-span-5 bg-[#FFF5F6] p-8 sm:p-12 border-b lg:border-b-0 lg:border-r border-[#E8D6D9] flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 z-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg bg-white border border-[#E8D6D9] p-1.5 shadow-sm flex items-center justify-center">
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
                <span className="text-xl font-bold font-serif tracking-tight text-[#171717] block">
                  DAYVERN
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C1121F] block font-semibold">
                  Personal Life Ledger
                </span>
              </div>
            </div>

            {/* Editorial Manifesto */}
            <div className="pt-8 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-serif text-[#171717] leading-snug">
                Begin Your Chronicle.
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed font-sans">
                Join a community of scholars, engineers, and athletes building daily discipline into tangible, server-verified progress.
              </p>
            </div>
          </div>

          {/* Bottom Editorial Pillars */}
          <div className="pt-8 border-t border-[#E8D6D9] grid grid-cols-2 gap-3 z-10">
            <div className="flex items-center gap-2 text-xs font-mono text-[#6B6B6B]">
              <ShieldCheck className="w-4 h-4 text-[#C1121F]" />
              <span>Immutable Ledger</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#6B6B6B]">
              <BookOpen className="w-4 h-4 text-[#C1121F]" />
              <span>Editorial Reader</span>
            </div>
          </div>
        </div>

        {/* Right Registration Form Column */}
        <div className="lg:col-span-7 p-8 sm:p-12 md:p-16 bg-white flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Header */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">
                Create Your Account
              </h1>
              <p className="text-xs sm:text-sm text-[#6B6B6B] font-sans">
                Enter your identity details to initialize your personal workstation.
              </p>
            </div>

            {/* Error / Info Banners */}
            {errorMsg && (
              <div className="p-4 bg-[#FDE7EA] border border-[#C1121F]/30 rounded-lg flex items-center gap-3 text-[#8F0D16] text-xs font-mono">
                <AlertCircle className="w-4 h-4 text-[#C1121F] shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-3 text-emerald-800 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{infoMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-[#6B6B6B] font-semibold tracking-wider">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Aiden Vance"
                    className="w-full bg-white border border-[#E8D6D9] rounded-md px-3.5 py-2.5 text-sm text-[#171717] placeholder-neutral-400 focus:outline-none focus:border-[#C1121F] transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-[#6B6B6B] font-semibold tracking-wider">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="aiden_vance"
                    className="w-full bg-white border border-[#E8D6D9] rounded-md px-3.5 py-2.5 text-sm text-[#171717] placeholder-neutral-400 focus:outline-none focus:border-[#C1121F] transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-[#6B6B6B] font-semibold tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scholar@dayvern.app"
                  className="w-full bg-white border border-[#E8D6D9] rounded-md px-3.5 py-2.5 text-sm text-[#171717] placeholder-neutral-400 focus:outline-none focus:border-[#C1121F] transition-all shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-[#6B6B6B] font-semibold tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-[#E8D6D9] rounded-md px-3.5 py-2.5 text-sm text-[#171717] placeholder-neutral-400 focus:outline-none focus:border-[#C1121F] transition-all shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C1121F] hover:bg-[#8F0D16] text-white font-mono font-bold py-3.5 px-6 rounded-md border-b-2 border-[#8F0D16] text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2"
              >
                {loading ? 'INITIALIZING ACCOUNT...' : 'PROCEED TO CLASS SPEC'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-6 border-t border-[#E8D6D9] text-xs font-sans text-[#6B6B6B]">
              Already registered?{' '}
              <Link href="/login" className="text-[#C1121F] hover:underline font-semibold font-mono">
                Sign In Here &rarr;
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
