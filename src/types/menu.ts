export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
export type ShiftKey = 'morning' | 'afternoon';
export type MealTypeKey = 'regular' | 'vegetarian';
export type CycleKey = 'cycle_1_3' | 'cycle_2_4';
export type WeekNumber = 1 | 2 | 3 | 4;

export interface MenuItem {
  mainDish1: string;      // Có thể có dấu "/" như "Thịt ram/Chiên" hoặc "Trứng chiên/ốp la"
  mainDish2?: string;     // Món chính 2 hoặc món phụ
  sideDish?: string;      // Món xào / Rau luộc
  soup?: string;          // Canh
  dessert?: string;       // Tráng miệng
}

export type DayMenuMap = Record<DayKey, MenuItem>;

export interface ShiftMenu {
  regular: DayMenuMap;
  vegetarian: DayMenuMap;
}

export interface CycleMenu {
  morning: ShiftMenu;
  afternoon: ShiftMenu;
}

export interface FullMenuDatabase {
  cycle_1_3: CycleMenu;
  cycle_2_4: CycleMenu;
  lastUpdated?: string;
}

export const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export const DAY_NAMES: Record<DayKey, { vi: string; short: string; dayIndex: number }> = {
  monday: { vi: 'Thứ 2', short: 'T2', dayIndex: 1 },
  tuesday: { vi: 'Thứ 3', short: 'T3', dayIndex: 2 },
  wednesday: { vi: 'Thứ 4', short: 'T4', dayIndex: 3 },
  thursday: { vi: 'Thứ 5', short: 'T5', dayIndex: 4 },
  friday: { vi: 'Thứ 6', short: 'T6', dayIndex: 5 },
  saturday: { vi: 'Thứ 7', short: 'T7', dayIndex: 6 },
};

export const SHIFT_NAMES: Record<ShiftKey, { vi: string; time: string; icon: string }> = {
  morning: { vi: 'Ca Sáng (Trưa)', time: '11:00 - 13:00', icon: 'sun' },
  afternoon: { vi: 'Ca Chiều (Tối)', time: '16:30 - 18:30', icon: 'moon' },
};

export const MEAL_TYPE_NAMES: Record<MealTypeKey, { vi: string; desc: string; color: string }> = {
  regular: { vi: 'Món Mặn', desc: 'Thực đơn món mặn tiêu chuẩn', color: 'amber' },
  vegetarian: { vi: 'Món Chay', desc: 'Thực đơn món chay thanh đạm', color: 'emerald' },
};
