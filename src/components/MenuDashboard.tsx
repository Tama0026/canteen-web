'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FullMenuDatabase,
  DayKey,
  ShiftKey,
  MealTypeKey,
  WeekNumber,
  DAY_KEYS,
  DAY_NAMES,
  SHIFT_NAMES
} from '@/types/menu';
import { getCycleForWeek, getCurrentDateInfo, getEffectiveDish } from '@/lib/menu-helpers';
import {
  Search,
  RotateCcw,
  Sun,
  Moon,
  Leaf,
  CalendarDays,
  LayoutGrid,
  Table as TableIcon,
  ArrowRight,
  Flame,
  Soup,
  Salad,
  Apple
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
  const [selectedDay, setSelectedDay] = useState<DayKey>(dateInfo.dayKey);
  const [viewFilter, setViewFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [displayMode, setDisplayMode] = useState<'focus' | 'table'>('focus');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const cycleKey = getCycleForWeek(selectedWeek);
  const cycleText = cycleKey === 'cycle_1_3' ? '1 - 3' : '2 - 4';

  const isSelectedDayToday = selectedDay === dateInfo.dayKey && selectedWeek === dateInfo.weekNumber;

  const handleJumpToToday = () => {
    setSelectedWeek(dateInfo.weekNumber);
    setSelectedDay(dateInfo.dayKey);
    setSearchQuery('');
  };

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

            checkDish(item.mainDish1, 'Món chính');
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

  // Render Meal Tray Card (Focus Mode) - Soft Pastel Styling
  const renderDishTrayCard = (
    shift: ShiftKey,
    mealType: MealTypeKey,
    title: string,
    isVeg: boolean
  ) => {
    const item = initialMenu[cycleKey]?.[shift]?.[mealType]?.[selectedDay];
    const eff1 = getEffectiveDish(item?.mainDish1, selectedWeek);
    const eff2 = getEffectiveDish(item?.mainDish2, selectedWeek);

    return (
      <div className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${isVeg
          ? 'bg-[#F4FBF7] dark:bg-emerald-950/20 border-emerald-200/90 dark:border-emerald-800/80 shadow-2xs'
          : 'bg-[#FEF9F0] dark:bg-amber-950/20 border-amber-200/90 dark:border-amber-800/80 shadow-2xs'
        }`}>
        {/* Tray Header */}
        <div className={`px-4 py-3 border-b flex items-center justify-between ${isVeg
            ? 'bg-[#E6F4EA] dark:bg-emerald-950/50 border-emerald-200/80 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
            : 'bg-[#FEF0D6] dark:bg-amber-950/50 border-amber-200/80 dark:border-amber-800 text-amber-950 dark:text-amber-200'
          }`}>
          <div className="flex items-center gap-2">
            {isVeg ? (
              <Leaf className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            ) : (
              <Flame className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            )}
            <span className="font-extrabold text-xs uppercase tracking-wider">
              {title}
            </span>
          </div>

          {isVeg && (
            isSelectedDayToday ? (
              <Link
                href="/dk-chay"
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 underline cursor-pointer"
              >
                Đăng ký ngay →
              </Link>
            ) : (
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Đăng ký trong ngày</span>
            )
          )}
        </div>

        {/* Compartment 1: MÓN CHÍNH TRỌNG TÂM */}
        <div className="p-4 space-y-3.5 flex-1">
          <div className={`p-4 rounded-xl border bg-white dark:bg-slate-900/90 ${isVeg
              ? 'border-emerald-200 dark:border-emerald-800/80 shadow-2xs'
              : 'border-amber-200 dark:border-amber-800/80 shadow-2xs'
            }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wider uppercase border ${isVeg
                  ? 'bg-[#CEEAD6] text-emerald-900 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700'
                  : 'bg-[#FDE293] text-amber-950 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700'
                }`}>
                MÓN CHÍNH
              </span>
            </div>

            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white capitalize tracking-tight leading-snug">
              {eff1.name || '—'}
            </div>

            {eff2.name && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Món 2
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {eff2.name}
                </span>
              </div>
            )}
          </div>

          {/* Compartment 2: 3 NGĂN PHỤ (XÀO / CANH / TRÁNG MIỆNG) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Ngăn Xào */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <Salad className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Món Xào
                </span>
              </div>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100 capitalize truncate" title={item?.sideDish}>
                {item?.sideDish || '—'}
              </p>
            </div>

            {/* Ngăn Canh */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <Soup className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Canh Nóng
                </span>
              </div>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100 capitalize truncate" title={item?.soup}>
                {item?.soup || '—'}
              </p>
            </div>

            {/* Ngăn Tráng Miệng */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <Apple className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tráng Miệng
                </span>
              </div>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100 capitalize truncate" title={item?.dessert}>
                {item?.dessert || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Optional Action Footer for Vegetarian */}
        {isVeg && isSelectedDayToday && (
          <div className="p-3 bg-[#E6F4EA]/70 dark:bg-emerald-950/40 border-t border-emerald-200/80 dark:border-emerald-800">
            <Link
              href="/dk-chay"
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Đăng Ký Ăn Suất Chay Này</span>
            </Link>
          </div>
        )}
      </div>
    );
  };

  // Render a Single Matrix Table Block (For Table View Mode)
  const renderTableBlock = (
    shift: ShiftKey,
    mealType: MealTypeKey,
    shiftLabel: string,
    mealTypeLabel: string
  ) => {
    const hasAnyMainDish2 = DAY_KEYS.some(d => {
      const item = initialMenu[cycleKey]?.[shift]?.[mealType]?.[d];
      return Boolean(item?.mainDish2 && item.mainDish2.trim());
    });

    const totalRows = (hasAnyMainDish2 ? 2 : 1) + 3 + (mealType === 'vegetarian' ? 1 : 0);

    return (
      <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse min-w-[850px] table-fixed">
            <thead>
              <tr className="bg-[#FFF8E7] dark:bg-amber-950/30 text-slate-800 dark:text-amber-200 font-bold border-b border-slate-300 dark:border-slate-700">
                <th className="py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 w-[8%]">CA</th>
                <th className="py-2.5 px-1 border-r border-slate-300 dark:border-slate-700 w-[6%]">TUẦN</th>
                <th className="py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 w-[11%] uppercase">
                  {mealTypeLabel}
                </th>
                {DAY_KEYS.map((d) => (
                  <th key={d} className="py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 font-bold w-[12.5%]">
                    {DAY_NAMES[d].vi}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td rowSpan={totalRows} className="py-3 px-1 font-bold uppercase border-r border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 align-middle text-center">
                  <div className="flex flex-col items-center justify-center gap-1">
                    {shift === 'morning' ? <Sun className="w-4 h-4 text-amber-600" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                    <span className="leading-tight">{shiftLabel}</span>
                  </div>
                </td>
                <td rowSpan={totalRows} className="py-3 px-1 font-semibold border-r border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 align-middle text-center">
                  {cycleText}
                </td>
                <td rowSpan={hasAnyMainDish2 ? 2 : 1} className="py-2.5 px-2 font-semibold border-r border-slate-300 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 align-middle">
                  Món chính
                </td>
                {DAY_KEYS.map((d) => {
                  const item = initialMenu[cycleKey]?.[shift]?.[mealType]?.[d];
                  const eff = getEffectiveDish(item?.mainDish1, selectedWeek);
                  const hasDish2 = Boolean(item?.mainDish2 && item.mainDish2.trim());
                  return (
                    <td key={d} rowSpan={hasAnyMainDish2 && !hasDish2 ? 2 : 1} className="py-2 px-2 border-r last:border-r-0 border-slate-200 dark:border-slate-700 font-bold capitalize align-middle break-words">
                      {eff.name || '—'}
                    </td>
                  );
                })}
              </tr>
              {hasAnyMainDish2 && (
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  {DAY_KEYS.map((d) => {
                    const item = initialMenu[cycleKey]?.[shift]?.[mealType]?.[d];
                    const hasDish2 = Boolean(item?.mainDish2 && item.mainDish2.trim());
                    if (!hasDish2) return null;
                    const eff2 = getEffectiveDish(item?.mainDish2, selectedWeek);
                    return (
                      <td key={d} className="py-1.5 px-2 border-r last:border-r-0 border-slate-200 dark:border-slate-700 font-bold capitalize text-slate-800 dark:text-slate-200 align-middle break-words">
                        {eff2.name}
                      </td>
                    );
                  })}
                </tr>
              )}
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="py-2 px-2 font-semibold border-r border-slate-300 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 align-middle">Xào</td>
                {DAY_KEYS.map((d) => <td key={d} className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 capitalize align-middle">{initialMenu[cycleKey]?.[shift]?.[mealType]?.[d]?.sideDish || '—'}</td>)}
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="py-2 px-2 font-semibold border-r border-slate-300 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 align-middle">Canh</td>
                {DAY_KEYS.map((d) => <td key={d} className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 capitalize align-middle">{initialMenu[cycleKey]?.[shift]?.[mealType]?.[d]?.soup || '—'}</td>)}
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="py-2 px-2 font-semibold border-r border-slate-300 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 align-middle">Tráng miệng</td>
                {DAY_KEYS.map((d) => <td key={d} className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 capitalize align-middle">{initialMenu[cycleKey]?.[shift]?.[mealType]?.[d]?.dessert || '—'}</td>)}
              </tr>
              {mealType === 'vegetarian' && (
                <tr className="bg-emerald-50/40 dark:bg-emerald-950/20 border-t border-slate-200 dark:border-slate-700">
                  <td className="py-2 px-2 font-bold text-emerald-800 dark:text-emerald-300 border-r border-slate-300 dark:border-slate-700 align-middle">Đăng Ký</td>
                  {DAY_KEYS.map((d) => (
                    <td key={d} className="py-1.5 px-2 border-r last:border-r-0 border-slate-200 dark:border-slate-700 align-middle">
                      <Link href="/dk-chay" className="inline-flex items-center justify-center w-full px-2 py-1 rounded-md bg-emerald-700 text-white text-[10px] font-bold">ĐK</Link>
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Control Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3.5 shadow-sm">
        {/* Top Line */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-amber-600" />
              THỰC ĐƠN TUẦN {selectedWeek} (CHU KỲ {cycleText})
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Hôm nay: {dateInfo.formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setDisplayMode('focus')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${displayMode === 'focus'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
                <span>Hôm Nay</span>
              </button>
              <button
                onClick={() => setDisplayMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${displayMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <TableIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Bảng Tuần</span>
              </button>
            </div>

            <button
              onClick={handleJumpToToday}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Về Hôm Nay</span>
            </button>
          </div>
        </div>

        {/* Row 2: Selectors & Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Week Selector */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {([1, 2, 3, 4] as WeekNumber[]).map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWeek(w)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedWeek === w
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  Tuần {w}
                </button>
              ))}
            </div>

            {/* Shift Filter: CA SÁNG / CA CHIỀU */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                Tất Cả
              </button>
              <button
                onClick={() => setViewFilter('morning')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewFilter === 'morning'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                Ca Sáng
              </button>
              <button
                onClick={() => setViewFilter('afternoon')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewFilter === 'afternoon'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                Ca Chiều
              </button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-slate-400 placeholder:text-slate-400 font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Search Results Drawer */}
      {searchQuery && searchResults && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Kết quả "{searchQuery}" ({searchResults.length})
            </span>
            <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              Đóng
            </button>
          </div>
          {searchResults.length === 0 ? (
            <p className="text-xs text-slate-500">Không tìm thấy món ăn phù hợp.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {searchResults.slice(0, 6).map((res, i) => (
                <div
                  key={i}
                  onClick={() => { setSelectedWeek(res.week); setSelectedDay(res.dayKey); setSearchQuery(''); }}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-slate-400 text-xs space-y-1"
                >
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{DAY_NAMES[res.dayKey].vi} • Tuần {res.week}</div>
                  <div className="font-bold truncate text-slate-900 dark:text-white">{res.dishName}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 1: MODERN DAY FOCUS HERO VIEW */}
      {displayMode === 'focus' && (
        <div className="space-y-6">
          {/* Interactive Weekday Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {DAY_KEYS.map((d) => {
              const isSelected = selectedDay === d;
              const isToday = dateInfo.dayKey === d && dateInfo.weekNumber === selectedWeek;
              const effMorning = getEffectiveDish(initialMenu[cycleKey]?.['morning']?.['regular']?.[d]?.mainDish1, selectedWeek);

              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden ${isSelected
                      ? 'bg-[#FFF8E7] dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 shadow-2xs ring-1 ring-amber-400/20'
                      : isToday
                        ? 'bg-[#FEF9F0] dark:bg-amber-950/10 border-amber-300 dark:border-amber-800/80 hover:border-amber-400'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-black text-sm leading-none ${isSelected ? 'text-amber-950 dark:text-amber-200' : 'text-slate-900 dark:text-white'
                      }`}>
                      {DAY_NAMES[d].vi}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider bg-[#FDE293] text-amber-950 border border-amber-300 dark:bg-amber-900/80 dark:text-amber-200 dark:border-amber-700">
                        Hôm nay
                      </span>
                    )}
                  </div>

                  <div className={`text-[11px] truncate capitalize font-semibold ${isSelected
                      ? 'text-amber-900 dark:text-amber-300'
                      : 'text-slate-500 dark:text-slate-400'
                    }`}>
                    {effMorning.name || 'Thực đơn'}
                  </div>

                  <div className={`text-[10px] font-bold pt-1 border-t flex items-center justify-between ${isSelected
                      ? 'border-amber-200/80 dark:border-amber-900/60 text-amber-700 dark:text-amber-400'
                      : 'border-slate-100 dark:border-slate-800 text-slate-400'
                    }`}>
                    <span>Chi tiết</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Day Main Canvas */}
          <div className="space-y-6">
            {/* Day Header Banner */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#FEF0D6] dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-black text-base shadow-2xs">
                  {DAY_NAMES[selectedDay].vi.replace('Thứ ', 'T')}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <span>{DAY_NAMES[selectedDay].vi}</span>
                    {isSelectedDayToday && (
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-[#FEF0D6] text-amber-950 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800">
                        Hôm nay ({dateInfo.formattedDate})
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Thực đơn phục vụ • Tuần {selectedWeek} (Chu kỳ {cycleText})
                  </p>
                </div>
              </div>

              {isSelectedDayToday && (
                <Link
                  href="/dk-chay"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Leaf className="w-4 h-4" />
                  <span>Đăng Ký Suất Ăn Chay Hôm Nay</span>
                </Link>
              )}
            </div>

            {/* CA SÁNG SECTION */}
            {(viewFilter === 'all' || viewFilter === 'morning') && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div className="p-1 rounded-lg bg-[#FEF0D6] text-amber-900 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                    CA SÁNG
                  </span>
                  <span className="text-xs text-slate-400 font-medium">— Bữa ăn chính</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {renderDishTrayCard('morning', 'regular', 'Món Mặn Ca Sáng', false)}
                  {renderDishTrayCard('morning', 'vegetarian', 'Món Chay Ca Sáng', true)}
                </div>
              </div>
            )}

            {/* CA CHIỀU SECTION */}
            {(viewFilter === 'all' || viewFilter === 'afternoon') && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 px-1">
                  <div className="p-1 rounded-lg bg-[#EEF2FF] text-indigo-900 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                    <Moon className="w-4 h-4" />
                  </div>
                  <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                    CA CHIỀU
                  </span>
                  <span className="text-xs text-slate-400 font-medium">— Bữa ăn chiều</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {renderDishTrayCard('afternoon', 'regular', 'Món Mặn Ca Chiều', false)}
                  {renderDishTrayCard('afternoon', 'vegetarian', 'Món Chay Ca Chiều', true)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: EXCEL-STYLE WEEKLY MATRIX TABLE VIEW */}
      {displayMode === 'table' && (
        <div className="space-y-6">
          {(viewFilter === 'all' || viewFilter === 'morning') && (
            <div className="space-y-4">
              <span className="text-xs font-black uppercase bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-900 inline-block">
                CA SÁNG
              </span>
              {renderTableBlock('morning', 'regular', 'CA SÁNG', 'MÓN MẶN')}
              {renderTableBlock('morning', 'vegetarian', 'CA SÁNG', 'MÓN CHAY')}
            </div>
          )}
          {(viewFilter === 'all' || viewFilter === 'afternoon') && (
            <div className="space-y-4">
              <span className="text-xs font-black uppercase bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-900 inline-block">
                CA CHIỀU
              </span>
              {renderTableBlock('afternoon', 'regular', 'CA CHIỀU', 'MÓN MẶN')}
              {renderTableBlock('afternoon', 'vegetarian', 'CA CHIỀU', 'MÓN CHAY')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
