'use client';

import { useState, useMemo, useEffect } from 'react';
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

  const todayLabel = useMemo(() => {
    const now = new Date();
    const d = now.getDate();
    const m = now.getMonth() + 1;
    return `${d}/${m}`;
  }, []);

  const [selectedWeek, setSelectedWeek] = useState<WeekNumber>(dateInfo.weekNumber);
  const [selectedShift, setSelectedShift] = useState<ShiftKey>('morning');
  const [selectedMealType, setSelectedMealType] = useState<MealTypeKey | 'both'>('both');
  const [selectedDay, setSelectedDay] = useState<DayKey>(dateInfo.dayKey);
  const [viewMode, setViewMode] = useState<'today' | 'weekly'>('today');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const cycleKey = getCycleForWeek(selectedWeek);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    
    const normalizeStr = (str: string) => 
      str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() : '';

    const query = normalizeStr(searchQuery);
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
                normalizeStr(name).includes(query) ||
                normalizeStr(effective.name).includes(query)
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

  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      const first = searchResults[0];
      setSelectedWeek(first.week);
      setSelectedShift(first.shift);
      setSelectedDay(first.dayKey);
      setViewMode('today');
    }
  }, [searchResults]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          THỰC ĐƠN ĂN TRƯA VÀ ĂN CHIỀU
        </h1>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <span className="block text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              Chọn Tuần Trong Tháng
            </span>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {([1, 2, 3, 4] as WeekNumber[]).map((w) => {
                const isSelected = selectedWeek === w;
                const isCurrent = dateInfo.weekNumber === w;

                return (
                  <button
                    key={w}
                    onClick={() => setSelectedWeek(w)}
                    className={`relative flex-1 min-w-[100px] sm:min-w-[140px] pt-3.5 pb-8 px-4 rounded-2xl text-xs sm:text-sm text-center transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/25 scale-[1.02] font-extrabold'
                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <span>Tuần {w}</span>
                    </div>
                    {isCurrent && (
                      <span className={`absolute bottom-1.5 right-2 text-[13px] sm:text-[15px] font-extrabold tracking-wide ${isSelected ? 'text-white' : 'text-slate-500/80 dark:text-slate-400/80'}`}>
                        {todayLabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-6">
            <span className="block text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
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
                <span>Bảng cả tuần</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mr-2 hidden sm:inline">Ca:</span>
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setSelectedShift('morning')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedShift === 'morning'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>Ăn Trưa</span>
              </button>
              <button
                onClick={() => setSelectedShift('afternoon')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedShift === 'afternoon'
                    ? 'bg-gradient-to-r from-indigo-700 to-slate-800 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>Ăn Chiều</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mr-2 hidden sm:inline">Khẩu vị:</span>
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
                Mặn
              </button>
              <button
                onClick={() => setSelectedMealType('vegetarian')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedMealType === 'vegetarian'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                Chay
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="block text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2">
            Tìm kiếm món nhanh
          </span>
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {searchQuery && searchResults && (
          <div className="mt-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-900 dark:text-white space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
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
      </div>

      {viewMode === 'today' && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {DAY_KEYS.map((d) => {
              const isSelected = selectedDay === d;
              const isToday = dateInfo.dayKey === d;

              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`relative flex-1 min-w-[110px] sm:min-w-[150px] pt-4 pb-8 px-4 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-md shadow-emerald-500/25 scale-[1.02] font-extrabold'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 font-medium'
                  }`}
                >
                  <div className="text-sm sm:text-base flex items-center justify-center">
                    <span>{DAY_NAMES[d].vi}</span>
                  </div>
                  {isToday && (
                    <span className={`absolute bottom-1.5 right-2.5 text-[13px] sm:text-[15px] font-extrabold tracking-wide ${isSelected ? 'text-white' : 'text-slate-500/80 dark:text-slate-400/80'}`}>
                      {todayLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            {(selectedMealType === 'both' || selectedMealType === 'regular') && (
              <div className="flex flex-col h-full">
                <MealDishCard
                  item={initialMenu[cycleKey]?.[selectedShift]?.regular?.[selectedDay]}
                  mealType="regular"
                  weekNumber={selectedWeek}
                />
              </div>
            )}

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
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {DAY_NAMES[d].vi}
                        </h4>
                      </div>
                    </div>
                    {isToday && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                        Hôm nay
                      </span>
                    )}
                  </div>

                  {(selectedMealType === 'both' || selectedMealType === 'regular') && (
                    <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-black dark:text-white flex items-center gap-1.5">
                          <span>Món mặn:</span>
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                        {getEffectiveDish(regularItem?.mainDish1, selectedWeek).name || ''}
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize mt-1 min-h-[1.25rem]">
                        {regularItem?.mainDish2 ? getEffectiveDish(regularItem.mainDish2, selectedWeek).name : ''}
                      </p>
                      <div className="pt-2 mt-2 border-t border-amber-200/40 space-y-1">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize flex items-baseline gap-1">
                          <span className="text-base font-bold text-black dark:text-white">Xào:</span>
                          <span>{regularItem?.sideDish || ''}</span>
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize flex items-baseline gap-1">
                          <span className="text-base font-bold text-black dark:text-white">Canh:</span>
                          <span>{regularItem?.soup || ''}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedMealType === 'both' || selectedMealType === 'vegetarian') && (
                    <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-black dark:text-white flex items-center gap-1.5">
                          <span>Món chay:</span>
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                        {getEffectiveDish(vegItem?.mainDish1, selectedWeek).name || ''}
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize mt-1 min-h-[1.25rem]">
                        {vegItem?.mainDish2 ? getEffectiveDish(vegItem.mainDish2, selectedWeek).name : ''}
                      </p>
                      <div className="pt-2 mt-2 border-t border-emerald-200/40 space-y-1">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize flex items-baseline gap-1">
                          <span className="text-base font-bold text-black dark:text-white">Xào:</span>
                          <span>{vegItem?.sideDish || ''}</span>
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize flex items-baseline gap-1">
                          <span className="text-base font-bold text-black dark:text-white">Canh:</span>
                          <span>{vegItem?.soup || ''}</span>
                        </div>
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
