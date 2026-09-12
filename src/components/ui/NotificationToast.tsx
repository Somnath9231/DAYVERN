'use client';

import { useEffect } from 'react';
import { Sparkles, Trophy, Coins, X } from 'lucide-react';

interface NotificationToastProps {
  notification: {
    title: string;
    message: string;
    type: 'xp' | 'level' | 'gold' | 'achievement';
  } | null;
  onClose: () => void;
}

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const isLevelUp = notification.type === 'level';

  return (
    <div className={`fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-lg border shadow-lg transition-all duration-300 transform animate-in slide-in-from-bottom-5 ${
      isLevelUp 
        ? 'bg-[#FFF5F6] border-[#C1121F] text-[#171717] shadow-red-900/10' 
        : 'bg-white border-[#E8D6D9] text-[#171717]'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded ${isLevelUp ? 'bg-[#C1121F] text-white' : 'bg-[#FFF5F6] text-[#C1121F] border border-[#E8D6D9]'}`}>
          {notification.type === 'level' && <Sparkles className="w-5 h-5" />}
          {notification.type === 'xp' && <Sparkles className="w-5 h-5 text-[#C1121F]" />}
          {notification.type === 'gold' && <Coins className="w-5 h-5 text-[#C1121F]" />}
          {notification.type === 'achievement' && <Trophy className="w-5 h-5 text-[#C1121F]" />}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm font-mono tracking-wide text-[#171717]">{notification.title}</h4>
          <p className="text-xs text-[#6B6B6B] mt-0.5">{notification.message}</p>
        </div>

        <button 
          onClick={onClose}
          className="text-[#6B6B6B] hover:text-[#171717] p-1 rounded hover:bg-[#FFF5F6]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
