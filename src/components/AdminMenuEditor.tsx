'use client';

import { useState } from 'react';
import { 
  FullMenuDatabase, 
  CycleKey, 
  ShiftKey, 
  MealTypeKey, 
  DayKey, 
  DAY_KEYS, 
  DAY_NAMES, 
  SHIFT_NAMES, 
  MEAL_TYPE_NAMES, 
  MenuItem 
} from '@/types/menu';
import { updateDishAction, importExcelMenuAction, resetMenuToDefaultAction } from '@/app/actions/menu-actions';
import { 
  Lock, 
  KeyRound, 
  Save, 
  Upload, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  FileSpreadsheet, 
  Sparkles,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface AdminMenuEditorProps {
  initialMenu: FullMenuDatabase;
}

export default function AdminMenuEditor({ initialMenu }: AdminMenuEditorProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Editor State
  const [menuData, setMenuData] = useState<FullMenuDatabase>(initialMenu);
  const [selectedCycle, setSelectedCycle] = useState<CycleKey>('cycle_1_3');
  const [selectedShift, setSelectedShift] = useState<ShiftKey>('morning');
  const [selectedMealType, setSelectedMealType] = useState<MealTypeKey>('regular');
  
  // UI Status State
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Handle PIN Unlock (default: 123456)
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.trim() === '123456' || pinCode.trim() === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Mã PIN không chính xác! (Mặc định: 123456)');
    }
  };

  // Handle Input Changes
  const handleInputChange = (day: DayKey, field: keyof MenuItem, value: string) => {
    setMenuData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next[selectedCycle][selectedShift][selectedMealType][day]) {
        next[selectedCycle][selectedShift][selectedMealType][day] = {
          mainDish1: '',
          mainDish2: '',
          sideDish: '',
          soup: '',
          dessert: '',
        };
      }
      next[selectedCycle][selectedShift][selectedMealType][day][field] = value;
      return next;
    });
  };

  // Save Single Day
  const handleSaveDay = async (day: DayKey) => {
    setIsSaving(true);
    setStatusMessage(null);
    const item = menuData[selectedCycle][selectedShift][selectedMealType][day];
    const res = await updateDishAction(selectedCycle, selectedShift, selectedMealType, day, item);
    setIsSaving(false);
    setStatusMessage({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  // Save All Days for Current Selection
  const handleSaveAllCurrent = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      for (const day of DAY_KEYS) {
        const item = menuData[selectedCycle][selectedShift][selectedMealType][day];
        await updateDishAction(selectedCycle, selectedShift, selectedMealType, day, item);
      }
      setIsSaving(false);
      setStatusMessage({
        type: 'success',
        text: `Đã lưu toàn bộ thực đơn ${selectedCycle === 'cycle_1_3' ? 'Tuần 1-3' : 'Tuần 2-4'} (${SHIFT_NAMES[selectedShift].vi} - ${MEAL_TYPE_NAMES[selectedMealType].vi}) vào Database!`,
      });
    } catch (err: any) {
      setIsSaving(false);
      setStatusMessage({ type: 'error', text: err?.message || 'Có lỗi khi lưu' });
    }
  };

  // Handle Excel Upload
  const handleExcelUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setStatusMessage({ type: 'error', text: 'Vui lòng chọn file Excel!' });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);
    const formData = new FormData();
    formData.append('excelFile', uploadFile);

    const res = await importExcelMenuAction(formData);
    setIsUploading(false);
    setStatusMessage({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });

    if (res.success) {
      // Reload page to refresh data
      window.location.reload();
    }
  };

  // Handle Reset to Default
  const handleResetToDefault = async () => {
    if (!confirm('Bạn có chắc chắn muốn khôi phục toàn bộ thực đơn về bản gốc ban đầu?')) {
      return;
    }
    setIsSaving(true);
    const res = await resetMenuToDefaultAction();
    setIsSaving(false);
    setStatusMessage({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
    if (res.success) {
      window.location.reload();
    }
  };

  // AUTH SCREEN
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Quản Trị Nhà Ăn
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Vui lòng nhập mã PIN bảo mật để chỉnh sửa thực đơn hoặc upload file Excel
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type="password"
                placeholder="Nhập mã PIN (Mặc định: 123456)"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            {authError && (
              <p className="text-xs text-red-500 font-semibold mt-2">{authError}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Mở Khóa Quản Trị
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại trang xem thực đơn
          </Link>
        </div>
      </div>
    );
  }

  // LOGGED-IN ADMIN CMS
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Xem trang Menu
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bảng Quản Trị Thực Đơn Nhà Ăn
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Chỉnh sửa món ăn trực tiếp hoặc upload file Excel mới lên Neon Postgres Database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefault}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-500" />
            <span>Khôi phục gốc</span>
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Alert Status Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* SECTION 1: EXCEL UPLOAD QUICK IMPORT */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-indigo-950/40 border border-blue-200/80 dark:border-indigo-800/40 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cập Nhật Nhanh Bằng File Excel (`Menu ăn trưa.xlsx`)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chọn file Excel có 2 sheet <code className="font-semibold text-indigo-600">TUẦN 1 - 3</code> và <code className="font-semibold text-indigo-600">TUẦN 2 - 4</code> để tự động ghi đè thực đơn vào Database
            </p>
          </div>
        </div>

        <form onSubmit={handleExcelUpload} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            className="w-full sm:w-auto flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 text-xs text-slate-600 dark:text-slate-300"
          />
          <button
            type="submit"
            disabled={!uploadFile || isUploading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Đang đọc file & lưu...' : 'Nạp File Excel Vào Hệ Thống'}</span>
          </button>
        </form>
      </div>

      {/* SECTION 2: INLINE FORM EDITOR */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Navigation Selector Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          {/* Cycle (Tuần 1-3 vs Tuần 2-4) */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              1. Chọn Chu Kỳ Tuần:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCycle('cycle_1_3')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCycle === 'cycle_1_3'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                TUẦN 1 - 3
              </button>
              <button
                type="button"
                onClick={() => setSelectedCycle('cycle_2_4')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCycle === 'cycle_2_4'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                TUẦN 2 - 4
              </button>
            </div>
          </div>

          {/* Shift (Ca Sáng vs Ca Chiều) */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              2. Chọn Ca Ăn:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedShift('morning')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedShift === 'morning'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Ca Sáng (Trưa)
              </button>
              <button
                type="button"
                onClick={() => setSelectedShift('afternoon')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedShift === 'afternoon'
                    ? 'bg-slate-800 text-white dark:bg-slate-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Ca Chiều (Tối)
              </button>
            </div>
          </div>

          {/* Meal Type (Món Mặn vs Món Chay) */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              3. Loại Món:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedMealType('regular')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedMealType === 'regular'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Món Mặn
              </button>
              <button
                type="button"
                onClick={() => setSelectedMealType('vegetarian')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedMealType === 'vegetarian'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Món Chay
              </button>
            </div>
          </div>
        </div>

        {/* Alternating Rule Tip Box */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Mẹo nhập món xen kẽ theo tuần:</strong> Nếu món ăn đổi theo tuần (ví dụ Tuần 1 ăn <em>Thịt ram</em>, Tuần 3 ăn <em>Thịt chiên</em>), bạn chỉ cần nhập dấu gạch chéo <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">Thịt ram/Chiên</code>. Hệ thống sẽ tự động tách món theo tuần!
          </div>
        </div>

        {/* Editable Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>Chỉnh sửa:</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {selectedCycle === 'cycle_1_3' ? 'Tuần 1 - 3' : 'Tuần 2 - 4'} • {SHIFT_NAMES[selectedShift].vi} • {MEAL_TYPE_NAMES[selectedMealType].vi}
              </span>
            </h4>

            <button
              type="button"
              onClick={handleSaveAllCurrent}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu tất cả thứ'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAY_KEYS.map((day) => {
              const currentItem = menuData[selectedCycle]?.[selectedShift]?.[selectedMealType]?.[day] || {
                mainDish1: '',
                mainDish2: '',
                sideDish: '',
                soup: '',
                dessert: '',
              };

              return (
                <div
                  key={day}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {DAY_NAMES[day].vi}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSaveDay(day)}
                      disabled={isSaving}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                    >
                      Lưu ngày này
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        Món chính 1 (Có thể dùng / để xen kẽ):
                      </label>
                      <input
                        type="text"
                        value={currentItem.mainDish1 || ''}
                        onChange={(e) => handleInputChange(day, 'mainDish1', e.target.value)}
                        placeholder="VD: Thịt ram/Chiên"
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        Món chính 2 (hoặc món phụ):
                      </label>
                      <input
                        type="text"
                        value={currentItem.mainDish2 || ''}
                        onChange={(e) => handleInputChange(day, 'mainDish2', e.target.value)}
                        placeholder="VD: Trứng luộc"
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        Món xào / Rau:
                      </label>
                      <input
                        type="text"
                        value={currentItem.sideDish || ''}
                        onChange={(e) => handleInputChange(day, 'sideDish', e.target.value)}
                        placeholder="VD: Rau cải xào"
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        Món Canh:
                      </label>
                      <input
                        type="text"
                        value={currentItem.soup || ''}
                        onChange={(e) => handleInputChange(day, 'soup', e.target.value)}
                        placeholder="VD: Canh chua"
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        Tráng miệng:
                      </label>
                      <input
                        type="text"
                        value={currentItem.dessert || ''}
                        onChange={(e) => handleInputChange(day, 'dessert', e.target.value)}
                        placeholder="VD: Trái cây"
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
