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
            <div className="h-12 sm:h-14 w-12 sm:w-14 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
              <img 
                src="/icon.png" 
                alt="Simone Logo" 
                className="h-full w-full object-cover" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight uppercase">
                  SIMONE TG1
                </span>
              </div>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                Hệ thống tra cứu & quản lý thực đơn nhà ăn
              </span>
            </div>
          </Link>

          {/* Action Navigation */}
          <div className="flex items-center gap-2">
            <Link
              href="/dk-chay"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pathname === '/dk-chay'
                  ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <Leaf className={`w-3.5 h-3.5 ${pathname === '/dk-chay' ? 'text-pink-600 dark:text-pink-400' : 'text-emerald-600'}`} />
              <span>Đăng Ký Cơm Chay</span>
            </Link>

            <Link
              href="/admin"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pathname === '/admin'
                  ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <Shield className={`w-3.5 h-3.5 ${pathname === '/admin' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-400'}`} />
              <span>Quản Trị</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}


