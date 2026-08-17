'use client';

import { MenuItem, MealTypeKey, WeekNumber } from '@/types/menu';
import { getEffectiveDish } from '@/lib/menu-helpers';
import { Drumstick, Egg, Salad, Soup, Apple, Sparkles, RefreshCw } from 'lucide-react';

interface MealDishCardProps {
  item: MenuItem | undefined;
  mealType: MealTypeKey;
  weekNumber: WeekNumber;
  showAllCourses?: boolean;
}

export default function MealDishCard({
  item,
  mealType,
  weekNumber,
}: MealDishCardProps) {
  const isVegetarian = mealType === 'vegetarian';

  if (!item || (!item.mainDish1 && !item.mainDish2 && !item.sideDish && !item.soup && !item.dessert)) {
    return (
      <div className="h-full min-h-[320px] p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 text-sm">
        <span>Chưa có thông tin thực đơn cho bữa này</span>
      </div>
    );
  }

  const main1Parsed = getEffectiveDish(item.mainDish1, weekNumber);
  const main2Parsed = getEffectiveDish(item.mainDish2, weekNumber);

  return (
    <div className={`h-full flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-md ${
      isVegetarian
        ? 'bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border-emerald-200/80 dark:border-emerald-800/40 shadow-emerald-500/5'
        : 'bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border-amber-200/80 dark:border-amber-800/40 shadow-amber-500/5'
    }`}>
      {/* Header Badge */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <span className={`w-3 h-3 rounded-full ${isVegetarian ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
          <span className={`text-xs sm:text-sm font-black uppercase tracking-wider ${isVegetarian ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
            {isVegetarian ? '🥬 THỰC ĐƠN ĂN CHAY' : '🍖 THỰC ĐƠN MÓN MẶN'}
          </span>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 shadow-xs">
          Tuần {weekNumber}
        </span>
      </div>

      {/* Main Body Content */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        {/* Top: Main Dishes Section */}
        <div className="space-y-3">
          {/* Món Chính 1 */}
          <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-800/95 border border-slate-200/80 dark:border-slate-700 shadow-xs">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${isVegetarian ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                {isVegetarian ? <Salad className="w-5 h-5" /> : <Drumstick className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    MÓN CHÍNH
                  </span>
                  {main1Parsed.hasAlternating && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" />
                      Xen kẽ tuần
                    </span>
                  )}
                </div>
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white capitalize truncate mt-0.5">
                  {main1Parsed.name || '—'}
                </h4>
              </div>
            </div>

            {/* Alternating Note if present */}
            {main1Parsed.hasAlternating && main1Parsed.alternatingDetails && (
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>{main1Parsed.alternatingDetails.note}</span>
              </div>
            )}
          </div>

          {/* Món Chính 2 / Món Phụ (Luôn render để 2 bên cân xứng 100%) */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            item.mainDish2 
              ? 'bg-white/80 dark:bg-slate-800/80 border-slate-200/70 dark:border-slate-700/70 shadow-xs' 
              : 'bg-slate-50/50 dark:bg-slate-800/30 border-dashed border-slate-200/50 dark:border-slate-700/40 opacity-70'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${
                item.mainDish2 
                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' 
                  : 'bg-transparent text-slate-300 dark:text-slate-600'
              }`}>
                <Egg className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  MÓN CHÍNH 2 / MÓN PHỤ
                </span>
                <p className={`text-sm sm:text-base font-bold capitalize truncate ${
                  item.mainDish2 ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 font-normal italic'
                }`}>
                  {item.mainDish2 ? main2Parsed.name : '— (Theo khẩu phần)'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Món Xào, Canh, Tráng Miệng (Luôn nằm ở đáy và thẳng hàng nhau) */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <div className="grid grid-cols-3 gap-2.5">
            {/* Món Xào / Rau */}
            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex flex-col justify-between min-h-[64px]">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Salad className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase truncate">Món xào / Rau</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate mt-1">
                {item.sideDish || '—'}
              </p>
            </div>

            {/* Canh */}
            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex flex-col justify-between min-h-[64px]">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Soup className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase truncate">Món canh</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate mt-1">
                {item.soup || '—'}
              </p>
            </div>

            {/* Tráng miệng */}
            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex flex-col justify-between min-h-[64px]">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Apple className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase truncate">Tráng miệng</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate mt-1">
                {item.dessert || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
