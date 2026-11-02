import { DayKey, CycleKey, WeekNumber, DAY_KEYS } from '@/types/menu';

export function getEffectiveDish(dishStr: string | undefined, weekNumber: WeekNumber): {
  name: string;
  hasAlternating: boolean;
  raw: string;
  alternatingDetails?: { weekA: string; weekB: string; note: string };
} {
  if (!dishStr || !dishStr.trim()) {
    return { name: '', hasAlternating: false, raw: '' };
  }

  const raw = dishStr.trim();
  if (!raw.includes('/')) {
    return { name: raw, hasAlternating: false, raw };
  }

  const parts = raw.split('/').map(p => p.trim());
  if (parts.length < 2) {
    return { name: raw, hasAlternating: false, raw };
  }

  const part1 = parts[0];
  const part2 = parts[1];

  let selectedName = raw;
  let note = '';

  if (weekNumber === 1) {
    selectedName = part1;
    note = `Tuần 1: ${part1} | Tuần 3: ${part2}`;
  } else if (weekNumber === 3) {
    selectedName = part2.toLowerCase().startsWith('thịt') || part2.toLowerCase().startsWith('trứng') || part2.toLowerCase().startsWith('cá') || part2.toLowerCase().startsWith('gà')
      ? part2
      : `${part1.split(' ')[0]} ${part2}`;
    note = `Tuần 1: ${part1} | Tuần 3: ${selectedName}`;
  } else if (weekNumber === 2) {
    selectedName = part1;
    note = `Tuần 2: ${part1} | Tuần 4: ${part2}`;
  } else if (weekNumber === 4) {
    selectedName = part2.toLowerCase().startsWith('trứng') || part2.toLowerCase().startsWith('thịt')
      ? part2
      : `${part1.split(' ')[0]} ${part2}`;
    note = `Tuần 2: ${part1} | Tuần 4: ${selectedName}`;
  }

  return {
    name: selectedName,
    hasAlternating: true,
    raw,
    alternatingDetails: {
      weekA: part1,
      weekB: part2,
      note,
    },
  };
}

export function getCycleForWeek(weekNum: WeekNumber): CycleKey {
  return weekNum === 1 || weekNum === 3 ? 'cycle_1_3' : 'cycle_2_4';
}

export function getCurrentDateInfo(): {
  dayKey: DayKey;
  dayIndex: number;
  dayNameVi: string;
  weekNumber: WeekNumber;
  cycleKey: CycleKey;
  formattedDate: string;
} {
  const now = new Date();
  const dayIndex = now.getDay();

  let dayKey: DayKey = 'monday';
  if (dayIndex === 2) dayKey = 'tuesday';
  else if (dayIndex === 3) dayKey = 'wednesday';
  else if (dayIndex === 4) dayKey = 'thursday';
  else if (dayIndex === 5) dayKey = 'friday';
  else if (dayIndex === 6) dayKey = 'saturday';
  else dayKey = 'monday';

  const dayNamesMap: Record<number, string> = {
    0: 'Chủ Nhật',
    1: 'Thứ Hai',
    2: 'Thứ Ba',
    3: 'Thứ Tư',
    4: 'Thứ Năm',
    5: 'Thứ Sáu',
    6: 'Thứ Bảy',
  };

  const referenceDate = new Date(2026, 7, 3);
  referenceDate.setHours(0, 0, 0, 0);

  const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
  const currentMonday = new Date(now);
  currentMonday.setDate(now.getDate() - (currentDayOfWeek - 1));
  currentMonday.setHours(0, 0, 0, 0);

  const diffTime = currentMonday.getTime() - referenceDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const calculatedWeek = ((diffWeeks % 4) + 4) % 4 + 1;
  const weekNumber: WeekNumber = calculatedWeek as WeekNumber;

  const cycleKey = getCycleForWeek(weekNumber);

  const dateOfMonth = now.getDate();
  const formattedDate = `Ngày ${dateOfMonth} tháng ${now.getMonth() + 1}, ${now.getFullYear()}`;

  return {
    dayKey,
    dayIndex,
    dayNameVi: dayNamesMap[dayIndex] || 'Thứ Hai',
    weekNumber,
    cycleKey,
    formattedDate,
  };
}

export function getDkChaySessionDate(): { dateKey: string; displayDate: string } {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateKey = `${yyyy}-${mm}-${dd}`;

  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = dayNames[now.getDay()];
  const displayDate = `${dayName}, Ngày ${now.getDate()} tháng ${now.getMonth() + 1}, ${now.getFullYear()}`;

  return { dateKey, displayDate };
}
