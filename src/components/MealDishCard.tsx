'use client';

import Link from 'next/link';
import { MenuItem, MealTypeKey, WeekNumber } from '@/types/menu';
import { getEffectiveDish } from '@/lib/menu-helpers';
import { Utensils, Leaf, Soup, Apple, Salad, CookingPot, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface MealDishCardProps {
  item: MenuItem | undefined;
  mealType: MealTypeKey;
  weekNumber: WeekNumber;
  dayNameVi?: string;
  shiftNameVi?: string;
}

export default function MealDishCard({
  item,
  mealType,
  weekNumber,
  dayNameVi,
  shiftNameVi,
}: MealDishCardProps) {
  const isVegetarian = mealType === 'vegetarian';

  if (!item || (!item.mainDish1 && !item.mainDish2 && !item.sideDish && !item.soup && !item.dessert)) {
    return (
      <div className={`h-full min-h-[380px] p-8 rounded-3xl border-2 border-dashed bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center gap-4 ${
        isVegetarian ? 'border-emerald-200 dark:border-emerald-900/60' : 'border-orange-200 dark:border-orange-900/60'
      }`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
          isVegetarian ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : 'bg-orange-50 dark:bg-orange-950/40 text-orange-600'
        }`}>
          <CookingPot className="w-8 h-8" />
        </div>
        <div>
          <h4 className="font-black text-slate-800 dark:text-slate-200 text-lg">
            {isVegetarian ? 'Chưa Có Thực Đơn Chay' : 'Chưa Có Thực Đơn Mặn'}
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Bếp ăn đang cập nhật danh sách món cho bữa này. Vui lòng quay lại sau!
          </p>
        </div>
      </div>
    );
  }

  const main1Parsed = getEffectiveDish(item.mainDish1, weekNumber);
  const main2Parsed = getEffectiveDish(item.mainDish2, weekNumber);

  return (
    <div className={`h-full flex flex-col justify-between overflow-hidden rounded-3xl border-2 bg-white dark:bg-slate-900 shadow-sm ${
      isVegetarian 
        ? 'border-emerald-600 dark:border-emerald-500' 
        : 'border-orange-600 dark:border-orange-500'
    }`}>
      {/* 1. Tray Header Ribbon */}
      <div className={`px-6 py-4 flex items-center justify-between text-white ${
        isVegetarian ? 'bg-emerald-700' : 'bg-orange-600'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
            {isVegetarian ? (
              <Leaf className="w-6 h-6 text-emerald-200" />
            ) : (
              <Utensils className="w-6 h-6 text-orange-200" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wide">
                {isVegetarian ? 'Khay Cơm Chay' : 'Khay Cơm Mặn'}
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-black/30 text-white uppercase tracking-wider">
                {isVegetarian ? 'Thanh Đạm' : 'Tiêu Chuẩn'}
              </span>
            </div>
            <p className="text-xs text-white/80 font-medium">
              {isVegetarian ? 'Đầy đủ dinh dưỡng từ rau củ & đậu nấm' : 'Cung cấp năng lượng làm việc trọn vẹn'}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-xl bg-black/30 text-white">
            Tuần {weekNumber}
          </span>
        </div>
      </div>

      {/* 2. Bento Compartments Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-5">
        {/* Main Dish Compartment (Khu vực món chính) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Món Chính
            </span>
            {main1Parsed.hasAlternating && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                {main1Parsed.alternatingDetails?.note}
              </span>
            )}
          </div>

          {/* Món Chính 1 - Khối to nổi bật */}
          <div className={`p-4 sm:p-5 rounded-2xl border-2 ${
            isVegetarian 
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800' 
              : 'bg-orange-50/70 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800'
          }`}>
            <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded text-white mb-2 ${
              isVegetarian ? 'bg-emerald-700' : 'bg-orange-600'
            }`}>
              Món Chính 1
            </span>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white capitalize leading-snug">
              {main1Parsed.name || '—'}
            </h4>
          </div>

          {/* Món Chính 2 / Món Phụ */}
          {item.mainDish2 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-700 text-white mb-1.5">
                Món Chính 2 / Phụ
              </span>
              <h5 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white capitalize">
                {main2Parsed.name || '—'}
              </h5>
            </div>
          )}
        </div>

        {/* 3. Sub Compartments (Khay 3 ngăn: Rau Xào, Canh Nóng, Tráng Miệng) */}
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
            Các Món Kèm
          </span>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {/* Rau Xào */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between min-h-[90px]">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Salad className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wide">Rau / Xào</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white capitalize leading-tight mt-2">
                {item.sideDish || '—'}
              </p>
            </div>

            {/* Món Canh */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between min-h-[90px]">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Soup className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wide">Món Canh</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white capitalize leading-tight mt-2">
                {item.soup || '—'}
              </p>
            </div>

            {/* Tráng Miệng */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between min-h-[90px]">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Apple className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wide">Tráng Miệng</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white capitalize leading-tight mt-2">
                {item.dessert || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Tray Footer Action */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-semibold">
            🍚 Kèm cơm trắng tự phục vụ
          </span>

          {isVegetarian ? (
            <Link
              href="/dk-chay"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all cursor-pointer"
            >
              <span>Đăng ký suất chay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Ăn tại quầy mặn
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

