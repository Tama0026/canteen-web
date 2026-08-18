import ThanhMenu from '@/components/ThanhMenu';
import DkChay from '@/components/DkChay';

export default function DkChayPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Navigation Header */}
      <ThanhMenu />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col">
        <DkChay />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Canteen Menu System • Quản lý & Theo dõi Thực đơn Nhà ăn</p>
          <p className="text-slate-400">
            Tính năng Đăng Ký Cơm Chay
          </p>
        </div>
      </footer>
    </div>
  );
}
