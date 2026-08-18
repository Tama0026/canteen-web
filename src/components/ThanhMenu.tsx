'use client';

import Link from 'next/link';
import { UtensilsCrossed, Calendar, ShieldCheck, Sparkles, Leaf } from 'lucide-react';
import { getCurrentDateInfo } from '@/lib/menu-helpers';

export default function ThanhMenu() {
  const dateInfo = getCurrentDateInfo();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                  NHÀ ĂN CÔNG TY
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-500" />
                  Live Menu
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Thực đơn Ca Sáng & Ca Chiều • Mặn & Chay
              </p>
            </div>
          </Link>

          {/* Current Date Badge & Admin Link */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>Hôm nay: <strong className="text-orange-600 dark:text-orange-400">{dateInfo.dayNameVi}</strong> ({dateInfo.formattedDate})</span>
              <span className="px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-semibold">
                Tuần {dateInfo.weekNumber}
              </span>
            </div>

            <Link
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
