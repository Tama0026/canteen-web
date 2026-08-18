'use client';

import Link from 'next/link';
import { UtensilsCrossed, ShieldCheck, Sparkles, Leaf } from 'lucide-react';

export default function ThanhMenu() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 overflow-hidden group-hover:scale-105 transition-transform shrink-0">
              <img src="/icon.png" alt="MENU SIMONE Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight uppercase">
                MENU SIMONE TG1
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">            <Link
              href="/dk-chay"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Leaf className="w-4 h-4" />
              <span>ĐK CHAY</span>
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400 dark:text-amber-600" />
              <span>Quản trị Menu</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
