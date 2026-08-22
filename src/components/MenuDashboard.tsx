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
  CalendarDays,
  LayoutGrid,
  Table as TableIcon
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
  const [searchQuery, setSearchQuery] = useState<string>('');

  const cycleKey = getCycleForWeek(selectedWeek);
  const cycleText = cycleKey === 'cycle_1_3' ? '1 - 3' : '2 - 4';

  const isSelectedDayToday = selectedDay === dateInfo.dayKey && selectedWeek === dateInfo.weekNumber;

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
              <tr className={`${shift === 'morning' ? 'bg-[#FFF8E7] dark:bg-amber-950/30 text-slate-800 dark:text-amber-200' : 'bg-[#EEF2FF] dark:bg-indigo-950/30 text-[#3730A3] dark:text-indigo-200'} font-bold border-b border-slate-300 dark:border-slate-700`}>
                <th className="py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 w-[8%]">CA</th>
                <th className="py-2.5 px-1 border-r border-slate-300 dark:border-slate-700 w-[6%]">TUẦN</th>
                <th className="py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 w-[11%] uppercase">
                  {mealTypeLabel}
                </th>
                {DAY_KEYS.map((d) => {
                  const isToday = d === dateInfo.dayKey && selectedWeek === dateInfo.weekNumber;
                  return (
                    <th
                      key={d}
                      className={`py-2 px-2 border-r border-slate-300 dark:border-slate-700 font-bold w-[12.5%] transition-colors ${
                        isToday
                          ? shift === 'morning'
                            ? 'bg-[#FDE293] text-amber-950 dark:bg-amber-900/80 dark:text-amber-100 font-black'
                            : 'bg-[#C7D2FE] text-indigo-950 dark:bg-indigo-900/80 dark:text-indigo-100 font-black'
                          : ''
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span>{DAY_NAMES[d].vi}</span>
                        {isToday && (
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider ${shift === 'morning' ? 'text-amber-800 dark:text-amber-200' : 'text-[#3730A3] dark:text-indigo-200'}`}>
                            (Hôm nay)
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td rowSpan={totalRows} className="py-3 px-1 font-bold uppercase border-r border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 align-middle text-center">
                  <span className="leading-tight">{shiftLabel}</span>
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
                  const hasDish1 = Boolean(eff.name && eff.name.trim());
                  const hasDish2 = Boolean(item?.mainDish2 && item.mainDish2.trim());
                  const isToday = d === dateInfo.dayKey && selectedWeek === dateInfo.weekNumber;
                  
                  const shouldMerge = hasAnyMainDish2 && hasDish1 && !hasDish2;

                  return (
                    <td
                      key={d}
                      rowSpan={shouldMerge ? 2 : 1}
                      className={`py-2 px-2 border-r border-slate-300 dark:border-slate-700 font-bold capitalize align-middle break-words ${
                        isToday ? (shift === 'morning' ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-indigo-50 dark:bg-indigo-950/20') : ''
                      }`}
                    >
                      {eff.name || ''}
                    </td>
                  );
                })}
              </tr>
              {hasAnyMainDish2 && (
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  {DAY_KEYS.map((d) => {
                    const item = initialMenu[cycleKey]?.[shift]?.[mealType]?.[d];
                    const eff1 = getEffectiveDish(item?.mainDish1, selectedWeek);
                    const hasDish1 = Boolean(eff1.name && eff1.name.trim());
                    const hasDish2 = Boolean(item?.mainDish2 && item.mainDish2.trim());
                    
                    const shouldMerge = hasAnyMainDish2 && hasDish1 && !hasDish2;
                    if (shouldMerge) return null;

                    const eff2 = getEffectiveDish(item?.mainDish2, selectedWeek);
                    const isToday = d === dateInfo.dayKey && selectedWeek === dateInfo.weekNumber;
                    return (
                      <td
                        key={d}
                        className={`py-1.5 px-2 border-r border-slate-300 dark:border-slate-700 font-bold capitalize text-slate-800 dark:text-slate-200 align-middle break-words ${
                          isToday ? (shift === 'morning' ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-indigo-50 dark:bg-indigo-950/20') : ''
                        }`}
                      >
                        {eff2.name || ''}
                      </td>
                    );
                  })}
                </tr>
              )}
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="py-2 px-2 font-semibold border-r border-slate-300 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 align-middle">Xào</td>
                {DAY_KEYS.map((d) => {
                  const isToday = d === dateInfo.dayKey && selectedWeek === dateInfo.weekNumber;
                  return (
                    <td
                      key={d}
                      className={`py-2 px-2 border-r border-slate-300 dark:border-slate-700 capitalize align-middle ${
                        isToday ? (shift === 'morning' ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-indigo-50 dark:bg-indigo-950/20') : ''
                      }`}
                    >
                      {initialMenu[cycleKey]?.[shift]?.[mealType]?.[d]?.sideDish || ''}
                    </td>
                  );
                })}
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="py-2 px-2 font-semibold border-r border-slate-300 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 align-middle">Canh</td>
                {DAY_KEYS.map((d) => {
                  const isToday = d === dateInfo.dayKey && selectedWeek === dateInfo.weekNumber;
                  return (
                    <td
                      key={d}
                      className={`py-2 px-2 border-r border-slate-300 dark:border-slate-700 capitalize align-middle ${
                        isToday ? (shift === 'morning' ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-indigo-50 dark:bg-indigo-950/20') : ''
                      }`}
                    >
                      {initialMenu[cycleKey]?.[shift]?.[mealType]?.[d]?.soup || ''}
                    </td>
                  );
                })}
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="py-2 px-2 font-semibold border-r border-slate-300 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 align-middle">Tráng miệng</td>
                {DAY_KEYS.map((d) => {
                  const isToday = d === dateInfo.dayKey && selectedWeek === dateInfo.weekNumber;
                  return (
                    <td
                      key={d}
                      className={`py-2 px-2 border-r border-slate-300 dark:border-slate-700 capitalize align-middle ${
                        isToday ? (shift === 'morning' ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-indigo-50 dark:bg-indigo-950/20') : ''
                      }`}
                    >
                      {initialMenu[cycleKey]?.[shift]?.[mealType]?.[d]?.dessert || ''}
                    </td>
                  );
                })}
              </tr>
              {mealType === 'vegetarian' && selectedWeek === dateInfo.weekNumber && (
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-2 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-300 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 align-middle">
                    Đăng Ký
                  </td>
                  {DAY_KEYS.map((d) => {
                    const isToday = d === dateInfo.dayKey && selectedWeek === dateInfo.weekNumber;
                    return (
                      <td
                        key={d}
                        className={`py-1.5 px-2 border-r border-slate-300 dark:border-slate-700 align-middle text-center ${
                          isToday ? (shift === 'morning' ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-indigo-50 dark:bg-indigo-950/20') : ''
                        }`}
                      >
                        {isToday && (
                          <Link
                            href="/dk-chay"
                            className="inline-flex items-center justify-center w-[85%] py-1.5 px-3 rounded-md bg-[#007A5A] hover:bg-[#006046] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                          >
                            ĐK
                          </Link>
                        )}
                      </td>
                    );
                  })}
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

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3.5 shadow-sm">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-amber-600" />
              THỰC ĐƠN TUẦN {selectedWeek} (CHU KỲ {cycleText})
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Hôm nay: {dateInfo.formattedDate}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">

            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {([1, 2, 3, 4] as WeekNumber[]).map((w) => {
                const isCurrentWeek = w === dateInfo.weekNumber;
                return (
                <button
                  key={w}
                  onClick={() => setSelectedWeek(w)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedWeek === w
                      ? isCurrentWeek
                        ? 'bg-sky-100 dark:bg-sky-900/50 text-slate-900 dark:text-sky-100 shadow-xs ring-1 ring-sky-300 dark:ring-sky-700'
                        : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : isCurrentWeek
                        ? 'bg-sky-50 dark:bg-sky-900/20 text-slate-900 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  Tuần {w} {isCurrentWeek && '(HT)'}
                </button>
              )})}
            </div>

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
                    ? 'bg-[#FFF8E7] dark:bg-amber-900/50 text-amber-900 dark:text-amber-100 shadow-xs ring-1 ring-[#FDE293] dark:ring-amber-700'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                Ca Sáng
              </button>
              <button
                onClick={() => setViewFilter('afternoon')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewFilter === 'afternoon'
                    ? 'bg-[#EEF2FF] dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100 shadow-xs ring-1 ring-[#C7D2FE] dark:ring-indigo-700'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                Ca Chiều
              </button>
            </div>
          </div>

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

        <div className="space-y-8">
          {(viewFilter === 'all' || viewFilter === 'morning') && (
            <div className="space-y-3.5">
              <div>
                <span className="text-xs font-bold uppercase bg-[#FEF0D6] text-[#7C3A00] dark:bg-amber-950/60 dark:text-amber-200 px-3 py-1 rounded-md border border-[#FDE293] dark:border-amber-900 inline-block shadow-2xs">
                  CA SÁNG
                </span>
              </div>
              {renderTableBlock('morning', 'regular', 'CA SÁNG', 'MÓN MẶN')}
              {renderTableBlock('morning', 'vegetarian', 'CA SÁNG', 'MÓN CHAY')}
            </div>
          )}
          {(viewFilter === 'all' || viewFilter === 'afternoon') && (
            <div className="space-y-3.5">
              <div>
                <span className="text-xs font-bold uppercase bg-[#EEF2FF] text-[#3730A3] dark:bg-indigo-950/60 dark:text-indigo-200 px-3 py-1 rounded-md border border-[#C7D2FE] dark:border-indigo-900 inline-block shadow-2xs">
                  CA CHIỀU
                </span>
              </div>
              {renderTableBlock('afternoon', 'regular', 'CA CHIỀU', 'MÓN MẶN')}
              {renderTableBlock('afternoon', 'vegetarian', 'CA CHIỀU', 'MÓN CHAY')}
            </div>
          )}
        </div>
    </div>
  );
}
