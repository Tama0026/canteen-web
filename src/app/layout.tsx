import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'MENU SIMONE TG1',
  description: 'Hệ thống theo dõi thực đơn nhà ăn công ty, hiển thị ca sáng và ca chiều, món mặn và món chay theo chu kỳ tuần 1-3 và tuần 2-4.',
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
