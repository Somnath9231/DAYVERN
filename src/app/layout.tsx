import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'DAYVERN | Life RPG Workstation',
  description: 'Convert real-world study, coding, workouts, and habits into a classic personal ledger.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('dayvern-theme');
                  var pref = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && pref)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-white dark:bg-[#0F1012] text-[#171717] dark:text-[#F5F5F2] antialiased min-h-screen selection:bg-[#FDE7EA] selection:text-[#C1121F] dark:selection:bg-[#35171B] dark:selection:text-[#F04452]">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

