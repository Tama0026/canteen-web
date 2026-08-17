import * as XLSX from 'xlsx';
import { FullMenuDatabase, DayKey, DAY_KEYS } from '@/types/menu';
import { INITIAL_MENU_DATABASE } from '@/data/initial-menu';

const DAY_COLS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Phân tích nội dung Buffer / ArrayBuffer của file Excel Menu ăn trưa
 */
export function parseMenuExcel(buffer: ArrayBuffer | Buffer): FullMenuDatabase {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const result: FullMenuDatabase = JSON.parse(JSON.stringify(INITIAL_MENU_DATABASE));
  result.lastUpdated = new Date().toISOString();

  function parseSheet(sheetName: string, cycleKey: 'cycle_1_3' | 'cycle_2_4') {
    const ws = workbook.Sheets[sheetName];
    if (!ws) return;

    // Chuyển sheet sang dạng mảng 2 chiều (rows x cols)
    const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    // Cấu hình các hàng:
    // Ca Sáng - Mặn: hàng 2 (chính 1), 3 (chính 2), 4 (xào), 5 (canh), 6 (tráng miệng) -> index 1, 2, 3, 4, 5
    // Ca Sáng - Chay: hàng 11 (chính 1), 12 (chính 2), 13 (xào), 14 (canh), 15 (tráng miệng) -> index 10, 11, 12, 13, 14
    // Ca Chiều - Mặn: hàng 20 (chính 1), 21 (chính 2), 22 (xào), 23 (canh), 24 (tráng miệng) -> index 19, 20, 21, 22, 23
    // Ca Chiều - Chay: hàng 29 (chính 1), 30 (chính 2), 31 (xào), 32 (canh), 33 (tráng miệng) -> index 28, 29, 30, 31, 32

    const sections = [
      { shift: 'morning', mealType: 'regular', r1: 1, r2: 2, rSide: 3, rSoup: 4, rDes: 5 },
      { shift: 'morning', mealType: 'vegetarian', r1: 10, r2: 11, rSide: 12, rSoup: 13, rDes: 14 },
      { shift: 'afternoon', mealType: 'regular', r1: 19, r2: 20, rSide: 21, rSoup: 22, rDes: 23 },
      { shift: 'afternoon', mealType: 'vegetarian', r1: 28, r2: 29, rSide: 30, rSoup: 31, rDes: 32 },
    ] as const;

    for (const sec of sections) {
      DAY_COLS.forEach((dayKey, idx) => {
        const colIdx = idx + 3; // Cột D (index 3) là Thứ 2, E (4) là Thứ 3,...
        
        const m1 = data[sec.r1]?.[colIdx] ?? '';
        const m2 = data[sec.r2]?.[colIdx] ?? '';
        const side = data[sec.rSide]?.[colIdx] ?? '';
        const soup = data[sec.rSoup]?.[colIdx] ?? '';
        const des = data[sec.rDes]?.[colIdx] ?? '';

        result[cycleKey][sec.shift][sec.mealType][dayKey] = {
          mainDish1: String(m1).trim(),
          mainDish2: String(m2).trim(),
          sideDish: String(side).trim(),
          soup: String(soup).trim(),
          dessert: String(des).trim(),
        };
      });
    }
  }

  if (workbook.SheetNames.includes('TUẦN 1 - 3')) {
    parseSheet('TUẦN 1 - 3', 'cycle_1_3');
  }
  if (workbook.SheetNames.includes('TUẦN 2 - 4')) {
    parseSheet('TUẦN 2 - 4', 'cycle_2_4');
  }

  return result;
}
