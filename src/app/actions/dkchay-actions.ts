'use server';

import { revalidatePath } from 'next/cache';
import { 
  getDkChayRegistrations, 
  saveDkChayRegistrations,
  upsertSingleRegistration,
  deleteRegistrationsByIds
} from '@/lib/db';

function getTodayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function getDkChayAction() {
  const today = getTodayKey();
  return await getDkChayRegistrations(today);
}

export async function upsertDkChayAction(reg: { id: string; name: string; isLunch: boolean; isDinner: boolean }) {
  try {
    const today = getTodayKey();
    const success = await upsertSingleRegistration(reg, today);
    revalidatePath('/dk-chay');
    return { success, message: success ? 'Đã lưu đăng ký' : 'Lỗi khi lưu' };
  } catch (error) {
    console.error('Lỗi upsertDkChayAction:', error);
    return { success: false, message: 'Lỗi khi lưu dữ liệu' };
  }
}

export async function deleteDkChayAction(ids: string[]) {
  try {
    const today = getTodayKey();
    const success = await deleteRegistrationsByIds(ids, today);
    revalidatePath('/dk-chay');
    return { success, message: success ? 'Đã xóa đăng ký' : 'Lỗi khi xóa' };
  } catch (error) {
    console.error('Lỗi deleteDkChayAction:', error);
    return { success: false, message: 'Lỗi khi xóa' };
  }
}

export async function saveDkChayAction(registrations: any[]) {
  try {
    const today = getTodayKey();
    const success = await saveDkChayRegistrations(registrations, today);
    revalidatePath('/dk-chay');
    return { success, message: success ? 'Đã lưu danh sách' : 'Lỗi khi lưu' };
  } catch (error) {
    console.error('Lỗi saveDkChayAction:', error);
    return { success: false, message: 'Lỗi khi lưu danh sách' };
  }
}

