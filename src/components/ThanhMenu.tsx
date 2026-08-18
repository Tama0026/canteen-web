'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Leaf, UtensilsCrossed } from 'lucide-react';

export default function ThanhMenu() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Corporate Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1 flex items-center justify-center">
              <img src="/icon.png" alt="Simone Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight uppercase">
                  SIMONE TG1
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  CANTEEN PORTAL
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Hệ thống quản lý và tra cứu thực đơn nhà ăn
              </span>
            </div>
          </Link>

          {/* Action Navigation */}
          <div className="flex items-center gap-2">
            <Link
              href="/dk-chay"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pathname === '/dk-chay'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đăng Ký Cơm Chay</span>
            </Link>

            <Link
              href="/admin"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pathname === '/admin'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Quản Trị</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}


