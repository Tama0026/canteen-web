'use server';

import { revalidatePath } from 'next/cache';
import { getDkChayRegistrations, saveDkChayRegistrations } from '@/lib/db';

export async function getDkChayAction() {
  const today = new Date().toLocaleDateString('vi-VN');
  return await getDkChayRegistrations(today);
}

export async function saveDkChayAction(registrations: any[]) {
  const today = new Date().toLocaleDateString('vi-VN');
  const success = await saveDkChayRegistrations(registrations, today);
  revalidatePath('/dk-chay');
  return { success, message: success ? 'Đã lưu danh sách' : 'Lỗi khi lưu' };
}
