'use server';

import { revalidatePath } from 'next/cache';
import { 
  getDkChayRegistrations, 
  saveDkChayRegistrations,
  upsertSingleRegistration,
  deleteRegistrationsByIds
} from '@/lib/db';

export async function getDkChayAction() {
  const today = new Date().toLocaleDateString('vi-VN');
  return await getDkChayRegistrations(today);
}

export async function upsertDkChayAction(reg: { id: string; name: string; isLunch: boolean; isDinner: boolean }) {
  const today = new Date().toLocaleDateString('vi-VN');
  const success = await upsertSingleRegistration(reg, today);
  revalidatePath('/dk-chay');
  return { success, message: success ? 'Đã lưu đăng ký' : 'Lỗi khi lưu' };
}

export async function deleteDkChayAction(ids: string[]) {
  const today = new Date().toLocaleDateString('vi-VN');
  const success = await deleteRegistrationsByIds(ids, today);
  revalidatePath('/dk-chay');
  return { success, message: success ? 'Đã xóa đăng ký' : 'Lỗi khi xóa' };
}

export async function saveDkChayAction(registrations: any[]) {
  const today = new Date().toLocaleDateString('vi-VN');
  const success = await saveDkChayRegistrations(registrations, today);
  revalidatePath('/dk-chay');
  return { success, message: success ? 'Đã lưu danh sách' : 'Lỗi khi lưu' };
}

