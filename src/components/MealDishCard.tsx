'use client';

import { MenuItem, MealTypeKey, WeekNumber } from '@/types/menu';
import { getEffectiveDish } from '@/lib/menu-helpers';

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
    <div className={`h-full flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-md bg-white dark:bg-slate-900 ${
      isVegetarian ? 'border-emerald-200 dark:border-emerald-800' : 'border-amber-200 dark:border-amber-800'
    }`}>
      {/* Header Badge */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <span className={`text-base sm:text-lg font-black uppercase tracking-wider ${isVegetarian ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
            {isVegetarian ? 'THỰC ĐƠN ĂN CHAY' : 'THỰC ĐƠN MÓN MẶN'}
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
            <div className="flex-1 min-w-0">
              <span className="text-base sm:text-lg font-bold text-black dark:text-white block mb-1">
                Món chính 1
              </span>
              <h4 className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 capitalize truncate">
                {main1Parsed.name || ''}
              </h4>
            </div>
          </div>

          {/* Món Chính 2 / Món Phụ */}
          {item.mainDish2 && (
            <div className="p-3.5 rounded-2xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex-1 min-w-0">
                <span className="text-base sm:text-lg font-bold text-black dark:text-white block mb-1">
                  Món chính 2
                </span>
                <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 capitalize truncate">
                  {main2Parsed.name}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom: Món Xào, Canh, Tráng Miệng */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <div className="grid grid-cols-3 gap-2.5">
            {/* Món Xào / Rau */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between min-h-[60px]">
              <span className="text-base sm:text-lg font-bold text-black dark:text-white block truncate">Món xào / Rau</span>
              <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 capitalize truncate mt-1">
                {item.sideDish || ''}
              </p>
            </div>

            {/* Canh */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between min-h-[60px]">
              <span className="text-base sm:text-lg font-bold text-black dark:text-white block truncate">Món canh</span>
              <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 capitalize truncate mt-1">
                {item.soup || ''}
              </p>
            </div>

            {/* Tráng miệng */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between min-h-[60px]">
              <span className="text-base sm:text-lg font-bold text-black dark:text-white block truncate">Tráng miệng</span>
              <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 capitalize truncate mt-1">
                {item.dessert || ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
