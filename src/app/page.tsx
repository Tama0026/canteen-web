import { getMenuAction } from '@/app/actions/menu-actions';
import Navbar from '@/components/Navbar';
import MenuDashboard from '@/components/MenuDashboard';

export const revalidate = 0; // Luôn lấy dữ liệu mới nhất từ DB khi refresh

export default async function HomePage() {
  const initialMenu = await getMenuAction();

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <MenuDashboard initialMenu={initialMenu} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Canteen Menu System • Quản lý & Theo dõi Thực đơn Nhà ăn</p>
          <p className="text-slate-400">
            Hỗ trợ hiển thị Ca Sáng / Ca Chiều • Tự động xen kẽ Tuần 1-3 & Tuần 2-4
          </p>
        </div>
      </footer>
    </div>
  );
}
