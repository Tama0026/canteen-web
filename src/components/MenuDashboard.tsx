'use client';

import { useState, useMemo } from 'react';
import { 
  FullMenuDatabase, 
  DayKey, 
  ShiftKey, 
  MealTypeKey, 
  WeekNumber, 
  DAY_KEYS, 
  DAY_NAMES, 
  SHIFT_NAMES, 
  MEAL_TYPE_NAMES 
} from '@/types/menu';
import { getCycleForWeek, getCurrentDateInfo, getEffectiveDish } from '@/lib/menu-helpers';
import MealDishCard from '@/components/MealDishCard';
import { 
  CalendarDays, 
  Sun, 
  Moon, 
  Sparkles, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Layers,
  ChefHat,
  Filter
} from 'lucide-react';

interface MenuDashboardProps {
  initialMenu: FullMenuDatabase;
}

export default function MenuDashboard({ initialMenu }: MenuDashboardProps) {
  const dateInfo = getCurrentDateInfo();

  // State
  const [selectedWeek, setSelectedWeek] = useState<WeekNumber>(dateInfo.weekNumber);
  const [selectedShift, setSelectedShift] = useState<ShiftKey>('morning');
  const [selectedMealType, setSelectedMealType] = useState<MealTypeKey | 'both'>('both');
  const [selectedDay, setSelectedDay] = useState<DayKey>(dateInfo.dayKey);
  const [viewMode, setViewMode] = useState<'today' | 'weekly'>('today');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const cycleKey = getCycleForWeek(selectedWeek);

  // Search Results Filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase().trim();
    const results: Array<{
      week: WeekNumber;
      cycleKey: string;
      shift: ShiftKey;
      mealType: MealTypeKey;
      dayKey: DayKey;
      matchField: string;
      dishName: string;
    }> = [];

    const weeks: WeekNumber[] = [1, 2, 3, 4];
    weeks.forEach(w => {
      const cKey = getCycleForWeek(w);
      const shifts: ShiftKey[] = ['morning', 'afternoon'];
      const mealTypes: MealTypeKey[] = ['regular', 'vegetarian'];

      shifts.forEach(s => {
        mealTypes.forEach(m => {
          DAY_KEYS.forEach(d => {
            const item = initialMenu[cKey]?.[s]?.[m]?.[d];
            if (!item) return;

            const checkDish = (name: string, field: string) => {
              if (!name) return;
              const effective = getEffectiveDish(name, w);
              if (
                name.toLowerCase().includes(query) ||
                effective.name.toLowerCase().includes(query)
              ) {
                results.push({
                  week: w,
                  cycleKey: cKey,
                  shift: s,
                  mealType: m,
                  dayKey: d,
                  matchField: field,
                  dishName: effective.name,
                });
              }
            };

            checkDish(item.mainDish1, 'Món chính 1');
            checkDish(item.mainDish2 || '', 'Món chính 2');
            checkDish(item.sideDish || '', 'Món xào/rau');
            checkDish(item.soup || '', 'Món canh');
            checkDish(item.dessert || '', 'Tráng miệng');
          });
        });
      });
    });

    return results;
  }, [searchQuery, initialMenu]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Banner & Fast Controls */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-amber-300 mb-3 border border-white/10">
              <ChefHat className="w-3.5 h-3.5" />
              <span>Hệ Thống Thực Đơn Thông Minh</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Lịch Nhà Ăn Tuần & Ca Bữa
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-xl">
              Theo dõi lịch phục vụ ca sáng và ca chiều, món mặn và món chay. Tự động xen kẽ thực đơn Tuần 1-3 & Tuần 2-4.
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-80">
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Tìm kiếm món ăn nhanh</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ví dụ: cá sapa, sườn, đùi gà..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white/15 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-300 hover:text-white bg-white/10 px-2 py-0.5 rounded-md"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search Results Display (if searching) */}
      {searchQuery && searchResults && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-900 dark:text-white space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Search className="w-4 h-4" />
              Tìm thấy {searchResults.length} kết quả cho &quot;{searchQuery}&quot;
            </h3>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Đóng tìm kiếm
            </button>
          </div>

          {searchResults.length === 0 ? (
            <p className="text-sm text-slate-500">Không tìm thấy món ăn nào khớp với từ khóa.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {searchResults.slice(0, 9).map((res, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedWeek(res.week);
                    setSelectedShift(res.shift);
                    setSelectedDay(res.dayKey);
                    setSelectedMealType(res.mealType);
                    setViewMode('today');
                    setSearchQuery('');
                  }}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-amber-400 hover:shadow-md transition-all text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {DAY_NAMES[res.dayKey].vi} • Tuần {res.week}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      res.mealType === 'vegetarian' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {res.mealType === 'vegetarian' ? 'Chay' : 'Mặn'}
                    </span>
                  </div>
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-100 capitalize">
                    {res.dishName}
                  </p>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{SHIFT_NAMES[res.shift].vi}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">Bấm để xem →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Filter & Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Row 1: Week Selector & View Mode Switch */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Week Selector */}
          <div>
            <span className="block text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Chọn Tuần Trong Tháng
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([1, 2, 3, 4] as WeekNumber[]).map((w) => {
                const isSelected = selectedWeek === w;
                const isCurrent = dateInfo.weekNumber === w;
                const cycle = getCycleForWeek(w);
                const cycleLabel = cycle === 'cycle_1_3' ? 'Chu kỳ 1-3' : 'Chu kỳ 2-4';

                return (
                  <button
                    key={w}
                    onClick={() => setSelectedWeek(w)}
                    className={`relative px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-left transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Tuần {w}</span>
                      {isCurrent && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                        }`}>
                          Hiện tại
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] block font-normal opacity-80 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {cycleLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* View Mode (Hôm nay / Cả tuần) */}
          <div className="lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-6">
            <span className="block text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              Chế độ hiển thị
            </span>
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
              <button
                onClick={() => setViewMode('today')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  viewMode === 'today'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4 text-orange-500" />
                <span>Món theo ngày</span>
              </button>
              <button
                onClick={() => setViewMode('weekly')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  viewMode === 'weekly'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="w-4 h-4 text-indigo-500" />
                <span>Bảng cả tuần</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Shift Selector & Meal Type Filter */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Shift (Ca Sáng / Ca Chiều) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Ca ăn:</span>
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setSelectedShift('morning')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedShift === 'morning'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Sun className="w-4 h-4 text-yellow-200" />
                <span>Ca Sáng (Trưa)</span>
              </button>
              <button
                onClick={() => setSelectedShift('afternoon')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedShift === 'afternoon'
                    ? 'bg-gradient-to-r from-indigo-700 to-slate-800 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-300" />
                <span>Ca Chiều (Tối)</span>
              </button>
            </div>
          </div>

          {/* Meal Type Filter (Tất cả / Mặn / Chay) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Khẩu vị:</span>
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setSelectedMealType('both')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedMealType === 'both'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setSelectedMealType('regular')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedMealType === 'regular'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                🍖 Mặn
              </button>
              <button
                onClick={() => setSelectedMealType('vegetarian')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedMealType === 'vegetarian'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                🥬 Chay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: SINGLE DAY SPOTLIGHT */}
      {viewMode === 'today' && (
        <div className="space-y-5">
          {/* Day Navigation Tabs (Thứ 2 -> Thứ 7) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {DAY_KEYS.map((d) => {
              const isSelected = selectedDay === d;
              const isToday = dateInfo.dayKey === d;

              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`flex-1 min-w-[100px] sm:min-w-0 px-4 py-3 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md scale-[1.02] font-extrabold'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 font-semibold'
                  }`}
                >
                  <div className="text-sm sm:text-base flex items-center justify-center gap-1.5">
                    <span>{DAY_NAMES[d].vi}</span>
                    {isToday && (
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-orange-500'}`} />
                    )}
                  </div>
                  <span className={`text-[10px] block font-medium ${isSelected ? 'opacity-80' : 'text-slate-400'}`}>
                    {isToday ? 'Hôm nay' : 'Lịch tuần'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Cards Display for Selected Day */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            {/* Regular Meal Card */}
            {(selectedMealType === 'both' || selectedMealType === 'regular') && (
              <div className="flex flex-col h-full">
                <MealDishCard
                  item={initialMenu[cycleKey]?.[selectedShift]?.regular?.[selectedDay]}
                  mealType="regular"
                  weekNumber={selectedWeek}
                />
              </div>
            )}

            {/* Vegetarian Meal Card */}
            {(selectedMealType === 'both' || selectedMealType === 'vegetarian') && (
              <div className="flex flex-col h-full">
                <MealDishCard
                  item={initialMenu[cycleKey]?.[selectedShift]?.vegetarian?.[selectedDay]}
                  mealType="vegetarian"
                  weekNumber={selectedWeek}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: WEEKLY GRID CALENDAR */}
      {viewMode === 'weekly' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {DAY_KEYS.map((d) => {
              const isToday = dateInfo.dayKey === d && dateInfo.weekNumber === selectedWeek;
              const regularItem = initialMenu[cycleKey]?.[selectedShift]?.regular?.[d];
              const vegItem = initialMenu[cycleKey]?.[selectedShift]?.vegetarian?.[d];

              return (
                <div
                  key={d}
                  className={`rounded-3xl border p-4 sm:p-5 transition-all space-y-4 ${
                    isToday
                      ? 'bg-white dark:bg-slate-900 border-orange-400 dark:border-orange-500 ring-2 ring-orange-400/20 shadow-lg'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                        {DAY_NAMES[d].short}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {DAY_NAMES[d].vi}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {SHIFT_NAMES[selectedShift].vi}
                        </span>
                      </div>
                    </div>
                    {isToday && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Hôm nay
                      </span>
                    )}
                  </div>

                  {/* Regular Dish Section */}
                  {(selectedMealType === 'both' || selectedMealType === 'regular') && (
                    <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <span>🍖 Món Mặn:</span>
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                        {getEffectiveDish(regularItem?.mainDish1, selectedWeek).name || '—'}
                      </p>
                      {regularItem?.mainDish2 && (
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          + {getEffectiveDish(regularItem.mainDish2, selectedWeek).name}
                        </p>
                      )}
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-amber-200/40 space-y-0.5">
                        <div><strong>Xào:</strong> {regularItem?.sideDish || '—'}</div>
                        <div><strong>Canh:</strong> {regularItem?.soup || '—'}</div>
                      </div>
                    </div>
                  )}

                  {/* Vegetarian Dish Section */}
                  {(selectedMealType === 'both' || selectedMealType === 'vegetarian') && (
                    <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <span>🥬 Món Chay:</span>
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                        {getEffectiveDish(vegItem?.mainDish1, selectedWeek).name || '—'}
                      </p>
                      {vegItem?.mainDish2 && (
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          + {getEffectiveDish(vegItem.mainDish2, selectedWeek).name}
                        </p>
                      )}
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-emerald-200/40 space-y-0.5">
                        <div><strong>Xào:</strong> {vegItem?.sideDish || '—'}</div>
                        <div><strong>Canh:</strong> {vegItem?.soup || '—'}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
