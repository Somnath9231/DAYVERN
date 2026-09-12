'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled DAYVERN error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white text-[#171717] flex items-center justify-center p-4">
      <div className="rpg-panel p-8 max-w-md w-full text-center space-y-5 border border-[#E8D6D9] bg-white">
        <div className="w-12 h-12 rounded-lg bg-[#FFF5F6] border border-[#E8D6D9] flex items-center justify-center text-[#C1121F] mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h1 className="font-serif font-bold text-xl text-[#171717]">System Recovery Required</h1>
          <p className="text-xs text-[#6B6B6B]">
            {error?.message || 'An unexpected application exception occurred.'}
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 bg-[#C1121F] hover:bg-[#8F0D16] text-white font-mono font-bold px-4 py-2.5 min-h-[44px] rounded border-b-2 border-[#8F0D16] text-xs transition-all focus-visible:ring-2 focus-visible:ring-[#C1121F] focus-visible:outline-none"
          >
            <RotateCcw className="w-4 h-4" /> Retry Action
          </button>
          
          <Link
            href="/"
            className="flex items-center gap-2 bg-[#FFF5F6] border border-[#E8D6D9] text-[#171717] hover:bg-[#FDE7EA] font-mono text-xs px-4 py-2.5 min-h-[44px] rounded transition-all focus-visible:ring-2 focus-visible:ring-[#C1121F] focus-visible:outline-none"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
