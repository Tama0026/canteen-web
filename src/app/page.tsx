import { getMenuAction } from '@/app/actions/menu-actions';
import ThanhMenu from '@/components/ThanhMenu';
import MenuDashboard from '@/components/MenuDashboard';

export const revalidate = 0; // Luôn lấy dữ liệu mới nhất từ DB khi refresh

export default async function HomePage() {
  const initialMenu = await getMenuAction();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <ThanhMenu />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
        <MenuDashboard initialMenu={initialMenu} />
      </main>
    </div>
  );
}
