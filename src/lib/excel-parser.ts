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

  function parseSheet(sheetName: string, cycleKey: 'cycle_1_3' | 'cycle_2_4'): boolean {
    const ws = workbook.Sheets[sheetName];
    if (!ws) return false;

    const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    let currentShift: 'morning' | 'afternoon' | null = null;
    let currentMealType: 'regular' | 'vegetarian' | null = null;
    let dataRowIndex = -1; // -1 means we are not currently reading dish rows
    let hasValidData = false;

    for (let r = 0; r < data.length; r++) {
      const row = data[r] || [];

      const colA = String(row[0] || '').trim().toUpperCase();
      const colB = String(row[1] || '').trim().toUpperCase();
      const colC = String(row[2] || '').trim().toUpperCase();
      const headerStr = `${colA} ${colB} ${colC}`;

      // Detect Header Row (THỨ 2)
      const isHeaderRow = String(row[3] || '').trim().toUpperCase().includes('THỨ 2');

      // Update Meal Type
      if (headerStr.includes('MẶN')) {
        currentMealType = 'regular';
      } else if (headerStr.includes('CHAY')) {
        currentMealType = 'vegetarian';
      }

      // Update Shift and start counting
      let isBlockStart = false;
      if (headerStr.includes('SÁNG')) {
        currentShift = 'morning';
        isBlockStart = true;
      } else if (headerStr.includes('CHIỀU')) {
        currentShift = 'afternoon';
        isBlockStart = true;
      }

      if (isHeaderRow) {
        dataRowIndex = -1; // Wait for the shift marker
        continue;
      }

      if (isBlockStart) {
        dataRowIndex = 0; // This row itself is the first dish row (mainDish1)
      } else if (dataRowIndex >= 0) {
        dataRowIndex++; // Increment for subsequent rows
      }

      if (currentShift && currentMealType && dataRowIndex >= 0 && dataRowIndex <= 4) {
        let dishType: 'mainDish1' | 'mainDish2' | 'sideDish' | 'soup' | 'dessert' | null = null;
        if (dataRowIndex === 0) dishType = 'mainDish1';
        else if (dataRowIndex === 1) dishType = 'mainDish2';
        else if (dataRowIndex === 2) dishType = 'sideDish';
        else if (dataRowIndex === 3) dishType = 'soup';
        else if (dataRowIndex === 4) dishType = 'dessert';

        if (dishType) {
          DAY_COLS.forEach((dayKey, idx) => {
            const colIdx = idx + 3; // Col D is index 3
            const cellVal = String(row[colIdx] || '').trim();
            // Allow empty string to overwrite if it's an update
            result[cycleKey][currentShift!][currentMealType!][dayKey][dishType!] = cellVal;
            if (cellVal) hasValidData = true;
          });
        }
      }
    }
    return hasValidData;
  }

  let parsedSheets = 0;
  workbook.SheetNames.forEach(name => {
    const norm = name.toUpperCase().replace(/\s+/g, '');
    if (norm.includes('1-3')) {
      if (parseSheet(name, 'cycle_1_3')) parsedSheets++;
    } else if (norm.includes('2-4')) {
      if (parseSheet(name, 'cycle_2_4')) parsedSheets++;
    }
  });

  if (parsedSheets === 0) {
    throw new Error('Không thể đọc dữ liệu. Đảm bảo file có sheet "TUẦN 1 - 3" hoặc "TUẦN 2 - 4" và đúng định dạng.');
  }

  return result;
}
