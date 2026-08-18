import { getMenuAction } from '@/app/actions/menu-actions';
import ThanhMenu from '@/components/ThanhMenu';
import AdminMenuEditor from '@/components/AdminMenuEditor';

export const revalidate = 0;

export default async function AdminPage() {
  const initialMenu = await getMenuAction();

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <ThanhMenu />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <AdminMenuEditor initialMenu={initialMenu} />
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Canteen Admin CMS • Quản trị Nhà ăn</p>
          <p className="text-slate-400">Kết nối Neon Serverless PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
}
