'use server';

import { revalidatePath } from 'next/cache';
import { getFullMenu, updateMenuItem, saveFullMenu, seedDatabaseFromInitial } from '@/lib/db';
import { parseMenuExcel } from '@/lib/excel-parser';
import { CycleKey, ShiftKey, MealTypeKey, DayKey, MenuItem, FullMenuDatabase } from '@/types/menu';
import { INITIAL_MENU_DATABASE } from '@/data/initial-menu';


export async function getMenuAction(): Promise<FullMenuDatabase> {
  return await getFullMenu();
}


export async function updateDishAction(
  cycle: CycleKey,
  shift: ShiftKey,
  mealType: MealTypeKey,
  day: DayKey,
  item: MenuItem
) {
  try {
    const success = await updateMenuItem(cycle, shift, mealType, day, item);
    revalidatePath('/');
    revalidatePath('/admin');
    return { success, message: success ? 'Cập nhật món thành công!' : 'Có lỗi khi lưu vào Database' };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Lỗi không xác định' };
  }
}


export async function importExcelMenuAction(formData: FormData) {
  try {
    const file = formData.get('excelFile') as File | null;
    if (!file) {
      return { success: false, message: 'Chưa chọn file Excel nào!' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parsedData = parseMenuExcel(buffer);

    const success = await saveFullMenu(parsedData);
    revalidatePath('/');
    revalidatePath('/admin');

    return {
      success,
      message: success 
        ? 'Đã tải lên và cập nhật thực đơn thành công từ file Excel!' 
        : 'Có lỗi xảy ra khi lưu thực đơn vào Database',
      data: success ? parsedData : undefined,
    };
  } catch (error: any) {
    console.error('Lỗi khi import file Excel:', error);
    return { success: false, message: `Lỗi đọc file: ${error?.message || 'Định dạng file không hợp lệ'}`, data: undefined };
  }
}


function createEmptyMenu(): FullMenuDatabase {
  const emptyDay = { mainDish1: '', mainDish2: '', sideDish: '', soup: '', dessert: '' };
  const emptyMealType = {
    monday: { ...emptyDay },
    tuesday: { ...emptyDay },
    wednesday: { ...emptyDay },
    thursday: { ...emptyDay },
    friday: { ...emptyDay },
    saturday: { ...emptyDay },
    sunday: { ...emptyDay },
  };
  const emptyShift = {
    regular: JSON.parse(JSON.stringify(emptyMealType)),
    vegetarian: JSON.parse(JSON.stringify(emptyMealType)),
  };
  const emptyCycle = {
    morning: JSON.parse(JSON.stringify(emptyShift)),
    afternoon: JSON.parse(JSON.stringify(emptyShift)),
  };
  
  return {
    lastUpdated: new Date().toISOString(),
    cycle_1_3: JSON.parse(JSON.stringify(emptyCycle)),
    cycle_2_4: JSON.parse(JSON.stringify(emptyCycle)),
  };
}

export async function resetMenuToDefaultAction() {
  try {
    const emptyDb = createEmptyMenu();
    await saveFullMenu(emptyDb);
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, message: 'Đã làm trống toàn bộ thực đơn!' };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Có lỗi xảy ra' };
  }
}
