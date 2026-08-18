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


export async function resetMenuToDefaultAction() {
  try {
    await saveFullMenu(INITIAL_MENU_DATABASE);
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, message: 'Đã khôi phục thực đơn về bản gốc ban đầu!' };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Có lỗi xảy ra' };
  }
}
