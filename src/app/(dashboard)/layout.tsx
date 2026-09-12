'use client';

import { useState } from 'react';
import { useDayvernStore } from '@/lib/store/dayvernStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ActivityLoggerModal } from '@/components/activities/ActivityLoggerModal';
import { NotificationToast } from '@/components/ui/NotificationToast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { 
    state, 
    logActivity, 
    lastNotification, 
    clearNotification 
  } = useDayvernStore();

  const [isLoggerOpen, setIsLoggerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1012] text-[#171717] dark:text-[#F5F5F2] flex">
      {/* Sidebar */}
      <Sidebar 
        profile={state.profile} 
        onOpenLogger={() => setIsLoggerOpen(true)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0F1012]">
        <Header 
          profile={state.profile} 
          onOpenLogger={() => setIsLoggerOpen(true)} 
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8 bg-white dark:bg-[#0F1012]">
          {children}
        </main>
      </div>

      {/* Activity Logger Modal */}
      <ActivityLoggerModal
        isOpen={isLoggerOpen}
        onClose={() => setIsLoggerOpen(false)}
        onLog={logActivity}
        streakCount={state.profile.streak_count}
        characterClass={state.profile.character_class}
      />

      {/* Notification Toast */}
      <NotificationToast
        notification={lastNotification}
        onClose={clearNotification}
      />
    </div>
  );
}
