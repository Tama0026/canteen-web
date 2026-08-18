'use server';

import { revalidatePath } from 'next/cache';
import { 
  getDkChayRegistrations, 
  saveDkChayRegistrations,
  upsertSingleRegistration,
  deleteRegistrationsByIds
} from '@/lib/db';
import { getDkChaySessionDate } from '@/lib/menu-helpers';

export async function getDkChaySessionInfoAction() {
  return getDkChaySessionDate();
}

export async function getDkChayAction() {
  const session = getDkChaySessionDate();
  return await getDkChayRegistrations(session.dateKey);
}

export async function upsertDkChayAction(reg: { id: string; name: string; isLunch: boolean; isDinner: boolean }) {
  try {
    const session = getDkChaySessionDate();
    const success = await upsertSingleRegistration(reg, session.dateKey);
    revalidatePath('/dk-chay');
    return { success, message: success ? 'Đã lưu đăng ký' : 'Lỗi khi lưu' };
  } catch (error) {
    console.error('Lỗi upsertDkChayAction:', error);
    return { success: false, message: 'Lỗi khi lưu dữ liệu' };
  }
}

export async function deleteDkChayAction(ids: string[]) {
  try {
    const session = getDkChaySessionDate();
    const success = await deleteRegistrationsByIds(ids, session.dateKey);
    revalidatePath('/dk-chay');
    return { success, message: success ? 'Đã xóa đăng ký' : 'Lỗi khi xóa' };
  } catch (error) {
    console.error('Lỗi deleteDkChayAction:', error);
    return { success: false, message: 'Lỗi khi xóa' };
  }
}

export async function saveDkChayAction(registrations: any[]) {
  try {
    const session = getDkChaySessionDate();
    const success = await saveDkChayRegistrations(registrations, session.dateKey);
    revalidatePath('/dk-chay');
    return { success, message: success ? 'Đã lưu danh sách' : 'Lỗi khi lưu' };
  } catch (error) {
    console.error('Lỗi saveDkChayAction:', error);
    return { success: false, message: 'Lỗi khi lưu danh sách' };
  }
}

